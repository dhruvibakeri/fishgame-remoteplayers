// Helper functions for validating logic
import { IllegalMovementError } from "../types/errors";
import { Player, Game, getCurrentPlayerColor, MovementGame } from "../../state";
import { Board, BoardPosition, PenguinColor } from "../../board";
import { getReachablePositions } from "./movementChecking";
import { positionsAreEqual } from "./penguinPlacement";
import { InputState, InputPlayer } from "./testHarnessInput";
import {
  MIN_NUMBER_OF_PLAYERS,
  MAX_NUMBER_OF_PLAYERS,
} from "./gameStateCreation";
import { Result } from "true-myth";
const { ok, err } = Result;

const MAX_TEST_HARNESS_BOARD_TILES = 25;

/**
 * Given a board and a position, determine whether that position is within the
 * boundaries of the board.
 *
 * @param board the board to be checking against
 * @param position the position to be checked
 * @returns whether the given position is on the board
 */
const positionIsOnBoard = (board: Board, position: BoardPosition): boolean => {
  const boardRows = board.tiles.length;
  const boardCols = board.tiles[0].length;

  const isValidRow = 0 <= position.row && position.row < boardRows;
  const isValidCol = 0 <= position.col && position.col < boardCols;

  return isValidRow && isValidCol;
};

/**
 * Checks if there is a penguin at the given position in the given game.
 * @param game Game to check position for penguin
 * @param position Position to check for penguin
 * @returns True if there is a penguin at the given position, false if not
 */
const hasPenguinOnPosition = (game: Game, position: BoardPosition): boolean => {
  return Array.from(
    game.penguinPositions
  ).some(([, positions]: [PenguinColor, Array<BoardPosition>]) =>
    positions.some((playerPosition: BoardPosition) =>
      positionsAreEqual(position, playerPosition)
    )
  );
};

/**
 * Given a board and a position, check if the position is on the board, is not a hole,
 * and doesn't have another penguin on it.
 *
 * @param board the board to be checking against
 * @param position the position to be checked
 * @return whether the given position is playable on the board
 */
const positionIsPlayable = (game: Game, position: BoardPosition): boolean => {
  return (
    positionIsOnBoard(game.board, position) &&
    game.board.tiles[position.row][position.col].numOfFish > 0 &&
    !hasPenguinOnPosition(game, position)
  );
};

/**
 * Determine whether the given dimensions for a board are valid.
 *
 * @param columns the number of columns in the board
 * @param rows the number of rows in the board
 */
const isValidBoardSize = (columns: number, rows: number): boolean => {
  return columns > 0 && rows > 0;
};

/**
 * Determine whether the given minimum number of 1-fish tiles is valid relative
 * to the given board dimensions and hole positions.
 *
 * @param columns the number of columns for the created board
 * @param rows the number of rows for the created board
 * @param holePositions Positions for spaces without a tile
 * @param minimumOneFishTiles minimum number of one-fish tiles on the board
 */
const isValidMinimumOneFishTiles = (
  columns: number,
  rows: number,
  holePositions: Array<BoardPosition>,
  minimumOneFishTiles: number
): boolean => {
  // If upon creating the specified holes in the board, there are no longer
  // enough remaining tiles to meet the minimum number of 1-fish tiles,
  // return an error.
  const numberOfTilesAfterAddingHoles: number =
    rows * columns - holePositions.length;
  return (
    minimumOneFishTiles > 0 &&
    numberOfTilesAfterAddingHoles >= minimumOneFishTiles
  );
};

/**
 * Typeguard for checking whether the given parameter is an Error.
 *
 * @param anything the input to check against
 * @return whether the input is an error
 */
// disable warning about using `any` type
// eslint-disable-next-line
const isError = (anything: any): anything is Error => {
  const error: Error = anything as Error;
  return error.message !== undefined && error.name !== undefined;
};

/**
 * Determine whether the given end position is reachable from the given start position on the given Board.
 * Starting position must be on board and end position must be playable
 *
 * @param board
 * @param startPosition
 * @param endPosition
 */
const pathIsPlayable = (
  game: Game,
  startPosition: BoardPosition,
  endPosition: BoardPosition
): boolean => {
  // Verify that the start position is on the board.
  if (!positionIsOnBoard(game.board, startPosition)) {
    return false;
  }

  //Verify that the end position is playable
  if (!positionIsPlayable(game, endPosition)) {
    return false;
  }

  return (
    getReachablePositions(game, startPosition).filter(
      (position: BoardPosition) =>
        position.col === endPosition.col && position.row === endPosition.row
    ).length > 0
  );
};

/**
 * Takes in a player and a game state, and checks if the player has at least one remaining
 * unplaced penguin in the given game state
 *
 * @param player player to check for remaining unplaced penguins
 * @param game game state to check for remaining penguins for given player
 * @returns true if player has at least one unplaced penguin, returns false if they do not
 */
const playerHasUnplacedPenguin = (player: Player, game: Game): boolean => {
  const remainingPenguins = game.remainingUnplacedPenguins.get(player.color);
  return remainingPenguins ? remainingPenguins > 0 : false;
};

/**
 * Determine if the given Player may move one of its Penguins on a starting
 * position to a given end position on the board of the given Game state.
 *
 * @param game the Game state
 * @param player the Player moving its Penguin
 * @param endPosition the Player's Penguin's end position after the move
 * @param startPosition the Player's Penguin's current position, not required if
 * penguin is being placed on the board before game starts
 * @return true or an error corresponding to the invalidity of the move
 */
const validatePenguinMove = (
  game: MovementGame,
  player: Player,
  startPosition: BoardPosition,
  endPosition: BoardPosition
): Result<MovementGame, IllegalMovementError> => {
  // Verify that startPosition and endPosition are connected by a straight, uninterrupted line
  if (!pathIsPlayable(game, startPosition, endPosition)) {
    return err(
      new IllegalMovementError(
        game,
        player,
        startPosition,
        endPosition,
        "Start and end positions do not form a straight, uninterrupted path."
      )
    );
  }

  // Verify that the player has a penguin exists at starting position
  const playerHasPenguinAtStartPosition = (
    game.penguinPositions.get(player.color) || []
  ).some((position: BoardPosition) =>
    positionsAreEqual(position, startPosition)
  );

  if (!playerHasPenguinAtStartPosition) {
    return err(
      new IllegalMovementError(
        game,
        player,
        startPosition,
        endPosition,
        "Player does not have a penguin placed at start position."
      )
    );
  }

  // Verify that the player trying to move is the current player
  if (player.color !== getCurrentPlayerColor(game)) {
    return err(
      new IllegalMovementError(
        game,
        player,
        startPosition,
        endPosition,
        "Player attempting to play out of turn."
      )
    );
  }

  return ok(game);
};

/**
 * Determine whether the given InputState is valid, meaning that:
 * - it has a valid number of players
 * - the player colors are unique
 * - the number of tiles is under 25 and both dimensions are greater than 0
 *
 * @param inputState the InputState to verify
 * @return whether the inputState is valid
 */
const isValidInputState = (inputState: InputState): boolean => {
  // Validate the number of players.
  const validNumberOfPlayers =
    MIN_NUMBER_OF_PLAYERS <= inputState.players.length &&
    inputState.players.length <= MAX_NUMBER_OF_PLAYERS;

  // Validate the player colors are unique.
  const distinctColors: Set<PenguinColor> = new Set(
    inputState.players.map((inputPlayer: InputPlayer) => inputPlayer.color)
  );
  const colorsAreUnique = distinctColors.size == inputState.players.length;

  // Validate number of board tiles.
  const longestRowLength = Math.max(
    ...inputState.board.map((row: Array<number>) => row.length)
  );
  const numberOfTiles = longestRowLength * inputState.board.length;
  const validNumberOfTiles = numberOfTiles <= MAX_TEST_HARNESS_BOARD_TILES;
  const validBoardSize =
    isValidBoardSize(longestRowLength, inputState.board.length) &&
    validNumberOfTiles;

  return validNumberOfPlayers && colorsAreUnique && validBoardSize;
};

/**
 * Determine if the current Player of the given MovementGame has any potential
 * moves.
 *
 * @param movementGame the MovementGame to check.
 * @return whether the MovementGame's current player has any remaining moves
 */
const currentPlayerHasMoves = (movementGame: MovementGame): boolean => {
  const curPlayerPenguins = movementGame.penguinPositions.get(
    getCurrentPlayerColor(movementGame)
  ) as BoardPosition[];
  const reachablePositions = curPlayerPenguins.map(
    (penguinPosition: BoardPosition) =>
      getReachablePositions(movementGame, penguinPosition)
  );
  const hasMoves = reachablePositions.some(
    (reachablePositionsFromMove: Array<BoardPosition>) =>
      reachablePositionsFromMove.length > 0
  );
  return hasMoves;
};

export {
  positionIsOnBoard,
  hasPenguinOnPosition,
  positionIsPlayable,
  isValidBoardSize,
  isValidMinimumOneFishTiles,
  pathIsPlayable,
  validatePenguinMove,
  playerHasUnplacedPenguin,
  isError,
  isValidInputState,
  currentPlayerHasMoves,
};
