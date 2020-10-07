import { Board, Position } from "../types/board";
import { positionIsPlayable } from "./validation";

/**
 * An enumeration describing the possible vertical directions in which a
 * penguin could move on the board.
 */
enum VerticalDirection {
  Up = "up",
  Down = "down",
}

/**
 * An enumeration describing the possible horizontal directions in which a
 * penguin could move on the board.
 */
enum HorizontalDirection {
  Right = "right",
  Left = "left",
  Neutral = "neutral",
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
  board: Board,
  position: Position
): Array<Position> => {
  const reachablePositions: Array<Position> = [];

  // For every direction which can be travelled, get the reachable positions
  // and accumulate them within reachablePositions.
  for (const verticalDirection in VerticalDirection) {
    for (const horizontalDirection in HorizontalDirection) {
      const curReachableInDirection: Array<Position> = getReachablePositionsInDirection(
        board,
        position,
        verticalDirection as VerticalDirection,
        horizontalDirection as HorizontalDirection
      );
      reachablePositions.concat(curReachableInDirection);
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
  board: Board,
  position: Position,
  verticalDirection: VerticalDirection,
  horizontalDirection: HorizontalDirection
): Array<Position> => {
  const reachableTiles: Array<Position> = [];
  let nextPosition: Position = getNextPosition(
    position,
    verticalDirection,
    horizontalDirection
  );

  // Keep moving in the given direction, accumulating positions so long as they
  // are playable.
  while (positionIsPlayable(board, nextPosition)) {
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
  position: Position,
  verticalDirection: VerticalDirection,
  horizontalDirection: HorizontalDirection
): Position => {
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
const getNextPosUpNeutral = (position: Position): Position => {
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
const getNextPosUpRight = (position: Position): Position => {
  const colIsOdd: boolean = position.col % 2 === 1;
  const nextcol: number = colIsOdd ? position.col + 1 : position.col;

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
const getNextPosUpLeft = (position: Position): Position => {
  const colIsEven: boolean = position.col % 2 === 0;
  const nextcol: number = colIsEven ? position.col - 1 : position.col;

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
const getNextPosDownNeutral = (position: Position): Position => {
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
const getNextPosDownRight = (position: Position): Position => {
  const colIsOdd: boolean = position.col % 2 === 1;
  const nextcol: number = colIsOdd ? position.col + 1 : position.col;

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
const getNextPosDownLeft = (position: Position): Position => {
  const colIsEven: boolean = position.col % 2 === 0;
  const nextcol: number = colIsEven ? position.col - 1 : position.col;

  return {
    col: nextcol,
    row: position.row + 1,
  };
};
