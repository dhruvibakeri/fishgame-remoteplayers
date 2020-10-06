import { Board, Coordinate, Tile } from "../types/board";
import { positionIsOnBoard } from "./validation";
import {
  InvalidBoardConstraintsError,
  InvalidPositionError,
} from "../types/errors";

const DEFAULT_FISH_PER_TILE = 1;

/**
 * Set a tile at a given position on the given board to the given tile.
 *
 * This maintains board immutability by creating a deep copy (Object.assign())
 * of the given board, changing the specified tile.
 * @param board board to be updated
 * @param position position of tile to be updated
 * @param newTile new tile to replace tile on board at given position
 */
const updateTileOnBoard = (
  board: Board,
  position: Coordinate,
  newTile: Tile
): Board => {
  return {
    tiles: Object.assign([], board.tiles, {
      [position.yPos]: Object.assign([], board.tiles[position.yPos], {
        [position.xPos]: newTile,
      }),
    })};
}
  

/**
 * Remove/deactivate the tile at the given position on the given board.
 *
 * @param board the board to remove from
 * @param position the position of the tile to remove
 * @return the resulting board or an error if the position does not exist on
 * the board.
 */
const removeTile = (
  board: Board,
  position: Coordinate
): Board | InvalidPositionError => {
  if (!positionIsOnBoard(board, position)) {
    return new InvalidPositionError(board, position);
  }

  const disabledTile: Tile = {
    ...board.tiles[position.yPos][position.xPos],
    isActive: false,
  };

  return updateTileOnBoard(board, position, disabledTile);
};

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
  holePositions: Array<Coordinate>
): Board | InvalidPositionError => {
  let currBoardOrError: Board | InvalidPositionError = board;

  for (const position of holePositions) {
    if (currBoardOrError instanceof InvalidPositionError) {
      break;
    } else {
      currBoardOrError = removeTile(currBoardOrError, position);
    }
  }

  return currBoardOrError;
};

/**
 * Create a tile specifying its number of fish and whether it is active.
 *
 * @param numOfFish the number of fish on the tile
 * @param isActive whether the tile is active, defaulting to true
 * @return the created tile
 */
const createTile = (numOfFish: number, isActive = true): Tile => {
  return {
    isActive,
    numOfFish,
  };
};

/**
 * Create a board of the given size, with all tiles active and containing the given number of fish
 *
 * @param columns the number of columns for the created board
 * @param rows the number of rows for the created board
 * @param fishPerTile the number of fish to put on each tile
 * @returns a board with the given specifications for columns, rows, and fish per tile
 */
const createBlankBoard = (
  columns: number,
  rows: number,
  fishPerTile: number
): Board => {
  const tiles: Array<Array<Tile>> = [];

  for (let row = 0; row < rows; row++) {
    tiles[row] = [];
    for (let col = 0; col < columns; col++) {
      tiles[row][col] = createTile(fishPerTile);
    }
  }

  return {
    tiles,
  };
};

/**
 * Create a board of the given size, creating holes at the specified
 * coordinates and a minimum number of 1-fish tiles if specified and
 * creating a blank board with a default number of fish per tile.
 *
 * @param columns the number of columns for the created board
 * @param rows the number of rows for the created board
 * @param holePositions coordinates for spaces without a tile
 * @param minimumOneFishTiles minimum number of one-fish tiles on the board
 * @returns a board with the given specifications for columns, rows, holes, and one-fish tiles.
 * If a given hole position is invalid or the minimum 1-fish tiles constraint
 * can't be met due to the number of holes added to the board, returns errors
 * for each case.
 */
const createHoledOneFishBoard = (
  columns: number,
  rows: number,
  holePositions?: Array<Coordinate>,
  minimumOneFishTiles?: number
): Board | InvalidBoardConstraintsError | InvalidPositionError => {
  const blankBoard = createBlankBoard(columns, rows, DEFAULT_FISH_PER_TILE);

  // If upon creating the specified holes in the board, there are no longer
  // enough remaining tiles to meet the minimum number of 1-fish tiles,
  // return an error.
  if (
    holePositions &&
    minimumOneFishTiles &&
    rows * columns - holePositions.length < minimumOneFishTiles
  ) {
    throw new InvalidBoardConstraintsError(
      columns,
      rows,
      holePositions.length,
      minimumOneFishTiles
    );
  }

  if (!holePositions || !minimumOneFishTiles) {
    // Create a blank board with no holes and the same default number of fish
    // on each tile.
    return blankBoard;
  }

  // Create a board with holes at specified positions and a minimum number of
  // 1-fish tiles.
  const boardWithHoles = addHolesToBoard(blankBoard, holePositions);
  return boardWithHoles;
};

export { createHoledOneFishBoard };
