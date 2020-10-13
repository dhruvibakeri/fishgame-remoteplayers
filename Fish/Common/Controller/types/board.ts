/**
 * A Tile represents a single tile within a Board.
 * 
 * It contains:
 * isHole    - whether this Tile is a hole
 * numOfFish - The number of fish on this tile
 */
export interface Tile {
  readonly isHole: boolean;
  readonly numOfFish: number;
}

/**
 * A Board is 2D array of Tiles representing the entire board within a Fish game.
 * The position of each Tile within the game is represented by its index within 
 * the 2D array, in col-row order.
 * 
 * It contains:
 * tiles - the 2D array of Tiles
 */
export interface Board {
  readonly tiles: Array<Array<Tile>>;
}

/**
 * A BoardPosition represents the row and column position of an entity within a Board.
 * 
 * It contains: 
 * row - the row coordinate
 * col - the column coordinate
 */
export interface BoardPosition {
  readonly row: number;
  readonly col: number;
}

/**
 * A PenguinColor represents an enumeration of all the acceptable colors of a Penguin 
 * avatar in the game of Fish.
 */
export enum PenguinColor {
  Red = "red",
  White = "white",
  Brown = "brown",
  Black = "black",
}

/**
 * A Penguin represents a single avatar within a Fish game. 
 * 
 * It contains:
 * color - the PenguinColor of this avatar
 */
export interface Penguin {
  readonly color: PenguinColor;
}
