import {
  TournamentPlayer,
  TournamentPlayerWithAge,
  GameDebrief,
  ActivePlayer,
} from "../../player-interface";
import {
  boardIsBigEnough,
  BoardParameters,
  timeoutRequest,
  PLAYER_REQUEST_TIMEOUT,
  runGame,
} from "./referee";
import { IllegalBoardError, IllegalGameStateError } from "../types/errors";
import {
  TournamentObserver,
  TournamentDebrief,
} from "../../../Admin/manager-interface";
import {
  MAX_NUMBER_OF_PLAYERS,
  MIN_NUMBER_OF_PLAYERS,
} from "./gameStateCreation";
import { Result } from "true-myth";
const { err, ok } = Result;

/**
 * The maximum possible number of placements in a game happens when there are
 * 3 players, which would yield 9 total placements. Since a
 * tournament can run games anywhere from 2 to 4 players, it must accommodate
 * the largest possible amount of placements.
 */
const LARGEST_BOARD_PLAYER_AMT = 3;

/**
 * Given a current pool of players representing the winners of the previously
 * run round and the length of the pool of winners from the round before that,
 * determine whether the tournament will continue to another round.
 *
 * @param currentPoolLength the length of the current pool of players who won the
 * previous round
 * @param previousPoolLength the length of the pool of winning players two
 * rounds prior
 * @return whether the tournament will continue to another round
 */
const continueTournament = (
  currentPoolLength: number,
  previousPoolLength: number
): boolean => {
  // Do the previous pool and the current pool have the same length?
  const sameWinnersForTwoRounds = currentPoolLength === previousPoolLength;

  // Are there too few players for a single game?
  const tooFewPlayersForAGame = currentPoolLength < MIN_NUMBER_OF_PLAYERS;

  return !(sameWinnersForTwoRounds || tooFewPlayersForAGame);
};

/**
 * Given a pool of unassigned players and a maximal game size to try and assign
 * to, assign all of the players into parties and return this assignment.
 *
 * The way this handles remainders is by first backtracking to the last assigned
 * party, unassigning the las assiged player, and then trying to assign the
 * remaining unassigned players with a new maximal size decremented by 1.
 *
 * @param tournamentPool the pool of players to assign in ascending order of age
 * @param maximalSize the maximal size of each party to attempt to assign as
 * many games to
 * @return an array of arrays of TournamentPlayers where each nested array is
 * a single game party
 */
const assignParties = (
  tournamentPool: Array<TournamentPlayer>, // Non empty
  maximalSize: number = MAX_NUMBER_OF_PLAYERS
): Array<Array<TournamentPlayer>> => {
  // TODO error check maximal size? or just specify bounds in purpose statement.
  let unassignedPool = [...tournamentPool];
  const parties: Array<Array<TournamentPlayer>> = [];

  // Take as many maximal groups as possible.
  while (unassignedPool.length >= maximalSize) {
    const party = unassignedPool.slice(0, maximalSize);
    unassignedPool = unassignedPool.slice(maximalSize);

    parties.push(party);
  }

  // Handle remainders if there are any..
  if (unassignedPool.length > 0) {
    // If parties were assigned, unassign the players from the last one
    if (parties.length > 0) {
      const lastAssignedPlayers: Array<TournamentPlayer> = parties.pop();
      unassignedPool = [...lastAssignedPlayers, ...unassignedPool];
    }

    // Try assigning the rest of the players with a smaller maximal size.
    return parties.concat(assignParties(unassignedPool, maximalSize - 1));
  }

  return parties;
};

/**
 * Assign the given pool of players to games and run each game with its own referee.
 *
 * @param tournamentPool the pool of all tournament players playing this round
 * @param boardParameters the specifications for the boards for each game
 * @return an array of Promises representing the results of running each game
 */
const assignAndRunGames = (
  tournamentPool: Array<TournamentPlayer>,
  boardParameters: BoardParameters
): Array<Promise<GameDebrief>> => {
  // Divide the pool into individual parties for each game.
  const parties: Array<Array<TournamentPlayer>> = assignParties(tournamentPool);

  // Create a referee and run each game.
  // These games can be unsafely unwrapped since the manager maintains the
  // constraints on the size of the board making sure that the given
  // specifications must be valid for any size game.
  const games: Array<Promise<
    GameDebrief
  >> = parties
    .map((party: Array<TournamentPlayer>) => runGame(party, boardParameters))
    .map((result) => result.unsafelyUnwrap());

  return games;
};

/**
 * Given the specifications for boards, an array of participating players
 * sorted in ascending order of age, and an array of tournament observers,
 * run an entire tournament, producing either the winners of the successfully
 * run tournament, or an error if one occurred.
 *
 * @param boardParameters the specifications for the boards to be used in the
 * tournament
 * @param tournamentPlayers the participating TournamentPlayers sorted in
 * ascending order of age
 * @param observers any watching observers of the tournament, as of now this
 * is optional and unused as there has been no requirement for their implementation.
 * @return the outcome of the tournament or an error
 */
const runTournament = (
  boardParameters: BoardParameters,
  tournamentPlayers: Array<TournamentPlayer>,
  observers?: Array<TournamentObserver>
): Result<
  Promise<TournamentDebrief>,
  IllegalBoardError | IllegalGameStateError
> => {
  // Check board size.
  if (!boardIsBigEnough(LARGEST_BOARD_PLAYER_AMT, boardParameters)) {
    return err(
      new IllegalBoardError(boardParameters.cols, boardParameters.rows)
    );
  }

  return ok(
    new Promise(async (resolve) => {
      let previousPool: Array<TournamentPlayer> = [];
      let tournamentPool: Array<TournamentPlayer> = tournamentPlayers;
      const tournamentMapping: Map<string, TournamentPlayerWithAge> = new Map(
        tournamentPlayers.map((tp: TournamentPlayer, index) => [
          tp.name,
          { ...tp, age: index } as TournamentPlayerWithAge,
        ])
      );

      while (continueTournament(tournamentPool.length, previousPool.length)) {
        previousPool = tournamentPool;
        tournamentPool = await runTournamentRound(
          tournamentPool,
          boardParameters,
          tournamentMapping
        );
      }

      // Inform players of the last game they have won (or lost)
      const informedWinners = await informWinnersAndLosers(
        previousPool,
        tournamentPool
      );

      resolve({ winners: informedWinners.map((tp) => tp.name) });
    })
  );
};

/**
 * Given the pool of participating players, the board specifications,
 * and a mapping containing every player in the tournament's name to
 * their TournamentPlayer, run a single round of the tournament.
 *
 * @param tournamentPool the pool of active players who will play
 * in this round
 * @param boardParameters the specifications for the boards for each game
 * @param tournamentMapping a mapping for every player in the entire
 * tournament (active or inactive) from their name to their TournamentPlayer
 * @return an array containing
 */
const runTournamentRound = async (
  tournamentPool: Array<TournamentPlayer>,
  boardParameters: BoardParameters,
  tournamentMapping: Map<string, TournamentPlayerWithAge>
): Promise<Array<TournamentPlayerWithAge>> => {
  const sortByAge = (
    tp1: TournamentPlayerWithAge,
    tp2: TournamentPlayerWithAge
  ) => tp1.age - tp2.age;
  const games = assignAndRunGames(tournamentPool, boardParameters);
  const results = await Promise.all(games);
  return results
    .reduce((acc, gd: GameDebrief) => acc.concat(gd.activePlayers), [])
    .map((value: ActivePlayer) => tournamentMapping.get(value.name))
    .sort(sortByAge);
};

/**
 * Informs players whether or not they have won a tournament. If a player
 * has won the tournament, they are part of the winners array, otherwise they
 * are listed in the players array alongside the winners.
 *
 * @param players the list of remaining active players that were able to participate in final round of tournament
 * @param winners the list of players who won the tournament
 * @return the list of winners who ACCEPTED the results of the tournament.
 */
const informWinnersAndLosers = async (
  players: Array<TournamentPlayer>,
  winners: Array<TournamentPlayer>
): Promise<Array<TournamentPlayer>> => {
  if (players.length === 0) {
    return winners;
  }

  const finalWinners: Array<TournamentPlayer> = [];
  await Promise.all(
    players.map((tp) => {
      const hasWon = winners.findIndex((win) => win.name === tp.name) !== -1;
      return timeoutRequest(
        tp.wonTournament(hasWon),
        PLAYER_REQUEST_TIMEOUT
      ).then((v) => v && finalWinners.push(tp));
    })
  );
  return finalWinners;
};

export {
  continueTournament,
  assignParties,
  assignAndRunGames,
  runTournament,
  runTournamentRound,
  informWinnersAndLosers,
};
