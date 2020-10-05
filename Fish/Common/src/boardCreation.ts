import { Board, Coordinate, Tile } from "../types/board";

const DEFAULT_FISH_PER_TILE = 1;

/**
 * Create a board of the given size, creating holes at the specified
 * coordinates and a minimum number of 1-fish tiles if specified and
 * creating a blank board with a default number of fish per tile.
 *
 * @param columns the number of columns for the created board
 * @param rows the number of rows for the created board
 * @param holePositions coordinates for spaces without a tile
 * @param minimumOneFishTiles minimum number of one-fish tiles on the board
 * @returns a board with the given specifications for columns, rows, holes, and one-fish tiles
 */
const createHoledOneFishBoard = (
  columns: number,
  rows: number,
  holePositions?: Array<Coordinate>,
  minimumOneFishTiles?: number
): Board => {
  const blankBoard = createBlankBoard(columns, rows, DEFAULT_FISH_PER_TILE);

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

const createBlankBoard = (
  columns: number,
  rows: number,
  fishPerTile: number
): Board => {
  const tiles: Array<Array<Tile>> = [];

  for (var row: number; row < rows; row++) {
    for (var col: number; col < columns; col++) {
      tiles[row][col] = createTile(fishPerTile);
    }
  }

  return {
    tiles,
  };
};

const createTile = (numOfFish: number, isActive: boolean = true): Tile => {
  return {
    isActive,
    numOfFish,
  };
};

const addHolesToBoard = (
  board: Board,
  holePositions: Array<Coordinate>
): Board => holePositions.reduce(removeTile, board);

const removeTile = (board: Board, position: Coordinate): Board => {
  const disabledTile: Tile = {
    ...board[position.yPos][position.xPos],
    isActive: false,
  };

  return updateTileOnBoard(board, position, disabledTile);
};

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
): Board =>
  Object.assign([], board, {
    [position.yPos]: Object.assign([], board[position.yPos], {
      [position.xPos]: newTile,
    }),
  });
