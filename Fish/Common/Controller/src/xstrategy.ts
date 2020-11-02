import { readStdin, InputDepthState, Action } from "./testHarnessInput";
import {
    inputStateToGameState,
    printFalse,
    movementToAction,
  } from "./testHarnessConversion";
import { Game } from "../../state";
import { isValidInputState, isError } from "./validation";
import { gameIsMovementGame } from "./gameTreeCreation";
import { chooseNextAction } from "../../../Player/strategy";
import { Movement } from "../../game-tree";

readStdin<InputDepthState>()
  .then((parsed: InputDepthState) => {
    // Apply the Movement to the Game state.
    const gameStateOrError = inputStateToGameState(parsed[1]) as Game;
    let action: false | Movement = false;

    if (
        isValidInputState(parsed[1]) &&
        !isError(gameStateOrError) &&
        gameIsMovementGame(gameStateOrError)
      ) {
        const actionOrError = chooseNextAction(gameStateOrError, parsed[0]);
        if (!isError(actionOrError)) {
            action = actionOrError;
        }
      }
    
    const actionOutput: Action = action === false ? action : movementToAction(action);
    console.log(JSON.stringify(actionOutput));
  })
  .catch(() => printFalse());