<<<<<<< Updated upstream
import { Board, Coordinate } from "../types/board";
import { positionIsOnBoard } from "./validation";
=======
import { Board, Position } from "../types/board";
import { positionIsPlayable } from "./validation";
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
 * Takes in a coordinate position of a penguin and a board state, and returns an arrayu of
 * all reachable positions from the given position (must be reachable via straight line,
 * cannot go through empty space)
=======
 * Takes in a Position position of a penguin and a board state, and returns an
 * array of all reachable positions from the given position (must be reachable
 * via straight line, cannot go through a hole).
>>>>>>> Stashed changes
 *
 * @param board board state to find reachable positions
 * @param position position to start from when finding reachable positions
 * @return an array of Positions representing positions reachable via a straight
 * line
 */
const getReachablePositions = (
  board: Board,
<<<<<<< Updated upstream
  position: Coordinate
): Array<Coordinate> => {
  const reachablePositions: Array<Coordinate> = [];

  for (const verticalDirection in VerticalDirection) {
    for (const horizontalDirection in HorizontalDirection) {
      const curReachableInDirection: Array<Coordinate> = getReachablePositionsInDirection(
=======
  position: Position
): Array<Position> => {
  const reachablePositions: Array<Position> = [];

  // For every direction which can be travelled, get the reachable positions
  // and accumulate them within reachablePositions.
  for (const verticalDirection in VerticalDirection) {
    for (const horizontalDirection in HorizontalDirection) {
      const curReachableInDirection: Array<Position> = getReachablePositionsInDirection(
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  position: Coordinate,
  verticalDirection: VerticalDirection,
  horizontalDirection: HorizontalDirection
): Array<Coordinate> => {
  const reachableTiles: Array<Coordinate> = [];
  let nextPosition: Coordinate = getNextPos(
=======
  position: Position,
  verticalDirection: VerticalDirection,
  horizontalDirection: HorizontalDirection
): Array<Position> => {
  const reachableTiles: Array<Position> = [];
  let nextPosition: Position = getNextPosition(
>>>>>>> Stashed changes
    position,
    verticalDirection,
    horizontalDirection
  );

<<<<<<< Updated upstream
  while (
    board.tiles[nextPosition.yPos][nextPosition.xPos].isActive &&
    positionIsOnBoard(board, nextPosition)
  ) {
    reachableTiles.push({ xPos: nextPosition.xPos, yPos: nextPosition.yPos });
    nextPosition = getNextPos(
=======
  // Keep moving in the given direction, accumulating positions so long as they
  // are playable.
  while (positionIsPlayable(board, nextPosition)) {
    reachableTiles.push({ col: nextPosition.col, row: nextPosition.row });
    nextPosition = getNextPosition(
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
const getNextPos = (
  position: Coordinate,
  verticalDirection: VerticalDirection,
  horizontalDirection: HorizontalDirection
): Coordinate => {
=======
const getNextPosition = (
  position: Position,
  verticalDirection: VerticalDirection,
  horizontalDirection: HorizontalDirection
): Position => {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
const getNextPosUpNeutral = (position: Coordinate): Coordinate => {
  return {
    xPos: position.xPos,
    yPos: position.yPos - 2,
=======
const getNextPosUpNeutral = (position: Position): Position => {
  return {
    col: position.col,
    row: position.row - 2,
>>>>>>> Stashed changes
  };
};

/**
 * From a given a position, get the next position moving in the up right
 * direction.
 *
 * @param position the position to increment from
 * @return the incremented Position
 */
<<<<<<< Updated upstream
const getNextPosUpRight = (position: Coordinate): Coordinate => {
  const xPosIsOdd: boolean = position.xPos % 2 === 1;
  const nextXPos: number = xPosIsOdd ? position.xPos + 1 : position.xPos;

  return {
    xPos: nextXPos,
    yPos: position.yPos - 1,
=======
const getNextPosUpRight = (position: Position): Position => {
  const colIsOdd: boolean = position.col % 2 === 1;
  const nextcol: number = colIsOdd ? position.col + 1 : position.col;

  return {
    col: nextcol,
    row: position.row - 1,
>>>>>>> Stashed changes
  };
};

/**
 * From a given a position, get the next position moving in the up left
 * direction.
 *
 * @param position the position to increment from
 * @return the incremented Position
 */
<<<<<<< Updated upstream
const getNextPosUpLeft = (position: Coordinate): Coordinate => {
  const xPosIsEven: boolean = position.xPos % 2 === 0;
  const nextXPos: number = xPosIsEven ? position.xPos - 1 : position.xPos;

  return {
    xPos: nextXPos,
    yPos: position.yPos - 1,
=======
const getNextPosUpLeft = (position: Position): Position => {
  const colIsEven: boolean = position.col % 2 === 0;
  const nextcol: number = colIsEven ? position.col - 1 : position.col;

  return {
    col: nextcol,
    row: position.row - 1,
>>>>>>> Stashed changes
  };
};

/**
 * From a given a position, get the next position moving in the down direction.
 *
 * @param position the position to increment from
 * @return the incremented Position
 */
<<<<<<< Updated upstream
const getNextPosDownNeutral = (position: Coordinate): Coordinate => {
  return {
    xPos: position.xPos,
    yPos: position.yPos + 2,
=======
const getNextPosDownNeutral = (position: Position): Position => {
  return {
    col: position.col,
    row: position.row + 2,
>>>>>>> Stashed changes
  };
};

/**
 * From a given a position, get the next position moving in the down right
 * direction.
 *
 * @param position the position to increment from
 * @return the incremented Position
 */
<<<<<<< Updated upstream
const getNextPosDownRight = (position: Coordinate): Coordinate => {
  const xPosIsOdd: boolean = position.xPos % 2 === 1;
  const nextXPos: number = xPosIsOdd ? position.xPos + 1 : position.xPos;

  return {
    xPos: nextXPos,
    yPos: position.yPos + 1,
=======
const getNextPosDownRight = (position: Position): Position => {
  const colIsOdd: boolean = position.col % 2 === 1;
  const nextcol: number = colIsOdd ? position.col + 1 : position.col;

  return {
    col: nextcol,
    row: position.row + 1,
>>>>>>> Stashed changes
  };
};

/**
 * From a given a position, get the next position moving in the down left
 * direction.
 *
 * @param position the position to increment from
 * @return the incremented Position
 */
<<<<<<< Updated upstream
const getNextPosDownLeft = (position: Coordinate): Coordinate => {
  const xPosIsEven: boolean = position.xPos % 2 === 0;
  const nextXPos: number = xPosIsEven ? position.xPos - 1 : position.xPos;

  return {
    xPos: nextXPos,
    yPos: position.yPos + 1,
=======
const getNextPosDownLeft = (position: Position): Position => {
  const colIsEven: boolean = position.col % 2 === 0;
  const nextcol: number = colIsEven ? position.col - 1 : position.col;

  return {
    col: nextcol,
    row: position.row + 1,
>>>>>>> Stashed changes
  };
};
