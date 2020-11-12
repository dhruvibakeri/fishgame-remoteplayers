import { readStdin, InputDepthState, Action } from "./testHarnessInput";
import {
    inputStateToGameState,
    printFalse,
    movementToAction,
  } from "./testHarnessConversion";
import { Game, MovementGame } from "../../state";
import { isValidInputState, isError } from "./validation";
import { gameIsMovementGame } from "./gameTreeCreation";
import { chooseNextAction } from "../../../Player/strategy";
import { Movement } from "../../game-tree";

readStdin<InputDepthState>()
  .then((parsed: InputDepthState) => {
    // Apply the Movement to the Game state.
    const gameStateOrError = inputStateToGameState(parsed[1]);
    let action: false | Movement = false;

    if (
        isValidInputState(parsed[1]) &&
        !gameStateOrError.isErr() &&
        gameIsMovementGame(gameStateOrError.unsafelyUnwrap())
      ) {
        const maybeAction = chooseNextAction(gameStateOrError.unsafelyUnwrap() as MovementGame, parsed[0]);
        if (!maybeAction.isNothing()) {
            action = maybeAction.unsafelyUnwrap();
        }
      }
    
    const actionOutput: Action = action === false ? action : movementToAction(action);
    console.log(JSON.stringify(actionOutput));
  })
  .catch(() => printFalse());