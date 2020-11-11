import { MovementDirection } from "../../board";
import {
  Game,
  getCurrentPlayer,
  getCurrentPlayerColor,
  MovementGame,
} from "../../state";
import { InputState, readStdin } from "./testHarnessInput";
import { isValidInputState } from "./validation";
import { movePenguin } from "./penguinPlacement";
import { getNextPosition } from "./movementChecking";
import {
  gameToInputState,
  inputStateToGameState,
} from "./testHarnessConversion";
import { SillyStrategyDirections } from "./testHarnessStrategy";
import { gameIsMovementGame } from "./gameTreeCreation";

/**
 * Try to make a single tile move in the given direction within
 * the given Game state. The player to make this move is the current player
 * of the Game state, and they are attempting to move their first Penguin.
 * @param direction
 * @param game
 * @return the resulting Game from successfully making the move or false if
 * it can't be made
 */
const tryToMakeMove = (
  direction: MovementDirection,
  game: MovementGame
): Game | false => {
  const currentPlayerPenguinPositions = game.penguinPositions.get(
    getCurrentPlayerColor(game)
  );

  // If there are no penguins to move, return false.
  if (currentPlayerPenguinPositions.length <= 0) {
    return false;
  }

  // Derive the ending position from the position of the first penguin.
  // This is done by moving a single step in the specified direction
  // from this position.
  const firstPenguinStartPosition = currentPlayerPenguinPositions[0];
  const endPosition = getNextPosition(
    firstPenguinStartPosition,
    direction.verticalDirection,
    direction.horizontalDirection
  );

  // Attempt to make the move.
  const makeMoveOrError = movePenguin(
    game,
    getCurrentPlayer(game),
    firstPenguinStartPosition,
    endPosition
  );

  if (makeMoveOrError.isOk()) {
    return makeMoveOrError.unsafelyUnwrap();
  } else {
    return false;
  }
};

/**
 * Attempt to a move with the given Game state using the silly strategy for
 * player movement. The move is attempted with the current player of the Game
 * using their first penguin.
 *
 * @param game the game state to make the move in
 * @return either the resulting Game state from the move if successful or false
 * if no move could be made from the strategy
 */
const makeSillyMove = (game: MovementGame): Game | false => {
  // Going through the order of directions within the silly strategy,
  // try to make a move in each of those directions, trying the next
  // if one fails.
  for (const direction of SillyStrategyDirections) {
    const resultOfMove: Game | false = tryToMakeMove(direction, game);

    // Return the result of the first move that is successful.
    if (resultOfMove) {
      return resultOfMove;
    }
  }

  // If no moves are successful, return false.
  return false;
};

readStdin()
  .then((parsed: InputState) => {
    // Convert the InputState into a Game state.
    const gameStateOrError = inputStateToGameState(parsed);
    let result: Game | false = false;

    // If no error occurred in the above conversion, try to make
    // a move as part of the silly strategy and store the result.
    if (
      isValidInputState(parsed) &&
      !gameStateOrError.isErr() &&
      gameIsMovementGame(gameStateOrError.unsafelyUnwrap())
    ) {
      result = makeSillyMove(gameStateOrError.unsafelyUnwrap() as MovementGame);
    }

    if (result) {
      // If the final result is a Game, convert it to an input
      // state and output the result.
      console.log(JSON.stringify(gameToInputState(result)));
    } else {
      // If the final result is false, output this.
      console.log(JSON.stringify(result));
    }
  })
  .catch(() => {
    console.log(JSON.stringify(false));
  });
