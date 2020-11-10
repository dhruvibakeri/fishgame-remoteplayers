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
 * A MovementToResultingTree represents a potential move from an initial Game
 * state and the resulting LazyGameTree representing all possible moves from that
 * point. It is made up of a the Movement being made and a tree of results from
 * that Movement, which is not evaluated until called.
 *
 * @param movement the Movement from a Game state
 * @param resultingGameTree a LazyGameTree which is the resulting tree containing
 * the resulting Game state of the Movement and all of the possible
 * MovementToResultingTrees from that state.
 */
interface MovementToResultingTree {
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
 * The `createGameTree` functions defined within `gameTreeCreation.ts` should
 * be used for creating GameTrees. These functions handle skipping players
 * without any further moves, meaning that any MovementGame state within a
 * GameTree must be a vaild state from which the current player can make a
 * move. Additionally, a GameTree with an empty array of MovementToResultingTrees
 * represents a completed game, where the game state is the final state.
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
  readonly potentialMoves: Array<MovementToResultingTree>;
}

export { Movement, LazyGameTree, MovementToResultingTree, GameTree };
