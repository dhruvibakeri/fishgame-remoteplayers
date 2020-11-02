import { tieBreakMovements } from "../../../Player/strategy";
import { BoardPosition } from "../../board";
import { GameTree, Movement, PotentialMovement } from "../../game-tree";
import { Game } from "../../state";
import { createGameTree } from "./gameTreeCreation";
import { getNextPosition } from "./movementChecking";
import { positionsAreEqual } from "./penguinPlacement";
import {
  inputPositionToBoardPosition,
  movementToAction,
  performMoveResponseQuery,
  printFalse
} from "./testHarnessConversion";
import { Action, MoveResponseQuery, readStdin } from "./testHarnessInput";
import { SillyStrategyDirections } from "./testHarnessStrategy";

/**
 * Given a target BoardPosition, determine if a given Movement's destination is
 * that target position.
 *
 * @param target the target position to check
 * @return whether the Movement's destination is the target
 */
const movementLandsOnTarget = (
  target: BoardPosition,
  movement: Movement
): boolean => positionsAreEqual(target, movement.endPosition);

/**
 * Given a target BoardPosition, create a function that takes a
 * PotentialMovement and determines if that movement lands on a neighbor of the
 * target i.e. an adjacent tile.
 *
 * @param target the target to check neighbors of
 * @return a function determining if a given PotentialMove lands on one of the
 * target's neighbors.
 */
const movementLandsOnNeighborOfTarget = (target: BoardPosition) => (
  potentialMove: PotentialMovement
): Movement | false => {
  // Check directions in the same order as the silly strategy's order of
  // movement directions.
  for (const direction of SillyStrategyDirections) {
    const neighborPosition = getNextPosition(
      target,
      direction.verticalDirection,
      direction.horizontalDirection
    );

    // If the movement lands on this neighboring position, return the Movement.
    if (movementLandsOnTarget(neighborPosition, potentialMove.movement)) {
      return potentialMove.movement;
    }
  }

  // If no movements land on any neighbors of the target, return false.
  return false;
};

/**
 * Function used to reduce an Array of Movements or false into an array of
 * Movements by collecting only the Movements.
 *
 * @param acc the accumulated Movements
 * @param movementOrFalse the element to either either collect or ignore
 * @return the resulting accumulator
 */
const collectMovements = (
  acc: Array<Movement>,
  movementOrFalse: Movement | false
): Array<Movement> => {
  if (movementOrFalse) {
    return [...acc, movementOrFalse];
  } else {
    return acc;
  }
};

readStdin<MoveResponseQuery>()
  .then((parsed: MoveResponseQuery) => {
    // Apply the Movement to the Game state.
    const game: Game = performMoveResponseQuery(parsed) as Game;

    // Convert the Game state into a GameTree
    const gameTree: GameTree = createGameTree(game) as GameTree;

    // Map onto the GameTree's potential moves a function that determines if
    // the movement lands on a tile adjacent to the previous player's
    // destination, then filter out only the Movements.
    const targetPosition: BoardPosition = inputPositionToBoardPosition(
      parsed.to
    );
    const movementsToNeighbors: Array<Movement> = gameTree.potentialMoves
      .map(movementLandsOnNeighborOfTarget(targetPosition))
      .reduce<Array<Movement>>(collectMovements, []);

    // If there are no possible moves, output false.
    if (movementsToNeighbors.length < 1) {
      printFalse();
      return;
    }

    // Tie break the cases into a single Movement if possible.
    const movement: Movement = tieBreakMovements(movementsToNeighbors);

    // Convert the Movement into an Action and return it if it exists,
    const action: Action = movementToAction(movement);

    console.log(JSON.stringify(action));
  })
  .catch(() => printFalse());
