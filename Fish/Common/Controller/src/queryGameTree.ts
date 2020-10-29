import { Game, getCurrentPlayer, Player } from "../../state";
import { GameTree, Movement, PotentialMovement } from "../../game-tree";
import { movePenguin, positionsAreEqual } from "./penguinPlacement";
import { IllegalMovementError } from "../types/errors";

/**
 * Checks if given movement can be made with the given GameTree node. If it can,
 * returns theresulting game state of the move on the given game tree's current
 * game state, otherwise returns IllegalMovementError
 *
 * @param gameTree Starting GameTree node
 * @param movement Movement to check if legal or not
 * @returns Game state if movement is legal, returns IllegalMovementError if not legal
 */
const isMovementLegal = (
  gameTree: GameTree,
  movement: Movement
): Game | IllegalMovementError => {
  // Determine if the movement is legal by comparing it to the possible
  // movements within the GameTree's potential moves and seeing if it
  // exists there.
  const isLegalMove = gameTree.potentialMoves.some(
    (potentialMove: PotentialMovement) =>
      positionsAreEqual(
        movement.startPosition,
        potentialMove.movement.startPosition
      ) &&
      positionsAreEqual(
        movement.endPosition,
        potentialMove.movement.endPosition
      )
  );

  if (!isLegalMove) {
    return new IllegalMovementError(gameTree, movement);
  }

  const newGameState = movePenguin(
    gameTree.gameState,
    getCurrentPlayer(gameTree.gameState),
    movement.startPosition,
    movement.endPosition
  ) as Game;

  return newGameState;
};

/**
 * Applies a function to all reachable states from given tree node
 *
 * @param gameTree GameTree node to get all reachable game states to apply function
 * @param fn function to apply to all reachable game states from given game
 * @returns Array of fn return type representing all reachable game states from given
 * game tree node with given function applied to them
 */
const mapOverReachableStates = <T = unknown>(
  gameTree: GameTree,
  fn: (game: Game) => T
): Array<T> => {
  const getGameTreeFromPotentialMove = (potentialMove: PotentialMovement) =>
    potentialMove.resultingGameTree();

  return Array.from(gameTree.potentialMoves)
    .map(getGameTreeFromPotentialMove)
    .map((gameTree: GameTree) => gameTree.gameState)
    .map(fn);
};

export { isMovementLegal, mapOverReachableStates };
