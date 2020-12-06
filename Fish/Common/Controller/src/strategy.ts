import { Board, BoardPosition, PenguinColor } from "../../board";
import {
  Game,
  getCurrentPlayer,
  getCurrentPlayerColor,
  MovementGame,
  Player,
} from "../../state";
import { placePenguin } from "./penguinPlacement";
import { positionIsPlayable } from "./validation";
import { IllegalPlacementError, NotMovementGameError } from "../types/errors";
import { Movement, GameTree, MovementToResultingTree } from "../../game-tree";
import {
  createGameTreeFromMovementGame,
  gameIsMovementGame,
} from "./gameTreeCreation";
import { Result } from "true-myth";
const { ok, err } = Result;
import { Maybe } from "true-myth";
import { getFishNumberFromPosition } from "./boardCreation";
import { getReachablePositions } from "./movementChecking";
const { just, nothing } = Maybe;

/**
 * Using the zig-zag strategy as outlined in Milestone 5, finds the next
 * playable position on the board in the given game. Returns the position
 * of the next playable tile.
 *
 * @param game Game to search for next available tile in zig-zag pattern
 * @returns BoardPosition representing the next available position to place
 * a penguin.
 */
const getNextPenguinPlacementPosition = (game: Game): Maybe<BoardPosition> => {
  for (let row = 0; row < game.board.tiles.length; row++) {
    for (let col = 0; col < game.board.tiles[row].length; col++) {
      if (positionIsPlayable(game, { row, col })) {
        return just({ row, col });
      }
    }
  }
  return nothing();
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
const placeNextPenguin = (game: Game): Result<Game, IllegalPlacementError> => {
  const maybePos = getNextPenguinPlacementPosition(game);

  if (maybePos.isNothing()) {
    return err(
      new IllegalPlacementError(
        game,
        getCurrentPlayer(game),
        { row: 0, col: 0 } as BoardPosition,
        "No more placements available"
      )
    );
  }

  return placePenguin(getCurrentPlayer(game), game, maybePos.unsafelyUnwrap());
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
): Result<MovementGame, IllegalPlacementError | NotMovementGameError> => {
  const resultGameHasPlacements = (
    gameOrError: Result<Game, Error>
  ): boolean => {
    return (
      gameOrError.isOk() && !gameIsMovementGame(gameOrError.unsafelyUnwrap())
    );
  };

  let placedPenguinGame: Result<
    Game,
    IllegalPlacementError | NotMovementGameError
  > = ok(game);

  while (resultGameHasPlacements(placedPenguinGame)) {
    placedPenguinGame = placedPenguinGame.andThen((game: Game) =>
      placeNextPenguin(game)
    );
  }

  return placedPenguinGame.andThen((game: Game) => {
    if (gameIsMovementGame(game)) {
      return ok(game as MovementGame);
    } else {
      return err(
        new NotMovementGameError(game, "Unable to make all placements.")
      );
    }
  });
};

/**
 * Minimax recursive search function to find the maximum possible score for the searchingPlayerIndex,
 * assuming all other players will make a move to minimize the searchingPlayerIndex's score.
 * This computation will be done up to a given remaining depth in the searching player's turns.
 *
 * @param gameTree GameTree representing the current node in tree traversal
 * @param searchingPlayerColor assigned PenguinColor the player the function is maximizing for
 * @param lookAheadTurnsDepth Depth remaining in tree traversal
 */
const getMinMaxScore = (
  gameTree: GameTree,
  searchingPlayerColor: PenguinColor,
  lookAheadTurnsDepth: number
): number => {
  // If current node is root node or if we've reached the desired depth, return current player score.

  if (lookAheadTurnsDepth === 1 || gameTree.potentialMoves.length === 0) {
    const player: Player = gameTree.gameState.players.find(
      (player: Player) => player.color === searchingPlayerColor
    ) as Player;
    return gameTree.gameState.scores.get(player.color) as number;
  }

  const isMaximizing: boolean =
    searchingPlayerColor === getCurrentPlayerColor(gameTree.gameState);

  let curLookAheadTurnsDepth: number = isMaximizing
    ? lookAheadTurnsDepth - 1
    : lookAheadTurnsDepth;

  // Get minimax scores for all child nodes of current gameTree.
  const scores: Array<number> = gameTree.potentialMoves.map(
    (movementToResultingTree: MovementToResultingTree) => {
      let resGameTree = movementToResultingTree.resultingGameTree();

      if (isTurnSkipped(gameTree, resGameTree, searchingPlayerColor)) {
        curLookAheadTurnsDepth = lookAheadTurnsDepth - 1;
      } else if (
        getCurrentPlayerColor(resGameTree.gameState) === searchingPlayerColor &&
        resGameTree.potentialMoves.length > 0 &&
        curLookAheadTurnsDepth === 2
      ) {
        const startPositionToMovementToResultingTrees = (
          startPosition: BoardPosition
        ): number => {
          if (
            getReachablePositions(resGameTree.gameState, startPosition).length >
            0
          ) {
            return getFishNumberFromPosition(
              resGameTree.gameState.board,
              startPosition
            );
          }

          return Number.NEGATIVE_INFINITY;
        };

        const positions: BoardPosition[] = resGameTree.gameState.penguinPositions.get(
          searchingPlayerColor
        ) as BoardPosition[];

        const scores_temp2: number = Math.max(
          ...positions.map(startPositionToMovementToResultingTrees)
        );

        return (
          resGameTree.gameState.scores.get(searchingPlayerColor) + scores_temp2
        );
      }
      return getMinMaxScore(
        resGameTree,
        searchingPlayerColor,
        curLookAheadTurnsDepth
      );
    }
  );

  if (isMaximizing) {
    // If the current player in the Game state is the player searching for their
    // move, then find the maximum move.
    return Math.max(...scores);
  }
  return Math.min(...scores);
};

/**
 *
 * @param prevGameTree previous game tree
 * @param curGameTree current game tree
 * @param maximizingPlayerColor color of the maximizing player
 * Checks if the maximizing Player's turn was skipped while transitioning to a directly
 * reachable substate in the cureent Game Tree from the game State in the previous game tree
 */
const isTurnSkipped = (
  prevGameTree: GameTree,
  curGameTree: GameTree,
  maximizingPlayerColor: PenguinColor
): boolean => {
  return (
    curGameTree.gameState.players.length >= 2 &&
    prevGameTree.gameState.players[1].color === maximizingPlayerColor &&
    curGameTree.gameState.players[0].color !==
      prevGameTree.gameState.players[1].color
  );
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
): Maybe<Movement> => {
  // Create the GameTree for the given state.
  const gameTree: GameTree = createGameTreeFromMovementGame(game);

  // Return false if there are no next actions for the player to make.
  if (gameTree.potentialMoves.length < 1) {
    return nothing();
  }

  // For each of the movements, find their min max.
  const movementsToMinMax: Array<
    [Movement, number]
  > = gameTree.potentialMoves.map(
    (movementToResultingTree: MovementToResultingTree) => [
      movementToResultingTree.movement,
      getMinMaxScore(
        movementToResultingTree.resultingGameTree(),
        getCurrentPlayerColor(game),
        lookAheadTurnsDepth
      ),
    ]
  );

  // Get the movements with the greatest scores.
  const maxMovements: Array<Movement> = maxArray<[Movement, number]>(
    movementsToMinMax,
    ([, score]: [Movement, number]) => score
  ).map(([movement, score]: [Movement, number]) => movement);

  // Tie break into a single movement
  const nextMovement: Movement | false = tieBreakMovements(maxMovements);

  // Return the next movement.
  return just(nextMovement);
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
