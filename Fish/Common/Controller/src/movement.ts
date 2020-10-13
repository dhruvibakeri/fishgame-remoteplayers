import { Board, BoardPosition } from "../types/board";
import { Game } from "../types/state";
import { positionIsPlayable } from "./validation";

/**
 * An enumeration describing the possible vertical directions in which a
 * penguin could move on the board.
 */
enum VerticalDirection {
  Up = "Up",
  Down = "Down",
}

/**
 * An enumeration describing the possible horizontal directions in which a
 * penguin could move on the board.
 */
enum HorizontalDirection {
  Right = "Right",
  Left = "Left",
  Neutral = "Neutral",
}

/**
 * Takes in a Position position of a penguin and a board state, and returns an
 * array of all reachable positions from the given position (must be reachable
 * via straight line, cannot go through a hole).
 *
 * @param board board state to find reachable positions
 * @param position position to start from when finding reachable positions
 * @return an array of Positions representing positions reachable via a straight
 * line
 */
const getReachablePositions = (
  game: Game,
  position: BoardPosition
): Array<BoardPosition> => {
  let reachablePositions: Array<BoardPosition> = [];

  // For every direction which can be travelled, get the reachable positions
  // and accumulate them within reachablePositions.
  for (const verticalDirection in VerticalDirection) {
    for (const horizontalDirection in HorizontalDirection) {
      const curReachableInDirection: Array<BoardPosition> = getReachablePositionsInDirection(
        game,
        position,
        verticalDirection as VerticalDirection,
        horizontalDirection as HorizontalDirection
      );
      reachablePositions = reachablePositions.concat(curReachableInDirection);
    }
  }

  return reachablePositions;
};

/**
 * From a given a position, get all reachable positions in the given vertical
 * and horizontal direction.
 *
 * @param board the board being used
 * @param position the starting position
 * @param verticalDirection the vertical direction to move
 * @param horizontalDirection the horizontal direction to move
 * @return an array containing all reachable positions from the given starting position in the given
 * vertical and horizontal direction
 */
const getReachablePositionsInDirection = (
  game: Game,
  position: BoardPosition,
  verticalDirection: VerticalDirection,
  horizontalDirection: HorizontalDirection
): Array<BoardPosition> => {
  const reachableTiles: Array<BoardPosition> = [];
  let nextPosition: BoardPosition = getNextPosition(
    position,
    verticalDirection,
    horizontalDirection
  );

  // Keep moving in the given direction, accumulating positions so long as they
  // are playable.
  while (positionIsPlayable(game, nextPosition)) {
    reachableTiles.push({ col: nextPosition.col, row: nextPosition.row });
    nextPosition = getNextPosition(
      nextPosition,
      verticalDirection,
      horizontalDirection
    );
  }

  return reachableTiles;
};

/**
 * From a given a position, get the next position moving in the given vertical
 * and horizontal direction.
 *
 * @param position the starting position
 * @param verticalDirection the vertical direction to move
 * @param horizontalDirection the horizontal direction to move
 * @return the next position from the given position in the given vertical and horizontal direction
 */
const getNextPosition = (
  position: BoardPosition,
  verticalDirection: VerticalDirection,
  horizontalDirection: HorizontalDirection
): BoardPosition => {
  if (
    verticalDirection === VerticalDirection.Up &&
    horizontalDirection === HorizontalDirection.Neutral
  ) {
    return getNextPosUpNeutral(position);
  } else if (
    verticalDirection === VerticalDirection.Up &&
    horizontalDirection === HorizontalDirection.Right
  ) {
    return getNextPosUpRight(position);
  } else if (
    verticalDirection === VerticalDirection.Up &&
    horizontalDirection === HorizontalDirection.Left
  ) {
    return getNextPosUpLeft(position);
  } else if (
    verticalDirection === VerticalDirection.Down &&
    horizontalDirection === HorizontalDirection.Neutral
  ) {
    return getNextPosDownNeutral(position);
  } else if (
    verticalDirection === VerticalDirection.Down &&
    horizontalDirection === HorizontalDirection.Right
  ) {
    return getNextPosDownRight(position);
  } else if (
    verticalDirection === VerticalDirection.Down &&
    horizontalDirection === HorizontalDirection.Left
  ) {
    return getNextPosDownLeft(position);
  }
};

/**
 * From a given a position, get the next position moving in the up direction.
 *
 * @param position the position to increment from
 * @return the incremented Position
 */
const getNextPosUpNeutral = (position: BoardPosition): BoardPosition => {
  return {
    col: position.col,
    row: position.row - 2,
  };
};

/**
 * From a given a position, get the next position moving in the up right
 * direction.
 *
 * @param position the position to increment from
 * @return the incremented Position
 */
const getNextPosUpRight = (position: BoardPosition): BoardPosition => {
  const rowIsOdd: boolean = position.row % 2 === 1;
  const nextcol: number = rowIsOdd ? position.col + 1 : position.col;

  return {
    col: nextcol,
    row: position.row - 1,
  };
};

/**
 * From a given a position, get the next position moving in the up left
 * direction.
 *
 * @param position the position to increment from
 * @return the incremented Position
 */
const getNextPosUpLeft = (position: BoardPosition): BoardPosition => {
  const rowIsEven: boolean = position.row % 2 === 0;
  const nextcol: number = rowIsEven ? position.col - 1 : position.col;

  return {
    col: nextcol,
    row: position.row - 1,
  };
};

/**
 * From a given a position, get the next position moving in the down direction.
 *
 * @param position the position to increment from
 * @return the incremented Position
 */
const getNextPosDownNeutral = (position: BoardPosition): BoardPosition => {
  return {
    col: position.col,
    row: position.row + 2,
  };
};

/**
 * From a given a position, get the next position moving in the down right
 * direction.
 *
 * @param position the position to increment from
 * @return the incremented Position
 */
const getNextPosDownRight = (position: BoardPosition): BoardPosition => {
  const rowIsOdd: boolean = position.row % 2 === 1;
  const nextcol: number = rowIsOdd ? position.col + 1 : position.col;

  return {
    col: nextcol,
    row: position.row + 1,
  };
};

/**
 * From a given a position, get the next position moving in the down left
 * direction.
 *
 * @param position the position to increment from
 * @return the incremented Position
 */
const getNextPosDownLeft = (position: BoardPosition): BoardPosition => {
  const rowIsEven: boolean = position.row % 2 === 0;
  const nextcol: number = rowIsEven ? position.col - 1 : position.col;

  return {
    col: nextcol,
    row: position.row + 1,
  };
};

export {
  getReachablePositions,
  getReachablePositionsInDirection,
  getNextPosition,
  getNextPosUpNeutral,
  getNextPosUpRight,
  getNextPosUpLeft,
  getNextPosDownNeutral,
  getNextPosDownRight,
  getNextPosDownLeft,
};
