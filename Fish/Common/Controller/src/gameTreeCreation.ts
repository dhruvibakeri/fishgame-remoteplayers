import { Game, getCurrentPlayerColor } from "../../state";
import {
  GameTree,
  Movement,
  LazyGameTree,
  PotentialMovement,
} from "../../game-tree";
import { BoardPosition, PenguinColor } from "../../board";
import { getReachablePositions } from "./movementChecking";
import { movePenguin } from "./penguinPlacement";
import { InvalidGameForTreeError } from "../types/errors";

/**
 * Checks if tree can be generated for given game, meaning all penguins have been placed
 * @param game game to check for number of placed penguins
 * @returns true if all penguins have been placed, false if not
 */
const isGameTreeable = (game: Game): boolean => {
  let placedPenguins: number = 0;
  game.penguinPositions.forEach((value: BoardPosition[]) => {
    placedPenguins += value.length;
  });
  return (
    placedPenguins ===
    (6 - game.players.length) * game.players.length
  );
};

/**
 * Given a Game state, return its corresponding GameTree.
 *
 * @param game the Game state
 * @return the state's corresponding GameTree
 */
const createGameTree = (
  game: Game,
): GameTree | InvalidGameForTreeError => {
  if (!isGameTreeable(game)) {
    return new InvalidGameForTreeError(game);
  }
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
const generatePotentialMoveMapping = (game: Game): Array<PotentialMovement> => {
  // From the given starting position, get all the possible Movements from it.
  const startPositionToPotentialMovements = (
    startPosition: BoardPosition
  ): Array<Movement> =>
    getReachablePositions(game, startPosition).map(
      (reachablePosition: BoardPosition) => {
        return { startPosition, endPosition: reachablePosition };
      }
    );

  // For the current Player of the Game state, get an array of PotentialMoves
  // The player could make in the Game state.
  return game.penguinPositions
    .get(getCurrentPlayerColor(game))
    .map(startPositionToPotentialMovements)
    .reduce((arr1, arr2) => [...arr1, ...arr2], []) // Flatten the array.
    .map((movement: Movement) => {
      return {
        movement: movement,
        resultingGameTree: createLazyGameTree(game, movement),
      };
    });
};

/**
 * Given a Game state and a Movement, create the resulting LazyGameTree
 * corresponding to the current player of the given state making that
 * Movement. This function is only used by createGameTree.
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

  // Cast newGameTree as GameTree. This can be done because this function is only called
  // by createGameTree, which validates that the original game state is valid for tree
  // generation. All children of valid game tree nodes are also valid game trees.
  const newGameTree: GameTree = createGameTree(newGameState) as GameTree;

  return () => newGameTree;
};

export { createGameTree, generatePotentialMoveMapping, createLazyGameTree };
