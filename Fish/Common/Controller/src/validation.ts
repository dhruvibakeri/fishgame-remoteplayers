// Helper functions for validating logic
import {
  InvalidGameStateError,
  InvalidPositionError,
  IllegalPenguinPositionError,
  UnreachablePositionError,
} from "../types/errors";
import { Player, Game } from "../../state";
import { Board, BoardPosition, Penguin, PenguinColor } from "../../board";
import { getReachablePositions } from "./movementChecking";

/**
 * Given a board and a position, determine whether that position is within the
 * boundaries of the board.
 *
 * @param board the board to be checking against
 * @param position the position to be checked
 * @return whether the given position is on the board
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
  let hasPenguinOnPosition = false;
  game.penguinPositions.forEach((penguin: Penguin, penguinPosition: BoardPosition) => {
    if (penguinPosition.row === position.row && penguinPosition.col === position.col) {
      hasPenguinOnPosition = true;
    }
  })
  return hasPenguinOnPosition;
}

/**
 * Given a board and a position, check if the position is on the board and not a hole
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

//TODO test
/**
 * Takes in a player and a game state, and checks if the player has at least one remaining
 * unplaced penguin in the given game state
 *
 * @param player player to check for remaining unplaced penguins
 * @param game game state to check for remaining penguins for given player
 * @returns true if player has at least one unplaced penguin, returns false if they do not
 */
const playerHasUnplacedPenguin = (player: Player, game: Game): boolean => {
  const remainingPenguins = game.remainingUnplacedPenguins.get(player);
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
 * @return the Penguin being moved if the move is valid or an error if not
 */
const validatePenguinMove = (
  game: Game,
  player: Player,
  startPosition: BoardPosition,
  endPosition: BoardPosition
):
  | Penguin
  | InvalidGameStateError
  | InvalidPositionError
  | IllegalPenguinPositionError => {
  // Verify that startPosition and endPosition are connected by a straight, uninterrupted line
  if (!pathIsPlayable(game, startPosition, endPosition)) {
    return new UnreachablePositionError(
      game,
      player,
      startPosition,
      endPosition
    );
  }

  // Verify that game has color mapping for player
  if (!game.playerToColorMapping.has(player)) {
    return new InvalidGameStateError(game);
  }

  // Verify that penguin exists at starting position
  if (!game.penguinPositions.has(startPosition)) {
    return new IllegalPenguinPositionError(
      game,
      player,
      startPosition,
      endPosition
    );
  }

  const penguinAtStart: Penguin | undefined = game.penguinPositions.get(
    startPosition
  );
  const penguinAtStartColor: PenguinColor | undefined =
    penguinAtStart && penguinAtStart.color;
  const playerColor: PenguinColor | undefined = game.playerToColorMapping.get(
    player
  );

  // Verify that player color and starting penguin color match
  if (playerColor !== penguinAtStartColor) {
    return new InvalidGameStateError(game);
  }

  return penguinAtStart || new InvalidGameStateError(game);
};

export {
  positionIsOnBoard,
  positionIsPlayable,
  isValidBoardSize,
  isValidMinimumOneFishTiles,
  pathIsPlayable,
  validatePenguinMove,
  playerHasUnplacedPenguin,
  isError,
};
