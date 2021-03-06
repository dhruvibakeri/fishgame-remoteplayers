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
  Red = "Red",
  White = "White",
  Brown = "Brown",
  Black = "Black",
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

/**
 * MovementDirection represents a valid direction of a movement within a Fish
 * game, taking into account its hexagonal board layout. A movement may be
 * desribed as the union of a vertical direciton and a horizontal direction,
 * ultimately pointing the direction of a movement orthogonal to any of the
 * sides on a hexagon.
 *
 * @param verticalDirection the vertical direction of this movement
 * @param horizontalDirection the horizontal direction of this movement
 */
export interface MovementDirection {
  readonly verticalDirection: VerticalDirection;
  readonly horizontalDirection: HorizontalDirection;
}

/**
 * The following constants denote the six possible directions to possibly move
 * in within a fish game on a hexagonal board, represented as MovementDirections.
 */
export const DIRECTIONS = {
  NORTH: {
    verticalDirection: VerticalDirection.Up,
    horizontalDirection: HorizontalDirection.Neutral,
  },

  NORTHEAST: {
    verticalDirection: VerticalDirection.Up,
    horizontalDirection: HorizontalDirection.Right,
  },

  SOUTHEAST: {
    verticalDirection: VerticalDirection.Down,
    horizontalDirection: HorizontalDirection.Right,
  },

  SOUTH: {
    verticalDirection: VerticalDirection.Down,
    horizontalDirection: HorizontalDirection.Neutral,
  },

  SOUTHWEST: {
    verticalDirection: VerticalDirection.Down,
    horizontalDirection: HorizontalDirection.Left,
  },

  NORTHWEST: {
    verticalDirection: VerticalDirection.Up,
    horizontalDirection: HorizontalDirection.Left,
  },
};
