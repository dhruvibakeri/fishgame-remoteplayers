import { createNumberedBoard } from "./boardCreation";
import { getReachablePositions } from "./movementChecking";
import { createTestGameState } from "./gameStateCreation";
import { BoardPosition } from "../../board";
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
  const board = createNumberedBoard(arrayBoard);
  const game = board.map((board) => createTestGameState(board));
  return game.mapOrElse(() => 0, game => {
    const startPosition: BoardPosition = {
      row: position[0],
      col: position[1],
    };
    const reachableTiles = getReachablePositions(game.unsafelyUnwrap(), startPosition);
    return reachableTiles.length;
  });
};

readStdin<InputBoardPosn>().then((parsed: InputBoardPosn) => {
  console.log(getNumReachableFromBoard(parsed.board, parsed.position));
});
