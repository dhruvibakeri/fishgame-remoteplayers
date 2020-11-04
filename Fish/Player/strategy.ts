import { BoardPosition } from "../Common/board";
import { Game, getCurrentPlayer, MovementGame, Player } from "../Common/state";
import { placePenguin } from "../Common/Controller/src/penguinPlacement";
import {
  positionIsPlayable,
  isError,
} from "../Common/Controller/src/validation";
import {
  IllegalPenguinPositionError,
  InvalidGameStateError,
  NoMoreMovementsError,
  NoMorePlacementsError,
} from "../Common/Controller/types/errors";
import { Movement, GameTree, PotentialMovement } from "../Common/game-tree";
import {
  createGameTreeFromMovementGame,
  gameIsMovementGame,
} from "../Common/Controller/src/gameTreeCreation";

/**
 * Using the zig-zag strategy as outlined in Milestone 5, finds the next
 * playable position on the board in the given game. Returns the position
 * of the next playable tile.
 *
 * @param game Game to search for next available tile in zig-zag pattern
 * @returns BoardPosition representing the next available position to place
 * a penguin.
 */
const getNextPenguinPlacementPosition = (
  game: Game
): BoardPosition | NoMorePlacementsError => {
  for (let row = 0; row < game.board.tiles.length; row++) {
    for (let col = 0; col < game.board.tiles[row].length; col++) {
      if (positionIsPlayable(game, { row, col })) {
        return { row, col };
      }
    }
  }
  return new NoMorePlacementsError(game);
};

/**
 * Using the zig-zag strategy as outlined in Milestone 5, find the next
 * position for the placement of the given game's current player's
 * penguin while they have penguins to place.
 *
 * @param game the Game state from which to place the next penguin
 * @return the resulting Game state from the placement or an error
 * if the penguin can't be placed
 */
const placeNextPenguin = (
  game: Game
):
  | Game
  | NoMorePlacementsError
  | InvalidGameStateError
  | IllegalPenguinPositionError => {
  // Get next available space in zig zag pattern.
  const placementPosition:
    | BoardPosition
    | NoMorePlacementsError = getNextPenguinPlacementPosition(game);

  if (isError(placementPosition)) {
    return new NoMorePlacementsError(game);
  }

  // Attempt to place the penguin and return the result.
  return placePenguin(getCurrentPlayer(game), game, placementPosition);
};

/**
 * Places all remaining unplaced penguins in given Game in the zig-zag pattern
 * outlined in Milestone 5.
 *
 * @param game Game state to place all remaining unplaced penguins
 * @returns Game with all penguins placed in playable spaces in a zig-zag pattern
 */
const placeAllPenguinsZigZag = (
  game: Game
):
  | MovementGame
  | NoMorePlacementsError
  | InvalidGameStateError
  | IllegalPenguinPositionError => {
  let curPlayer: Player = getCurrentPlayer(game);
  let placedPenguinGame:
    | Game
    | NoMorePlacementsError
    | InvalidGameStateError
    | IllegalPenguinPositionError = game;
  while (
    !isError(placedPenguinGame) &&
    placedPenguinGame.remainingUnplacedPenguins.get(curPlayer.color) > 0
  ) {
    placedPenguinGame = placeNextPenguin(placedPenguinGame);
    if (!isError(placedPenguinGame)) {
      curPlayer = getCurrentPlayer(placedPenguinGame);
    }
  }

  if (isError(placedPenguinGame)) {
    return placedPenguinGame;
  } else if (gameIsMovementGame(placedPenguinGame)) {
    return placedPenguinGame;
  } else {
    return new InvalidGameStateError(game, "Unable to make all placements.");
  }
};

/**
 * Minimax recursive search function to find the maximum possible score for the searchingPlayerIndex,
 * assuming all other players will make a move to minimize the searchingPlayerIndex's score.
 * This computation will be done up to a given remaining depth in the searching player's turns.
 *
 * @param gameTree GameTree representing the current node in tree traversal
 * @param searchingPlayerIndex Index in gameTree.gameState.players for the player the function is maximizing for
 * @param lookAheadTurnsDepth Depth remaining in tree traversal
 */
const getMinMaxScore = (
  gameTree: GameTree,
  searchingPlayerIndex: number,
  lookAheadTurnsDepth: number
): number => {
  // If current node is root node or if we've reached the desired depth, return current player score.
  if (lookAheadTurnsDepth === 1 || gameTree.potentialMoves.length === 0) {
    return gameTree.gameState.scores.get(
      gameTree.gameState.players[searchingPlayerIndex].color
    );
  }

  const isMaximizing: boolean =
    searchingPlayerIndex === gameTree.gameState.curPlayerIndex;
  const curLookAheadTurnsDepth: number = isMaximizing
    ? lookAheadTurnsDepth - 1
    : lookAheadTurnsDepth;

  // Get minimax scores for all child nodes of current gameTree.
  const scores: Array<number> = gameTree.potentialMoves.map(
    (potentialMove: PotentialMovement) =>
      getMinMaxScore(
        potentialMove.resultingGameTree(),
        searchingPlayerIndex,
        curLookAheadTurnsDepth
      )
  );

  if (isMaximizing) {
    // If the current player in the Game state is the player searching for their
    // move, then find the maximum move.
    return Math.max(...scores);
  }
  return Math.min(...scores);
};

/**
 * Given an array of T and a function to get the numeric value of T, return
 * an array containing the mininimum values of T.
 *
 * @param arr the array to find the minimum values of
 * @param getValue a function which gets the numeric value of a T
 * @return the array containing the elements of arr which have the miinimum
 * numeric value.
 */
const minArray = <T>(arr: Array<T>, getValue: (el: T) => number): Array<T> => {
  const values: Array<number> = arr.map((el: T) => getValue(el));
  const minValue = Math.min(...values);
  return arr.filter((el: T) => getValue(el) === minValue);
};

/**
 * Given an array of T and a function to get the numeric value of T, return
 * an array containing the maximum values of T.
 *
 * @param arr the array to find the maximum values of
 * @param getValue a function which gets the numeric value of a T
 * @return the array containing the elements of arr which have the maximum
 * numeric value.
 */
const maxArray = <T>(arr: Array<T>, getValue: (el: T) => number): Array<T> => {
  const values: Array<number> = arr.map((el: T) => getValue(el));
  const maxValue = Math.max(...values);
  return arr.filter((el: T) => getValue(el) === maxValue);
};

/**
 * Given a non empty array of movements, narrow them down into a single
 * movement by filtering in the order of the following criteria:
 * - lowest starting row position
 * - lowest starting column positionl
 * - lowest ending row position
 * - lowest ending column position
 *
 * @param movements the movements to break ties for
 * @return a single movement chosen from the given array of movements
 */
const tieBreakMovements = (movements: Array<Movement>): Movement => {
  // Get the movements with the lowest starting row value.
  const filteredByLowestStartingRow = minArray<Movement>(
    movements,
    (movement: Movement) => movement.startPosition.row
  );
  if (filteredByLowestStartingRow.length === 1) {
    return filteredByLowestStartingRow[0];
  }

  // Get the movements with the lowest starting column value.
  const filteredByLowestStartCol = minArray<Movement>(
    filteredByLowestStartingRow,
    (movement: Movement) => movement.startPosition.col
  );
  if (filteredByLowestStartCol.length === 1) {
    return filteredByLowestStartCol[0];
  }

  // Get the movements with the lowest ending row value.
  const filteredByLowestEndRow = minArray<Movement>(
    filteredByLowestStartCol,
    (movement: Movement) => movement.endPosition.row
  );
  if (filteredByLowestEndRow.length === 1) {
    return filteredByLowestEndRow[0];
  }

  // Get the movements with the lowest ending column value.
  const filteredByLowestEndPosition = minArray<Movement>(
    filteredByLowestEndRow,
    (movement: Movement) => movement.endPosition.col
  );
  return filteredByLowestEndPosition[0];
};

/**
 * Choose the next action for the current player of the given Game state using
 * a minimax optimization with the given maximum depth corresponding to the
 * number of that player's turns to search when optimizing.
 *
 * @param game the Game state to find the next action from
 * @param lookAheadTurnsDepth the maximum number of turns for the current
 * player to search through when optimimizing using the minimax optimization
 * strategy.
 */
const chooseNextAction = (
  game: MovementGame,
  lookAheadTurnsDepth: number
): Movement | NoMoreMovementsError => {
  // Create the GameTree for the given state.
  const gameTree: GameTree = createGameTreeFromMovementGame(game);

  // Return false if there are no next actions for the player to make.
  if (gameTree.potentialMoves.length < 1) {
    return new NoMoreMovementsError(game);
  }

  // For each of the movements, find their min max.
  const movementsToMinMax: Array<[
    Movement,
    number
  ]> = gameTree.potentialMoves.map((potentialMove: PotentialMovement) => [
    potentialMove.movement,
    getMinMaxScore(
      potentialMove.resultingGameTree(),
      game.curPlayerIndex,
      lookAheadTurnsDepth
    ),
  ]);

  // Get the movements with the greatest scores.
  const maxMovements: Array<Movement> = maxArray<[Movement, number]>(
    movementsToMinMax,
    ([, score]: [Movement, number]) => score
  ).map(([movement, score]: [Movement, number]) => movement);

  // Tie break into a single movement
  const nextMovement: Movement | false = tieBreakMovements(maxMovements);

  // Return the next movement.
  return nextMovement;
};

export {
  getNextPenguinPlacementPosition,
  placeNextPenguin,
  placeAllPenguinsZigZag,
  chooseNextAction,
  getMinMaxScore,
  minArray,
  maxArray,
  tieBreakMovements,
};
