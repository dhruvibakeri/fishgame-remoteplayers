import { Board, Coordinate } from "../types/board"
import { positionIsOnBoard } from "./validation";

/**
 * An enumeration describing the possible vertical directions in which a
 * penguin could move on the board.
 */
enum VerticalDirection {
    Up = "up",
    Down = "down"
}

/**
 * An enumeration describing the possible horizontal directions in which a
 * penguin could move on the board.
 */
enum HorizontalDirection {
    Right = "right",
    Left = "left",
    Neutral = "neutral"
}

/**
 * Takes in a coordinate position of a penguin and a board state, and returns an arrayu of
 * all reachable positions from the given position (must be reachable via straight line,
 * cannot go through empty space)
 * 
 * @param board board state to find reachable positions
 * @param position position to start from when finding reachable positions
 * @returns an array of coordinates representing positions reachable via a straight line
 */
const getReachablePositions = (board: Board, position: Coordinate): Array<Coordinate> => {
    const reachablePositions: Array<Coordinate> = [];
    
    for (const verticalDirection in VerticalDirection) {
        for (const horizontalDirection in HorizontalDirection) {
            const curReachableInDirection: Array<Coordinate> = getReachablePositionsInDirection(board, position, verticalDirection as VerticalDirection, horizontalDirection as HorizontalDirection)
            reachablePositions.concat(curReachableInDirection)
        }
    }

    return reachablePositions;
}

/**
 * From a given a position, get all reachable positions in the given vertical 
 * and horizontal direction.
 * 
 * @param board the board being used
 * @param position the starting position
 * @param verticalDirection the vertical direction to move
 * @param horizontalDirection the horizontal direction to move
 * @returns an array containing all reachable positions from the given starting position in the given
 * vertical and horizontal direction
 */
const getReachablePositionsInDirection = (
    board: Board, 
    position: Coordinate, 
    verticalDirection: VerticalDirection, 
    horizontalDirection: HorizontalDirection
): Array<Coordinate> => {
    const reachableTiles: Array<Coordinate> = [];
    let nextPosition: Coordinate = getNextPos(position, verticalDirection, horizontalDirection);

    while (board.tiles[nextPosition.yPos][nextPosition.xPos].isActive && positionIsOnBoard(board, nextPosition)) {
        reachableTiles.push({ xPos: nextPosition.xPos, yPos: nextPosition.yPos });
        nextPosition = getNextPos(nextPosition, verticalDirection, horizontalDirection);
    }

    return reachableTiles;
}

/**
 * From a given a position, get the next position moving in the given vertical 
 * and horizontal direction.
 * 
 * @param position the starting position
 * @param verticalDirection the vertical direction to move
 * @param horizontalDirection the horizontal direction to move
 * @returns the next position from the given position in the given vertical and horizontal direction
 */
const getNextPos = (position: Coordinate, verticalDirection: VerticalDirection, horizontalDirection: HorizontalDirection): Coordinate => {
    if (verticalDirection === VerticalDirection.Up && horizontalDirection === HorizontalDirection.Neutral) {
        return getNextPosUpNeutral(position);
    } else if (verticalDirection === VerticalDirection.Up && horizontalDirection === HorizontalDirection.Right) {
        return getNextPosUpRight(position);
    } else if (verticalDirection === VerticalDirection.Up && horizontalDirection === HorizontalDirection.Left) {
        return getNextPosUpLeft(position);
    } else if (verticalDirection === VerticalDirection.Down && horizontalDirection === HorizontalDirection.Neutral) {
        return getNextPosDownNeutral(position);
    } else if (verticalDirection === VerticalDirection.Down && horizontalDirection === HorizontalDirection.Right) {
        return getNextPosDownRight(position);
    } else if (verticalDirection === VerticalDirection.Down && horizontalDirection === HorizontalDirection.Left) {
        return getNextPosDownLeft(position);
    }
}

// up, neutral: yPos -2, xPos 0
/**
 * From a given a position, get the next position moving in the up direction.
 * 
 * @param position the position to increment from
 * @returns the incremented coordinate
 */
const getNextPosUpNeutral = (position: Coordinate): Coordinate => {
    return {
        xPos: position.xPos,
        yPos: position.yPos - 2,
    };
}

// up, right: [if x is odd, xPos +1], yPos -1
/**
 * From a given a position, get the next position moving in the up right 
 * direction.
 * 
 * @param position the position to increment from
 * @return the incremented coordinate
 */
const getNextPosUpRight = (position: Coordinate): Coordinate => {
    const xPosIsOdd: boolean = position.xPos % 2 === 1;
    const nextXPos: number = xPosIsOdd ? position.xPos + 1 : position.xPos;
    
    return {
        xPos: nextXPos,
        yPos: position.yPos - 1,
    };
}

// up, left: [if x is even, xPos -1], yPos -1
/**
 * From a given a position, get the next position moving in the up left 
 * direction.
 * 
 * @param position the position to increment from
 * @return the incremented coordinate
 */
const getNextPosUpLeft = (position: Coordinate): Coordinate => {
    const xPosIsEven: boolean = position.xPos % 2 === 0;
    const nextXPos: number = xPosIsEven ? position.xPos - 1 : position.xPos;

    return {
        xPos: nextXPos,
        yPos: position.yPos - 1,
    };
}

// down, neutral: yPos +2, xPos 0
/**
 * From a given a position, get the next position moving in the down direction.
 * 
 * @param position the position to increment from
 * @return the incremented coordinate
 */
const getNextPosDownNeutral = (position: Coordinate): Coordinate => {
    return {
        xPos: position.xPos,
        yPos: position.yPos + 2,
    };
}

// down, right: [if x is odd, xPos +1], yPos +1
/**
 * From a given a position, get the next position moving in the down right 
 * direction.
 *
 * @param position the position to increment from
 * @return the incremented coordinate
 */
const getNextPosDownRight = (position: Coordinate): Coordinate => {
    const xPosIsOdd: boolean = position.xPos % 2 === 1;
    const nextXPos: number = xPosIsOdd ? position.xPos + 1 : position.xPos

    return {
        xPos: nextXPos,
        yPos: position.yPos + 1,
    };
}

// down, left: [if x is even, xPos -1], yPos +1
/**
 * From a given a position, get the next position moving in the down left
 * direction.
 *
 * @param position the position to increment from
 * @return the incremented coordinate
 */
const getNextPosDownLeft = (position: Coordinate): Coordinate => {
    const xPosIsEven: boolean = position.xPos % 2 === 0;
    const nextXPos: number = xPosIsEven ? position.xPos - 1 : position.xPos

    return {
        xPos: nextXPos,
        yPos: position.yPos + 1,
    };
}

