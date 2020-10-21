import { Game, getCurrentPlayerColor, Player } from "../../state";
import {
  GameTree,
  Movement,
  LazyGameTree,
  getMovementKey,
} from "../../game-tree";
import { Penguin, BoardPosition } from "../../board";
import { getReachablePositions } from "./movementChecking";
import { movePenguin } from "./penguinPlacement";

/**
 * Given a Game state, return its corresponding GameTree.
 *
 * @param game the Game state
 * @return the state's corresponding GameTree
 */
const createGameTree = (game: Game): GameTree => {
  return {
    gameState: game,
    potentialMoves: generatePotentialMoveMapping(game),
  };
};

/**
 * Given a Game state, generate a mapping from each of its current Player's
 * possible Movements to their resulting LazyGameTrees.
 *
 * @param game the Game state
 * @return a mapping from potential Movements to their resulting LazyGameTrees
 */
const generatePotentialMoveMapping = (
  game: Game
): Map<string, LazyGameTree> => {
  // From the given starting position, get all the possible Movements from it.
  const startPositionToPotentialMovements = (
    startPosition: BoardPosition
  ): Array<Movement> =>
    getReachablePositions(game, startPosition).map(
      (reachablePosition: BoardPosition) => {
        return { startPosition: startPosition, endPosition: reachablePosition };
      }
    );

  // For the current Player of the Game state, get an array of tuples from
  // each of the Player's potential Movements to their resulting LazyGameTrees.
  const movementsToLazyGameTrees: Array<[
    string,
    LazyGameTree
  ]> = game.penguinPositions
    .get(getCurrentPlayerColor(game))
    .map(startPositionToPotentialMovements)
    .reduce((arr1, arr2) => [...arr1, ...arr2], []) // Flatten the array.
    .map((movement: Movement) => movementToLazyGameTree(game, movement));

  console.log(movementsToLazyGameTrees);

  // Create a mapping from each potential Movement to their resulting LazyGameTree.
  return new Map(movementsToLazyGameTrees);
};

/**
 * Given a Game state and a Movement, return a tuple from a hash of the
 * Movement to its resulting LazyGameTree.
 *
 * @param game the Game state
 * @param movement the Movement
 * @return a tuple from a hashed Movement to its LazyGameTree
 */
const movementToLazyGameTree = (
  game: Game,
  movement: Movement
): [string, LazyGameTree] => [
  getMovementKey(movement),
  createLazyGameTree(game, movement),
];

/**
 * Given a Game state and a Movement, create the resulting LazyGameTree
 * corresponding to the current player of the given state making that
 * Movement.
 *
 * @param game the Game state
 * @param movement the Movement to apply
 * @return the resultng LazyGameTree
 */
const createLazyGameTree = (game: Game, movement: Movement): LazyGameTree => {
  // This resulting game state is guaranteed to receive valid inputs as it is
  // only used for GameTree creation, which uses penguins and reachable positions
  // that have already been validated.
  const newGameState = movePenguin(
    game,
    game.players[game.curPlayerIndex],
    movement.startPosition,
    movement.endPosition
  ) as Game;
  return () => createGameTree(newGameState);
};

export {
  createGameTree,
  generatePotentialMoveMapping,
  movementToLazyGameTree,
  createLazyGameTree,
};
