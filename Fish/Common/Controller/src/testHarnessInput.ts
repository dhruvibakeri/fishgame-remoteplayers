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
  readonly position: InputPosition;
  readonly board: InputBoard;
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
 * A MoveResponseQuery represents an input into the xtree testing harness.
 * It describes the current state and the move that the currently active player
 * has picked.
 *
 * The object is then invalid if the specified move is illegal in the given
 * state.
 *
 * @param state the game state from which this move is being made
 * @param from the position from which the current player of the given state
 * wishes to move/where their avatar is located
 * @param to the position where the current player of the given state wishes
 * to move their avatar to.
 */
interface MoveResponseQuery {
  readonly state: InputState;
  readonly from: InputPosition;
  readonly to: InputPosition;
}

/**
 * An Action is constructed in response to a MoveResponseQuery, and represents
 * either what action the next player can take to move one of their penguins to
 * a place that neighbors the destination of the previous player's move as
 * outlined in the MoveResponseQuery.
 *
 * If Action = false, then the desired move from the query is not possible.
 * If Action = [InputPosition, InputPosition], then such a move is possible and
 * the array describes the opponent's move from the first position to the second.
 */
type Action = false | [InputPosition, InputPosition];

/**
 * InputDepth represents the depth to explore a GameTree to find the best possible
 * move for that depth. The depth can either be 1 or 2, to avoid excessively
 * long test runtimes.
 */
type InputDepth = 1 | 2;

/**
 * InputDepthState represents a Game State and a depth to explore. The InputState represents
 * the Game state to create a GameTree from, and the InputDepth is the depth at which
 * to explore the generated GameTree for a best move.
 */
type InputDepthState = [InputDepth, InputState];

/**
 * Read and parse JSON input from STDIN.
 *
 * @return a Promise containing the parsed JSON
 */
const readStdin = async <T>(): Promise<T> => {
  const input: string = await getStdin();
  const parsed: T = JSON.parse(input);
  return parsed;
};

export {
  InputPosition,
  InputBoard,
  InputBoardPosn,
  InputState,
  InputPlayer,
  MoveResponseQuery,
  Action,
  InputDepth,
  InputDepthState,
  readStdin,
};
