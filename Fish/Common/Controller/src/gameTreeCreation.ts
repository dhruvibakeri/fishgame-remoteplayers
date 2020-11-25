import {
  Game,
  getCurrentPlayer,
  getCurrentPlayerColor,
  MovementGame,
} from "../../state";
import {
  GameTree,
  Movement,
  LazyGameTree,
  MovementToResultingTree,
} from "../../game-tree";
import { BoardPosition, PenguinColor } from "../../board";
import { getReachablePositions } from "./movementChecking";
import { movePenguin } from "./penguinPlacement";
import { IllegalGameTreeError } from "../types/errors";
import { skipToNextActivePlayer } from "./gameStateCreation";
import { Result } from "true-myth";

const { ok, err } = Result;

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
const createGameTree = (game: Game): Result<GameTree, IllegalGameTreeError> => {
  if (gameIsMovementGame(game)) {
    return ok(createGameTreeFromMovementGame(game));
  } else {
    return err(new IllegalGameTreeError(game));
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
): GameTree => {
  // This resulting game state is guaranteed to receive valid inputs as it is
  // only used for GameTree creation, which uses penguins and reachable positions
  // that have already been validated.
  const newGameState = movePenguin(
    game,
    getCurrentPlayer(game),
    movement.startPosition,
    movement.endPosition
  ).unsafelyUnwrap();

  return createGameTreeFromMovementGame(newGameState);
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
): Array<MovementToResultingTree> => {
  // From the given starting position, get all the possible Movements from it.
  const startPositionToMovementToResultingTrees = (
    startPosition: BoardPosition
  ): Array<Movement> =>
    getReachablePositions(game, startPosition).map(
      (reachablePosition: BoardPosition) => {
        return { startPosition, endPosition: reachablePosition };
      }
    );

  if (game.players.length === 0) {
    return [];
  }

  // For the current Player of the Game state, get an array of PotentialMoves
  // The player could make in the Game state.
  const positions: BoardPosition[] = game.penguinPositions.get(getCurrentPlayerColor(game)) as BoardPosition[];
  return positions
    .map(startPositionToMovementToResultingTrees)
    .reduce((arr1, arr2) => [...arr1, ...arr2], []) // Flatten the array.
    .map((movement: Movement) => {
      return {
        movement: movement,
        resultingGameTree: () => createLazyGameTree(game, movement),
      };
    });
};

export {
  createGameTree,
  createGameTreeFromMovementGame,
  generatePotentialMoveMapping,
  createLazyGameTree,
  gameIsMovementGame,
};
