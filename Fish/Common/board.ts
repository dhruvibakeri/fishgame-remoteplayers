/**
 * A Tile represents a single tile within a Board with a number of fish on it.
 * If there are 0 fish on the Tile, then it is a hole.
 *
 * It contains:
 * numOfFish - The number of fish on this tile
 */
export interface Tile {
  readonly numOfFish: number;
}

/**
 * A Board is 2D array of Tiles representing the entire board within a Fish game.
 * The position of each Tile within the game is represented by its index within
 * the 2D array, in row-column order.
 *
 * It contains:
 * tiles - the 2D array of Tiles
 *
 * The 2D array maps to a hexagonal board as described in Matthias' comment under
 * this Piazza post https://piazza.com/class/kevisd7ggfb502?cid=143.
 *
 * For example, a single column of tiles is indexed like so in (row, col):
 * (0, 0)
 *       (1, 0)
 * (2, 0)
 *       (3, 0)
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

/**
 * An enumeration describing the possible vertical directions in which a
 * penguin could move on the board.
 */
export enum VerticalDirection {
  Up = "Up",
  Down = "Down",
}

/**
 * An enumeration describing the possible horizontal directions in which a
 * penguin could move on the board.
 */
export enum HorizontalDirection {
  Right = "Right",
  Left = "Left",
  Neutral = "Neutral",
}
