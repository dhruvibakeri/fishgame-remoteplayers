import getStdin from "get-stdin";
import { PenguinColor } from "../../board";

/**
 * InputPosition represents the equivalent of a BoardPosition taken in as JSON
 * input into a testing harness. It uses the computer graphics coordinate system
 * to mark a position on a board.
 *
 * It follows the form: [row, col].
 */
type InputPosition = [number, number];

/**
 * InputBoard is a 2D array of numbers that represents the equivalent of a Board
 * taken in as JSON input into a test harness. Each element is either 0 or a
 * number between 1 and 5 signifying the number of fish on that respective tile
 * (0 representing a hole). The size of this board may not exceed 25 spots.
 */
type InputBoard = Array<Array<number>>;

/**
 * InputBoardPosn represents an input to the xboard test harness, containing a
 * representation of a Board along with a single InputPosition which indicates
 * a position on that board.
 *
 * @param position a position on the board representing a tile with at least one
 * fish on it.
 * @param board the InputBoard to be used in the testing harness
 */
interface InputBoardPosn {
  position: InputPosition;
  board: InputBoard;
}

/**
 * An InputState represents the form of an input to the xstate testing harness
 * as specified within the assignment. It encompasses a test input for a Game state.
 *
 * All penguins specified within their respective players must occupy distinct tiles
 * on the board.
 *
 * @param players an array of InputPlayers representing the players of this Game state
 * @param board a 2D array representing the board of this Game state
 */
interface InputState {
  readonly players: Array<InputPlayer>;
  readonly board: InputBoard;
}

/**
 * An InputPlayer represents the Player type for the xstate testing harness as
 * specified within the assignemnt.
 *
 * @param color the color of this player's penguins on the board
 * @param score how many fish this player has collected so far
 * @param places the positions (col, row) on the board where this player's penguins are located
 */
interface InputPlayer {
  readonly color: PenguinColor;
  readonly score: number;
  readonly places: Array<InputPosition>;
}

/**
 * Read and parse JSON input from STDIN
 */
const readStdin = async <T>(): Promise<T> => {
  const input: string = await getStdin();
  const parsed = JSON.parse(input);
  return parsed;
};

export {
  InputPosition,
  InputBoard,
  InputBoardPosn,
  InputState,
  InputPlayer,
  readStdin,
};