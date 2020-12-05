import { PenguinColor } from "../../Common/board";
import { Game } from "../../Common/state";
import { Movement } from "../../Common/game-tree";
import {
  Action,
  InputPosition,
  InputState,
} from "../../Common/Controller/src/testHarnessInput";
import {
  gameToInputState,
  movementToAction,
} from "../../Common/Controller/src/testHarnessConversion";
import { Socket } from "net";

/**
 * An Argument represents a possible piece of game-data that players
 * should be informed of during function calls.
 * The Argument will be converted into an OutputObj, which represents
 * the common JSON-serializable ontology on which all clients will
 * be expected to communicate.
 */
export type Argument =
  | PenguinColor
  | PenguinColor[]
  | Game
  | Movement[]
  | boolean;

/**
 * The JSON-serializable output object that players will receive. Each
 * OutputObj is representation of an Argument in the expected output format.
 */
type OutputObj =
  | PenguinColor
  | PenguinColor[]
  | InputState
  | Action[]
  | boolean;

/**
 * Represents the data that the clients are expected to send back. The data
 * must take the form of an InputObj, and will be used to conduct game play.
 */
type InputObj = [InputPosition, InputPosition] | InputPosition;

/**
 * Checks whether the type of the given argument is a Game
 * @param arg argument to be type checked
 */
export function isGame(arg: Argument): arg is Game {
  return (arg as Game).board && (arg as Game).players && true;
}

/**
 * Checks whether the type of the given argument is a list of Movements
 * @param arg argument to be type checked
 */
export function isMovements(arg: Argument): arg is Movement[] {
  return (
    (arg as Movement[]).every &&
    (arg as Movement[]).every(
      (movement: Movement) =>
        movement.endPosition && movement.startPosition && true
    )
  );
}

/**
 * Converts an Argument to an OutputObj
 * @param arg the argument to be converted.
 */
export const convertArgumentToOutput = (arg: Argument): OutputObj => {
  if (isGame(arg)) {
    return gameToInputState(arg as Game);
  }

  if (isMovements(arg)) {
    return (arg as Movement[]).map(movementToAction) as Action[];
  }
  return arg;
};

/**
 * Sends a message to the client listening on the socket.
 * The message will always be formatted as follows:
 *  [ name, [ OutputObj, OutputObj, ... ] ]
 * Representing a function call.
 * @param socket the socket that the client is listening on.
 * @param name the name of the message / function call.
 * @param args the list of arguments to be passed to the function call.
 */
const sendMessage = (
  socket: Socket,
  name: string,
  args: Array<Argument>
): void => {
  const message = [name, args.map(convertArgumentToOutput)];
  socket.write(JSON.stringify(message));
};

/**
 * Converts a client message into one of the expected responses from a player.
 * @param message the raw string that was received from the client.
 */
const parseMessage = (message: string): InputObj => {
  const data = JSON.parse(message);

  if (isInputPosition(data)) {
    return data as InputPosition;
  }

  if (isTuplePositions(data)) {
    return data as [InputPosition, InputPosition];
  }

  return data;
};

/**
 * Checks whether the type of the given argument is an InputPosition
 * @param arg argument to be type checked
 */
function isInputPosition(data: any): data is InputPosition {
  return true;
}

/**
 * Checks whether the type of the given argument is a tuple of InputPosition
 * @param arg argument to be type checked
 */
function isTuplePositions(data: any): data is [InputPosition, InputPosition] {
  return true;
}

/**
 * Checks whether the response received by the given socket is as expected
 * @param socket socket on which response is expected
 * @param expectedResponse the expected response
 */
const waitForResponse = (
  socket: Socket,
  expectedResponse: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    const dataReceived = (data: string) => {
      socket.removeListener("data-received", dataReceived);
      if (expectedResponse !== JSON.parse(data.toString())) {
        console.log(
          "Data  (" + data + ") was not as expected: " + expectedResponse
        );
        resolve(false);
      }
      resolve(true);
    };

    socket.on("data-received", dataReceived);
  });
};

export { sendMessage, parseMessage, waitForResponse };
