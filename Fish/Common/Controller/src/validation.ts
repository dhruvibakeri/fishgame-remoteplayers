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
  const boardCols = board.tiles[position.row].length;

  const isValidcol = 0 <= position.col && position.col < boardCols;
  const isValidrow = 0 <= position.row && position.row < boardRows;

  return isValidcol && isValidrow;
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

export { positionIsOnBoard, positionIsPlayable, isTile, isBoard };
