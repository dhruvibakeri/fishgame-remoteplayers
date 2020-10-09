// Helper functions for validating logic
import { Board, BoardPosition, Tile } from "../types/board";

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
 * Given a board and a position, determine whether a penguin can be placed on
 * that position on the board.
 *
 * @param board the board to be checking against
 * @param position the position to be checked
 * @return whether the given position is playable on the board
 */
const positionIsPlayable = (board: Board, position: BoardPosition): boolean =>
  positionIsOnBoard(board, position) &&
  !board.tiles[position.row][position.col].isHole;

/**
 * Typeguard for checking whether a given tile or error is a tile.
 *
 * @param tileOrError the given tile or error
 * @return whether the input is a tile
 */
const isTile = (tileOrError: Tile | Error): tileOrError is Tile => {
  const tile: Tile = tileOrError as Tile;
  return tile.isHole !== undefined && tile.numOfFish !== undefined;
};

/**
 * Typeguard for checking whether a given board or error is a board.
 *
 * @param tileOrError the given tile or error
 * @return whether the input is a tile
 */
const isBoard = (boardOrError: Board | Error): boardOrError is Board => {
  const board: Board = boardOrError as Board;
  return board.tiles !== undefined && Array.isArray(board.tiles);
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

export {
  positionIsOnBoard,
  positionIsPlayable,
  isTile,
  isBoard,
  isValidBoardSize,
  isValidMinimumOneFishTiles,
};
