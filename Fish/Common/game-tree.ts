import { BoardPosition } from "./board";
import { MovementGame } from "./state";

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
 * A PotentialMovement represents a potential move from a Game state and all
 * possible moves from that point. It is made up of an action and the results
 * and a tree of results from that action, which is not evaluated until called.
 *
 * @param movement the Movement from a Game state
 * @param resultingGameTree a LazyGameTree which is the resulting tree of states
 * and moves that result from making the movement
 */
interface PotentialMovement {
  readonly movement: Movement;
  readonly resultingGameTree: LazyGameTree;
}

/**
 * A GameTree represents an entire Fish game. In other words, it contains from
 * the first movement turn to when there are no more possible moves for any players,
 * all the possible moves and states within an entire game in a tree structure.
 *
 * The GameTree itself is a single node in this tree, containing the Game state at
 * that point and a mapping from each of the possible movements to be made by that
 * state's current player to a LazyGameTree, which represents the next GameTree
 * node from making that movement.
 *
 * The process of creating a GameTree automatically skips players without any
 * further moves, where a GameTree with an empty array of PotentialMovements
 * symbolizes a completed game, where the game state is the final state.
 *
 * @param gameState the state of the game at this node of the GameTree, this
 * must be a MovementGame since GameTrees are only applicable once all penguins
 * have been placed
 * @param potentialMoves a mapping of every possible Movement that the current
 * player of this Game state can make to the GameTree (lazily evaluated via a LazyGameTree)
 * that would result from making that move, containing the next GameState and set of
 * possible moves
 */
interface GameTree {
  readonly gameState: MovementGame;
  readonly potentialMoves: Array<PotentialMovement>;
}

export { Movement, LazyGameTree, PotentialMovement, GameTree };
