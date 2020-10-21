import { Player, Game } from "../../state";
import { Board, BoardPosition, PenguinColor } from "../../board";
import { InvalidNumberOfPlayersError } from "../types/errors";

const MAX_NUMBER_OF_PLAYERS = 4;
const MIN_NUMBER_OF_PLAYERS = 2;

// TODO test
/**
 * Get the next player's index for the given game.
 *
 * @param game the game to get the next player's index from
 * @return the next player's index
 */
const getNextPlayerIndex = (game: Game): number =>
  (game.curPlayerIndex + 1) % game.players.length;

/**
 * Creates a mapping from the given array of Players to their initial amount of
 * unplaced penguins for initial game state. Adds 6 - players.length penguins for each player.
 * @param players Array of players for which to create penguins
 * @return Array of penguins. Contains 6 - players.length penguins of each color in playerToColorMapping
 */
const buildUnplacedPenguinMap = (
  players: Array<Player>
): Map<PenguinColor, number> => {
  const unplacedPenguins: Map<PenguinColor, number> = new Map();
  const numPenguins: number = 6 - players.length;
  for (const player of players) {
    unplacedPenguins.set(player.color, numPenguins);
  }

  return unplacedPenguins;
};

/**
 * Create a new Game state given an array of Players and a created board.
 *
 * @param players the array of Players playing this game
 * @param board the board to be played on within this game
 * @return The new game state with given player and board
 */
const createGameState = (
  players: Array<Player>,
  board: Board
): Game | InvalidNumberOfPlayersError => {
  // Error check whether the number of players given is valid.
  if (
    players.length < MIN_NUMBER_OF_PLAYERS ||
    players.length > MAX_NUMBER_OF_PLAYERS
  ) {
    return new InvalidNumberOfPlayersError(players.length);
  }

  return {
    players,
    board,
    curPlayerIndex: 0,
    penguinPositions: createEmptyPenguinPositions(players),
    remainingUnplacedPenguins: buildUnplacedPenguinMap(players),
    scores: createEmptyScoreSheet(players),
  };
};

// TODO test
const createEmptyScoreSheet = (
  players: Array<Player>
): Map<PenguinColor, number> => {
  const playerColorToZero: Array<[
    PenguinColor,
    number
  ]> = players.map((player: Player) => [player.color, 0]);
  return new Map(playerColorToZero);
};

// TODO
const createEmptyPenguinPositions = (
  players: Array<Player>
): Map<PenguinColor, Array<BoardPosition>> => {
  const playerColorToEmpty: Array<[
    PenguinColor,
    Array<BoardPosition>
  ]> = players.map((player: Player) => [player.color, []]);
  return new Map(playerColorToEmpty);
};

/**
 * Creates a sample game state with the given board FOR TESTING PURPOSES
 *
 * @param board board to use for game state creation
 */
const createTestGameState = (
  board: Board
): Game | InvalidNumberOfPlayersError => {
  const samplePlayer1: Player = { name: "foo", color: PenguinColor.Black };
  const samplePlayer2: Player = { name: "bar", color: PenguinColor.Brown };
  const samplePlayers: Array<Player> = [samplePlayer1, samplePlayer2];
  const game: Game | InvalidNumberOfPlayersError = createGameState(
    samplePlayers,
    board
  );
  return game;
};

export {
  MAX_NUMBER_OF_PLAYERS,
  getNextPlayerIndex,
  createGameState,
  createTestGameState,
  createEmptyScoreSheet,
  createEmptyPenguinPositions,
  buildUnplacedPenguinMap,
};
