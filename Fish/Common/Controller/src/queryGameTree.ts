import { Game, getCurrentPlayer } from "../../state";
import { GameTree, Movement, PotentialMovement } from "../../game-tree";
import { movePenguin, positionsAreEqual } from "./penguinPlacement";
import { IllegalMovementError } from "../types/errors";
import { createGameTree } from "./gameTreeCreation";

/**
 * Checks if given movement can be made with the given game state. If it can, returns the resulting
 * game state of the move on the current game state, otherwise returns IllegalMovementError
 *
 * @param game Starting state
 * @param movement Movement to check if legal or not
 * @returns Game state if movement is legal, returns IllegalMovementError if not legal
 */
const isMovementLegal = (
  game: Game,
  movement: Movement
): Game | IllegalMovementError => {
  const gameTree: GameTree = createGameTree(game);
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
    return new IllegalMovementError(game, movement);
  }

  const newGameState = movePenguin(
    game,
    getCurrentPlayer(game),
    movement.startPosition,
    movement.endPosition
  ) as Game;

  return newGameState;
};

/**
 * Applies a function to all reachable states from given game state
 *
 * @param game Game to find all reachable game states to apply function
 * @param fn function to apply to all reachable game states from given game
 * @returns Array of fn return type representing all reachable game states from given game with given
 * function applied to them
 */
const mapOverReachableStates = <T = unknown>(
  game: Game,
  fn: (game: Game) => T
): Array<T> => {
  const gameTree: GameTree = createGameTree(game);
  const getGameTreeFromPotentialMove = (potentialMove: PotentialMovement) =>
    potentialMove.resultingGameTree();

  return Array.from(gameTree.potentialMoves)
    .map(getGameTreeFromPotentialMove)
    .map((gameTree: GameTree) => gameTree.gameState)
    .map(fn);
};

export { isMovementLegal, mapOverReachableStates };
