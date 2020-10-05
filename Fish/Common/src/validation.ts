// Helper functions for validating logic
import { Board, Coordinate } from "../types/board";
/**
 * Given a board and a position, determine whether that position is within the
 * boundaries of the board.
 * 
 * @param board the board to be checking against
 * @param position the position to be checked
 * @return whether the given position is on the board
 */
const positionIsOnBoard = (board: Board, position: Coordinate): boolean => {
    const boardRows = board.tiles.length;
    const boardCols = board.tiles[position.yPos].length;

    const isValidXPos = 0 <= position.xPos && position.xPos < boardCols;
    const isValidYPos = 0 <= position.yPos && position.yPos < boardRows;

    return isValidXPos && isValidYPos;
}

export {
    positionIsOnBoard
};