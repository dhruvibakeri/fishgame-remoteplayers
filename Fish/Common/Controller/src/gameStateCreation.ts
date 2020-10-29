import { Player, Game, MovementGame } from "../../state";
import { Board, BoardPosition, PenguinColor } from "../../board";
import {
  InvalidGameStateError,
  InvalidNumberOfPlayersError,
} from "../types/errors";
import { currentPlayerHasMoves } from "./validation";

const MAX_NUMBER_OF_PLAYERS = 4;
const MIN_NUMBER_OF_PLAYERS = 2;
const PENGUIN_AMOUNT_N = 6;

/**
 * Get the next player's index for the given game.
 *
 * @param game the game to get the next player's index from
 * @return the next player's index
 */
const getNextPlayerIndex = (game: Game): number =>
  (game.curPlayerIndex + 1) % game.players.length;

/**
 * Update the current player index of the given MovementGame to the that of the
 * next player who can make a movement, including the current player. In the
 * case of there being no more moves for any player, return the given state as
 * the final state. It is up to the caller to determine if the Game is the
 * final state.
 *
 * @param game the MovementGame to update
 * @return the MovementGame which either has its current player index to that
 * of the next player who can move, or the final state of the game of no
 * players can.
 */
const skipToNextActivePlayer = (game: MovementGame): MovementGame => {
  // For the given MovementGame, update the the current player index to that of
  // the next Player which has a potential move, using a playersSeen counter to
  // prevent infinite recursion.
  const skipToNextActivePlayerRecursive = (
    movementGame: MovementGame,
    playersSeen: number
  ): MovementGame => {
    // There are no more potential moves for any players. Return the final state.
    if (playersSeen >= game.players.length) {
      return game;
    }

    // Determine whether the current player has any moves they can possibly make.
    const currentPlayerCanMove = currentPlayerHasMoves(movementGame);

    // If the current player can move, return the MovementGame with them as the
    // current player. Otherwise check the next player.
    if (currentPlayerCanMove) {
      return movementGame;
    } else {
      const nextPlayerGame: MovementGame = {
        ...movementGame,
        curPlayerIndex: getNextPlayerIndex(movementGame),
      };
      return skipToNextActivePlayerRecursive(nextPlayerGame, playersSeen + 1);
    }
  };

  return skipToNextActivePlayerRecursive(game, 0);
};

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
  const numPenguins: number = PENGUIN_AMOUNT_N - players.length;
  for (const player of players) {
    unplacedPenguins.set(player.color, numPenguins);
  }

  return unplacedPenguins;
};

/**
 * Create an empty penguin position mapping from player colors to arrays of
 * positions for the given array of players, setting each of their arrays of
 * positions to empty.
 *
 * @param players the array of players to create a penguin position mapping for
 * @return the empty penguin position mapping.
 */
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
 * Create an empty scoresheet mapping from player colors to scores for the
 * given array of players, setting each of their scores to 0.
 *
 * @param players the array of players to create a scoresheet for
 * @return the scoresheet mapping
 */
const createEmptyScoreSheet = (
  players: Array<Player>
): Map<PenguinColor, number> => {
  const playerColorToZero: Array<[
    PenguinColor,
    number
  ]> = players.map((player: Player) => [player.color, 0]);
  return new Map(playerColorToZero);
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
): Game | InvalidNumberOfPlayersError | InvalidGameStateError => {
  // Error check whether the number of players given is valid.
  if (
    players.length < MIN_NUMBER_OF_PLAYERS ||
    players.length > MAX_NUMBER_OF_PLAYERS
  ) {
    return new InvalidNumberOfPlayersError(players.length);
  }

  // Error check that all player colors are unique
  if (new Set(players.map((player) => player.color)).size !== players.length) {
    return new InvalidGameStateError();
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

/**
 * Creates a sample game state with the given board FOR TESTING PURPOSES
 *
 * @param board board to use for game state creation
 */
const createTestGameState = (
  board: Board
): Game | InvalidNumberOfPlayersError | InvalidGameStateError => {
  const samplePlayer1: Player = { name: "foo", color: PenguinColor.Black };
  const samplePlayer2: Player = { name: "bar", color: PenguinColor.Brown };
  const samplePlayers: Array<Player> = [samplePlayer1, samplePlayer2];
  const game:
    | Game
    | InvalidNumberOfPlayersError
    | InvalidGameStateError = createGameState(samplePlayers, board);
  return game;
};

export {
  MAX_NUMBER_OF_PLAYERS,
  MIN_NUMBER_OF_PLAYERS,
  PENGUIN_AMOUNT_N,
  getNextPlayerIndex,
  createGameState,
  createTestGameState,
  createEmptyScoreSheet,
  createEmptyPenguinPositions,
  buildUnplacedPenguinMap,
  skipToNextActivePlayer,
};
