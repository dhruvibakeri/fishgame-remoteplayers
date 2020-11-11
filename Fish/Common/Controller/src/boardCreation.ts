import { Board, BoardPosition, Tile } from "../../board";
import {
  isValidBoardSize,
  positionIsOnBoard,
  isValidMinimumOneFishTiles,
} from "./validation";
import { IllegalBoardError, IllegalPositionError } from "../types/errors";
import { InputBoard } from "./testHarnessInput";
import { Result } from "true-myth";

const { ok, err } = Result;

const DEFAULT_FISH_PER_TILE = 1;

/**
 * Create a tile specifying its number of fish and whether it is active.
 *
 * @param numOfFish the number of fish on the tile, defaults to DEFAULT_FISH_PER_TILE
 * @return the created tile
 */
const createTile = (numOfFish: number = DEFAULT_FISH_PER_TILE): Tile => {
  return {
    numOfFish,
  };
};

/**
 * Get a tile at the specified position on the given board.
 *
 * @param board the board to get the tile from
 * @param position the position of the tile on the board
 * @return the tile at the given position on the given board or an error if the
 * position does not exist within the board boundaries
 */
const getTileOnBoard = (
  board: Board,
  position: BoardPosition
): Result<Tile, IllegalPositionError> => {
  if (!positionIsOnBoard(board, position)) {
    return err(new IllegalPositionError(board, position));
  } else {
    return ok(board.tiles[position.row][position.col]);
  }
};

/**
 * Set the properties of a tile at a given position on the given board.
 *
 * This maintains board immutability by creating a deep copy (Object.assign())
 * of the given board, changing the specified tile.
 * @param board board to be updated
 * @param position position of tile to be updated
 * @param numOfFish the number of fish on the updated tile, 0 for a hole
 * @return a new board with the updated tile or an error if the position is not
 * on the board.
 */
const setTileOnBoard = (
  board: Board,
  position: BoardPosition,
  numOfFish: number
): Result<Board, IllegalPositionError> =>
  getTileOnBoard(board, position).map(() => {
    return {
      tiles: Object.assign([], board.tiles, {
        [position.row]: Object.assign([], board.tiles[position.row], {
          [position.col]: createTile(numOfFish),
        }),
      }),
    };
  });

/**
 * Sets the tile at the given position on the given board to a hole.
 * In other terms, set the tile's number of fish to 0.
 *
 * @param board the board to remove from
 * @param position the position of the tile to remove
 * @return the resulting board or an error if the position does not exist on
 * the board.
 */
const setTileToHole = (
  board: Board,
  position: BoardPosition
): Result<Board, IllegalPositionError> => setTileOnBoard(board, position, 0);

/**
 * Deactivate tiles on the given board according to the given array of
 * specified positions for holes.
 *
 * @param board the board to be insert holes in
 * @param holePositions the positions of the holes to be added to the board
 * @return the resulting board with holes added or an InvalidPositionError if
 * one of the hole positions is not on the board.
 */
const addHolesToBoard = (
  board: Board,
  holePositions: Array<BoardPosition>
): Result<Board, IllegalPositionError> =>
  holePositions.reduce<Result<Board, IllegalPositionError>>(
    (acc: Result<Board, IllegalPositionError>, holePosition: BoardPosition) =>
      acc.andThen((board) => setTileToHole(board, holePosition)),
    ok(board)
  );

/**
 * Create a board of the given size, with all tiles active and containing the
 * given number of fish. Board size cannot exceed 25 tiles
 *
 * @param columns the number of columns for the created board
 * @param rows the number of rows for the created board
 * @param fishPerTile the number of fish to put on each tile
 * @returns a board with the given specifications for columns, rows, and fish
 * per tile
 */
const createBlankBoard = (
  rows: number,
  columns: number,
  fishPerTile: number
): Result<Board, IllegalBoardError> => {
  if (!isValidBoardSize(columns, rows) || rows * columns > 25) {
    return err(new IllegalBoardError(columns, rows));
  }

  const tiles: Array<Array<Tile>> = [];

  // For the specified number of rows and columns, create a 2D array of tiles.
  for (let row = 0; row < rows; row++) {
    tiles[row] = [];
    for (let col = 0; col < columns; col++) {
      tiles[row][col] = createTile(fishPerTile);
    }
  }

  return ok({ tiles });
};

/**
 * Create a board of the given size, creating holes at the specified
 * Positions and a minimum number of 1-fish tiles.
 *
 * @param columns the number of columns for the created board
 * @param rows the number of rows for the created board
 * @param holePositions Positions for spaces without a tile
 * @param minimumOneFishTiles minimum number of one-fish tiles on the board
 * @returns a board with the given specifications for columns, rows, holes, and
 * one-fish tiles.
 * If a given hole position is invalid or the minimum 1-fish tiles constraint
 * can't be met due to the number of holes added to the board, returns errors
 * for each case.
 */
const createHoledOneFishBoard = (
  columns: number,
  rows: number,
  holePositions: Array<BoardPosition>,
  minimumOneFishTiles: number
): Result<Board, IllegalBoardError | IllegalPositionError> => {
  if (
    !isValidMinimumOneFishTiles(
      columns,
      rows,
      holePositions,
      minimumOneFishTiles
    )
  ) {
    return err(
      new IllegalBoardError(
        columns,
        rows,
        holePositions.length,
        minimumOneFishTiles
      )
    );
  }

  // Try to create a board with holes at specified positions and a minimum
  // number of 1-fish tiles.
  return (createBlankBoard(rows, columns, DEFAULT_FISH_PER_TILE) as Result<
    Board,
    IllegalBoardError | IllegalPositionError
  >).flatMap((board: Board) => addHolesToBoard(board, holePositions));
};

/**
 * Create a Board given a rectangular, 2D array specifying the number of fish at the Tile at
 * each position. 0 fish on a tile represents a hole.
 * @param tileFish a 2D array specifying the number of fish at at the Tile at
 * each position
 * @return either created Board if successful or any error that occurred.
 */
const createNumberedBoard = (
  tileFish: InputBoard
): Result<Board, IllegalBoardError | IllegalPositionError> => {
  // Return an error of the board is empty.
  if (tileFish.length <= 0) {
    return err(new IllegalBoardError(0, 0));
  }

  // Find length of longest array of tiles, in case extra 0 tiles need to be added
  const maxRowLength = Math.max(
    ...tileFish.map((row: Array<number>) => row.length)
  );

  // Create the 2D array of tiles from the given InputBoard, padding any rows
  // shorter than the longest row.
  const tiles: Array<Array<Tile>> = tileFish.map((row: Array<number>) => {
    return row.map(numOfFish => ({ numOfFish }))
              .concat(new Array(maxRowLength - row.length).fill({ numOfFish: 0 }));
  });

  return ok({
    tiles,
  });
};

/**
 * Get the number of fish on the tile at the given position on the given board.
 *
 * @param board the board the tile is on
 * @param position the position of the tile
 * @return the number of fish on that tile
 */
const getFishNumberFromPosition = (
  board: Board,
  position: BoardPosition
): number =>
  getTileOnBoard(board, position)
    .map((tile: Tile) => tile.numOfFish)
    .unwrapOrElse(() => 0);

export {
  createHoledOneFishBoard,
  createBlankBoard,
  createTile,
  addHolesToBoard,
  setTileToHole,
  setTileOnBoard,
  getTileOnBoard,
  createNumberedBoard,
  getFishNumberFromPosition,
};
