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
  getWinners,
  getLosers,
} from "./referee";
import {
  IllegalBoardError,
  IllegalGameStateError,
  IllegalTournamentError,
} from "../types/errors";
import {
  TournamentObserver,
  TournamentDebrief,
  RoundResults,
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
 * Given a pool of unassigned players, try and assign all of the players into
 * parties and return this assignment.
 *
 * The way this handles remainders is by first backtracking to the last assigned
 * party, unassigning the las assiged player, and then trying to assign the
 * remaining unassigned players with a new maximal size decremented by 1.
 *
 * @param tournamentPool the pool of players to assign in ascending order of age
 * @return an array of arrays of TournamentPlayers where each nested array is
 * a single game party
 */
const assignParties = (
  tournamentPool: Array<TournamentPlayer> // Non empty
): Array<Array<TournamentPlayer>> => {
  const assignPartiesRecursive = (
    tournamentPool: Array<TournamentPlayer>,
    maximalSize: number,
    parties: Array<Array<TournamentPlayer>>
  ): Array<Array<TournamentPlayer>> => {
    if (tournamentPool.length > maximalSize) {
      const party = tournamentPool.slice(0, maximalSize);
      const remainder = tournamentPool.slice(maximalSize);
      return assignPartiesRecursive(remainder, maximalSize, [
        ...parties,
        party,
      ]);
    } else if (tournamentPool.length > 1) {
      return [...parties, tournamentPool];
    } else {
      // Add the last game back to the unassigned pool and try to
      // match them with a maximalSize decremented by 1.
      const lastParty = parties.pop();
      const pool = [...lastParty, ...tournamentPool];
      return assignPartiesRecursive(pool, maximalSize - 1, parties);
    }
  };

  if (tournamentPool.length > 1) {
    return assignPartiesRecursive(tournamentPool, MAX_NUMBER_OF_PLAYERS, []);
  } else {
    return [];
  }
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
 * Creates a mapping of a player's name to their TournamentPlayerWithAge
 * representation. This uses the indexes of the players (in the provided array)
 * to represent the age of the players.
 *
 * @param players the array of players to make a mapping out of.
 */
const makeTournamentPlayerMapping = (
  players: Array<TournamentPlayer>
): Map<string, TournamentPlayerWithAge> => {
  return new Map(
    players.map((tp: TournamentPlayer, index) => [
      tp.name,
      { ...tp, age: index } as TournamentPlayerWithAge,
    ])
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
 * @return an array containing the players who have survived this round.
 */
const runTournamentRound = async (
  tournamentPool: Array<TournamentPlayer>,
  boardParameters: BoardParameters
): Promise<RoundResults> => {
  const sortByAge = (
    tp1: TournamentPlayerWithAge,
    tp2: TournamentPlayerWithAge
  ) => tp1.age - tp2.age;
  const deleteAge = (tp: TournamentPlayerWithAge): TournamentPlayer => {
    const res = { ...tp };
    delete res["age"];
    return res as TournamentPlayer;
  };
  const tournamentMapping: Map<
    string,
    TournamentPlayerWithAge
  > = makeTournamentPlayerMapping(tournamentPool);
  const games = assignAndRunGames(tournamentPool, boardParameters);
  const results = await Promise.all(games);
  const winners = results
    .reduce((acc, gd: GameDebrief) => acc.concat(getWinners(gd)), [])
    .map((value: ActivePlayer) => tournamentMapping.get(value.name))
    .sort(sortByAge)
    .map(deleteAge);
  const losers = results
    .reduce((acc, gd: GameDebrief) => acc.concat(getLosers(gd)), [])
    .map((value: ActivePlayer) => tournamentMapping.get(value.name))
    .sort(sortByAge)
    .map(deleteAge);
  return [winners, losers];
};

/**
 * Informs players whether or not they have won a tournament. If a player
 * has won the tournament, they are part of the winners array, otherwise they
 * are listed in the players array alongside the winners.
 *
 * @param winners the list of players who won the tournament
 * @param losers the list of players who lost the tournament
 * @return the list of winners who ACCEPTED the results of the tournament.
 */
const informWinnersAndLosers = async (
  winners: Array<TournamentPlayer>,
  losers: Array<TournamentPlayer>
): Promise<Array<TournamentPlayer>> => {
  const players = [...winners, ...losers];
  const finalWinners: Array<TournamentPlayer> = [];
  await Promise.all(
    players.map((tp) => {
      const hasWon = winners.findIndex((win) => win.name === tp.name) !== -1;
      return (
        timeoutRequest(tp.wonTournament(hasWon), PLAYER_REQUEST_TIMEOUT)
          .then((v) => hasWon && v && finalWinners.push(tp))
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          .catch((err) => {})
      );
    })
  );
  return finalWinners;
};

// TODO
const notifyPlayersTournamentStarting = (
  tournamentPlayers: Array<TournamentPlayer>,
  hasTournamentStarted : boolean
): void => {
  for (const player of tournamentPlayers) {
    player.tournamentIsStarting(hasTournamentStarted);
  }
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
  IllegalBoardError | IllegalGameStateError | IllegalTournamentError
> => {
  // Check board size.
  if (!boardIsBigEnough(LARGEST_BOARD_PLAYER_AMT, boardParameters)) {
    return err(
      new IllegalBoardError(boardParameters.cols, boardParameters.rows)
    );
  } else if (tournamentPlayers.length < 2) {
    return err(new IllegalTournamentError(boardParameters, tournamentPlayers));
  }

  notifyPlayersTournamentStarting(tournamentPlayers, true)

  return ok(
    new Promise(async (resolve) => {
      let previousPoolLength = 0;
      let loserPool: Array<TournamentPlayer> = [];
      let tournamentPool: Array<TournamentPlayer> = tournamentPlayers;
      while (continueTournament(tournamentPool.length, previousPoolLength)) {
        previousPoolLength = tournamentPool.length;
        let losers;
        [tournamentPool, losers] = await runTournamentRound(
          tournamentPool,
          boardParameters
        );
        loserPool = loserPool.concat(losers);
      }

      // Inform players of the last game they have won (or lost)
      const informedWinners = await informWinnersAndLosers(
        tournamentPool,
        loserPool
      );

      resolve({ winners: informedWinners.map((tp) => tp.name) });
    })
  );
};

export {
  continueTournament,
  assignParties,
  assignAndRunGames,
  runTournament,
  runTournamentRound,
  informWinnersAndLosers,
  makeTournamentPlayerMapping,
};
