import { Board, BoardPosition, Tile } from "../types/board";
import {
  isValidBoardSize,
  positionIsOnBoard,
  isValidMinimumOneFishTiles,
  isError,
} from "./validation";
import {
  InvalidBoardConstraintsError,
  InvalidPositionError,
} from "../types/errors";

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
): Tile | InvalidPositionError => {
  if (!positionIsOnBoard(board, position)) {
    return new InvalidPositionError(board, position);
  } else {
    return board.tiles[position.row][position.col];
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
): Board | InvalidPositionError => {
  const currentTileOrError: Tile | InvalidPositionError = getTileOnBoard(
    board,
    position
  );

  if (isError(currentTileOrError)) {
    // The specified position is not on the board. Return the error.
    return currentTileOrError;
  } else {
    // Create a new tile, using the specified value for numOfFish.
    const newTile: Tile = createTile(
       numOfFish
    );

    // Copy the existing board, changing just the new tile.
    const newBoard = {
      tiles: Object.assign([], board.tiles, {
        [position.row]: Object.assign([], board.tiles[position.row], {
          [position.col]: newTile,
        }),
      }),
    };
    return newBoard;
  }
};

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
): Board | InvalidPositionError => setTileOnBoard(board, position, 0);

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
): Board | InvalidPositionError => {
  let currBoardOrError: Board | InvalidPositionError = board;

  // For each given hole position, attempt to add the hole to the board.
  for (const position of holePositions) {
    if (isError(currBoardOrError)) {
      // Stop trying if an error has occurred.
      break;
    } else {
      // If no error has occurred yet, try to add the next hole, storing the
      // resulting board or error.
      currBoardOrError = setTileToHole(currBoardOrError, position);
    }
  }

  return currBoardOrError;
};

/**
 * Create a board of the given size, with all tiles active and containing the
 * given number of fish.
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
): Board | InvalidBoardConstraintsError => {
  if (!isValidBoardSize(columns, rows)) {
    return new InvalidBoardConstraintsError(columns, rows);
  }

  const tiles: Array<Array<Tile>> = [];

  // For the specified number of rows and columns, create a 2D array of tiles.
  for (let row = 0; row < rows; row++) {
    tiles[row] = [];
    for (let col = 0; col < columns; col++) {
      tiles[row][col] = createTile(fishPerTile);
    }
  }

  return { tiles };
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
): Board | InvalidBoardConstraintsError | InvalidPositionError => {
  if (
    !isValidMinimumOneFishTiles(
      columns,
      rows,
      holePositions,
      minimumOneFishTiles
    )
  ) {
    return new InvalidBoardConstraintsError(
      columns,
      rows,
      holePositions.length,
      minimumOneFishTiles
    );
  }

  // Try to create a board with holes at specified positions and a minimum
  // number of 1-fish tiles.
  const blankBoardOrError = createBlankBoard(
    rows,
    columns,
    DEFAULT_FISH_PER_TILE
  );

  // Check if creating a board failed, returning the error if so.
  if (isError(blankBoardOrError)) {
    return blankBoardOrError;
  } else {
    // If creating the blank board succeeded, try to add holes to the board and
    // return the result.
    const boardWithHolesOrError: Board | InvalidPositionError = addHolesToBoard(
      blankBoardOrError,
      holePositions
    );
    return boardWithHolesOrError;
  }
};

/**
 * Create a Board given a rectangular, 2D array specifying the number of fish at the Tile at
 * each position. 0 fish on a tile represents a hole.
 * @param tileFish a 2D array specifying the number of fish at at the Tile at 
 * each position
 * @return either created Board if successful or any error that occurred.
 */
const createNumberedBoard = (tileFish: number[][]): Board | InvalidBoardConstraintsError | InvalidPositionError => {
  // Return an error of the board is empty.
  if (tileFish.length <= 0) {
    return new InvalidBoardConstraintsError(0, 0);
  }
  
  // Begin with a blank board the same size as the given 2D array.
  const blankBoard = createBlankBoard(tileFish.length, tileFish[0].length, 0);
  
  if (isError(blankBoard)) {
    return blankBoard;
  } else {
    let curBoard = blankBoard

    // For each given tile fish amount, set the corresponding Tile on the
    // created blank board to that fish amount.
    for (let row = 0; row < tileFish.length; row++) {
      for (let col = 0; col < tileFish[0].length; col++) {
        const setTileBoard = setTileOnBoard(curBoard, {row, col}, tileFish[row][col]);
        if (isError(setTileBoard)) {
          return setTileBoard;
        } else {
          curBoard = setTileBoard;
        }
      }
    }
    return curBoard;
  }
}

export {
  createHoledOneFishBoard,
  createBlankBoard,
  createTile,
  addHolesToBoard,
  setTileToHole,
  setTileOnBoard,
  getTileOnBoard,
  createNumberedBoard,
};
