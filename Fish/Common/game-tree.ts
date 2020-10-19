import { BoardPosition } from "./board";
import { Game } from "./state";

/**
 * A Movement represents a move by a Player of one of their Penguins from a
 * start position to an end position.
 *
 * @param startPosition the position from which this movement is made
 * @param endPosition the position to where this movement is made
 */
interface Movement {
  readonly startPosition: BoardPosition;
  readonly endPosition: BoardPosition;
}

/**
 * A LazyGameTree represents a function that will return a GameTree.
 * This is to be used in the context of a GameTree to provide a sort of lazy
 * evaluation in order to avoid needing to compute and contain an entire full
 * game tree.
 */
type LazyGameTree = () => GameTree;

/**
 * A GameTree represents an entire Fish game. In other words, it contains from
 * the first movement turn to when there are no more possible moves for any players,
 * all the possible moves and states within an entire game in a tree structure.
 *
 * The GameTree itself is a single node in this tree, containing the Game state at
 * that point and a mapping from each of the possible movements to be made by that
 * state's current player to a LazyGameTree, which represents the next GameTree
 * node from making that movement.
 * @param gameState the the state of the game at this node of the GameTree
 * @param potentialMoves a mapping of every possible Movement that the current
 * player of this Game state can make to the GameTree (lazily evaluated via a LazyGameTree)
 * that would result from making that move, containing the next GameState and set of
 * possible moves
 */
interface GameTree {
  readonly gameState: Game;
  readonly potentialMoves: Map<Movement, LazyGameTree>;
}

export { Movement, LazyGameTree, GameTree };
