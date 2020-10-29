import { Game, getCurrentPlayerColor, MovementGame } from "../../state";
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
import { isError } from "./validation";
import { skipToNextActivePlayer } from "./gameStateCreation";

/**
 * Given a Game state, determine if the Game is a MovementGame i.e. all players
 * within the Game have placed all of their penguins.
 *
 * @param game the Game state to check
 * @return whether the Game state is a MovementGame
 */
const gameIsMovementGame = (game: Game): game is MovementGame =>
  Array.from(game.remainingUnplacedPenguins).every(
    ([, unplacedPenguins]: [PenguinColor, number]) => unplacedPenguins === 0
  );

/**
 * Given a Game state, return its corresponding GameTree, making sure that the
 * state is within the movement stage i.e. all penguins have been placed.
 *
 * @param game the Game state
 * @return the state's corresponding GameTree or an Error if it cannot be
 * created.
 */
const createGameTree = (game: Game): GameTree | InvalidGameForTreeError => {
  if (gameIsMovementGame(game)) {
    return createGameTreeFromMovementGame(game);
  } else {
    return new InvalidGameForTreeError(game);
  }
};

/**
 * Given a MovementGame state, return its corresponding GameTree, skipping players
 * which are unable to make moves. If the result contains an empty list of
 * potential moves, this then signifies a final game state.
 *
 * @param game the MovementGame to be made into a GameTree.
 * @return the MovementState's corresponding GameTree
 */
const createGameTreeFromMovementGame = (game: MovementGame): GameTree => {
  const gameSkippingInactivePlayers: MovementGame = skipToNextActivePlayer(
    game
  );

  return {
    gameState: gameSkippingInactivePlayers,
    potentialMoves: generatePotentialMoveMapping(gameSkippingInactivePlayers),
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
  game: MovementGame
): Array<PotentialMovement> => {
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
 * Given a MovementGame state and a Movement, create the resulting LazyGameTree
 * corresponding to the current player of the given state making that
 * Movement. This function is only used by createGameTree.
 *
 * @param game the Game state
 * @param movement the Movement to apply
 * @return the resultng LazyGameTree
 */
const createLazyGameTree = (
  game: MovementGame,
  movement: Movement
): LazyGameTree => {
  // This resulting game state is guaranteed to receive valid inputs as it is
  // only used for GameTree creation, which uses penguins and reachable positions
  // that have already been validated.
  const newGameState = movePenguin(
    game,
    game.players[game.curPlayerIndex],
    movement.startPosition,
    movement.endPosition
  ) as MovementGame;

  // Cast newGameTree as GameTree. This can be done because this function is only called
  // by createGameTree, which validates that the original game state is valid for tree
  // generation. All children of valid game tree nodes are also valid game trees.
  const newGameTree: GameTree = createGameTreeFromMovementGame(
    newGameState
  ) as GameTree;

  return () => newGameTree;
};

export {
  createGameTree,
  createGameTreeFromMovementGame,
  generatePotentialMoveMapping,
  createLazyGameTree,
  gameIsMovementGame,
};
