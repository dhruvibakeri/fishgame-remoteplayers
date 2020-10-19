import { createNumberedBoard } from "./boardCreation";
import { getReachablePositions } from "./movementChecking";
import { isError } from "./validation";
import { createTestGameState } from "./gameStateCreation";
import { Game } from "../../state";
import { BoardPosition, Board } from "../../board";
import {
  InvalidNumberOfPlayersError,
  InvalidBoardConstraintsError,
  InvalidPositionError,
} from "../types/errors";
import { InputBoardPosn, readStdin } from "./testHarnessInput";

/**
 * Takes in a 2D array of numbers, which represents the numbe of fish on each tile of a board game, and
 * a starting position, and returns the number of reachable tiles from the starting tile in the given array ("board")
 *
 * @param arrayBoard array of numbers representing number of fish on game board tiles
 * @param position position representing start position to search for number of reachable tiles
 */
const getNumReachableFromBoard = (
  arrayBoard: number[][],
  position: number[]
): number => {
  const board:
    | Board
    | InvalidBoardConstraintsError
    | InvalidPositionError = createNumberedBoard(arrayBoard);

  // Ensure board is not error when creating game from board
  if (!isError(board)) {
    const game: Game | InvalidNumberOfPlayersError = createTestGameState(board);
    // Ensure game is not error when finding reachable positions
    if (!isError(game)) {
      const startPosition: BoardPosition = {
        row: position[0],
        col: position[1],
      };
      const reachableTiles = getReachablePositions(game, startPosition);
      return reachableTiles.length;
    }
    return 0;
  }
  return 0;
};

readStdin<InputBoardPosn>().then((parsed: InputBoardPosn) => {
  console.log(getNumReachableFromBoard(parsed.board, parsed.position));
});
