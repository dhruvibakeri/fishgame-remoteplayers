import { DIRECTIONS, MovementDirection } from "../../board";

/**
 * The order of directions to try and move in as part of the silly player
 * movement strategy defined within the assignment.
 */
const SillyStrategyDirections: Array<MovementDirection> = [
  DIRECTIONS.NORTH,
  DIRECTIONS.NORTHEAST,
  DIRECTIONS.SOUTHEAST,
  DIRECTIONS.SOUTH,
  DIRECTIONS.SOUTHWEST,
  DIRECTIONS.NORTHWEST,
];

export { SillyStrategyDirections };
