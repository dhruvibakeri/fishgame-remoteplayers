import { Socket } from "net";
import {
  inputStateToGameState,
  movementToAction,
  boardPositionToInputPosition,
} from "../Common/Controller/src/testHarnessConversion";
import { Game, MovementGame } from "../Common/state";
import {
  getNextPenguinPlacementPosition,
  chooseNextAction,
} from "../Common/Controller/src/strategy";
import { Movement } from "../Common/game-tree";
import { Maybe } from "true-myth";
import { BoardPosition } from "../Common/board";
import { parseJsonSequence } from "./json-utils";

// importing nodejs 'net' module
const net = require("net");

/**
 * enum to represent different stages of a Tournament.
 * INITIAL - stage before the start of a tournament is declared.
 * STARTING - stage when the tournament has started.
 * ENDED - stage when the tournament has ended.
 * PLACING - stage when games in a tournament round are in the placing phase.
 * PLAYING - stage when games in a tournament round are in the playing phase.
 */
enum TournamentPhase {
  INITIAL,
  STARTING,
  ENDED,
  PLACING,
  PLAYING,
}

/**
 * Creates a client and points it towards a server on the given port and host.
 * @param name the given name of a client
 * @param port the given port the client needs to connect to
 * @param host the given host the client needs to connect on
 */
const createClient = (name: string, port: number, host: string) => {
  const client = net.connect(port, host);
  // tournament phase is initially set to INITIAL
  let currentPhase: TournamentPhase = TournamentPhase.INITIAL;
  client.on("connect", () => {
    // client sends name to server upon connection
    client.write(name);
  });

  // everytime client receives data, it reacts accordingly
  client.on("data", (data: string) => {
    // data received is parsed into a list of JSON strings
    const messages: String[] = parseJsonSequence(new String(data));
    messages.forEach((message: String) => {
      // tournament phase is changed based on given message
      currentPhase = changePhaseIfNecessary(message as string);
      // client takes action according to the tournament phase
      switch (currentPhase) {
        case TournamentPhase.INITIAL:
          break;
        case TournamentPhase.STARTING:
          handleStart(client, message as string);
          break;
        case TournamentPhase.ENDED:
          handleEnd(client, message as string);
          break;
        case TournamentPhase.PLACING:
          handlePlacing(client, message as string);
          break;
        case TournamentPhase.PLAYING:
          handlePlaying(client, message as string);
          break;
        default:
          console.log("Client cannot handle data: " + data);
          client.close();
      }
    });
  });
};

/**
 * Changes the phase of the tournament based on the given message
 * @param data message received by the client
 */
const changePhaseIfNecessary = (data: string) => {
  const parsed = JSON.parse(data);
  if (parsed[0] === "start" && parsed[1][0] === true) {
    return TournamentPhase.STARTING;
  }
  if (parsed[0] === "playing-as") {
    return TournamentPhase.STARTING;
  }
  if (parsed[0] === "playing-with") {
    return TournamentPhase.STARTING;
  }
  if (parsed[0] === "setup") {
    return TournamentPhase.PLACING;
  }
  if (parsed[0] === "take-turn") {
    return TournamentPhase.PLAYING;
  }
  if (parsed[0] === "end") {
    return TournamentPhase.ENDED;
  }
  return TournamentPhase.INITIAL;
};

/**
 * sends a placement position back to the server from the given client based on the
 * given data which contains the current game state.
 * @param client the client who needs to make a placement
 * @param data the data received by the client based on which it would make a placement
 */
const handlePlacing = (client: Socket, data: string) => {
  const parsed = JSON.parse(data);
  // gets the current game state from the given data
  const game: Game = inputStateToGameState(parsed[1][0]).unsafelyUnwrap();
  // gets a placement position based on the current game state
  const nextPos: Maybe<BoardPosition> = getNextPenguinPlacementPosition(game);
  // sends that position back to the server
  nextPos.map((pos: BoardPosition) => {
    client.write(JSON.stringify(boardPositionToInputPosition(pos)));
    return pos;
  });
};

/**
 * sends a movement back to the server from the given client based on the
 * given data which contains the current game state.
 * @param client the client who needs to make a movement
 * @param data the data received by the client based on which it would make a movement
 */
const handlePlaying = (client: Socket, data: string) => {
  const parsed = JSON.parse(data);
  // gets the current game state from the given data
  const game: Game = inputStateToGameState(parsed[1][0]).unsafelyUnwrap();
  // gets a movement based on the current game state
  const nextMovement: Maybe<Movement> = chooseNextAction(
    game as MovementGame,
    2
  );
  // sends that movement back to the server
  nextMovement.map((move: Movement) => {
    client.write(JSON.stringify(movementToAction(move)));
    return move;
  });
};

/**
 * sends a "void" message to the server by the given client when
 * the client receives a message stating the tournament has started
 * @param client the client who needs to respond
 * @param data the data received by the client
 */
const handleStart = (client: Socket, data: string) => {
  client.write("void");
};

/**
 * sends a "void" message to the server by the given client when
 * the client receives a message stating the tournament has ended
 * @param client the client who needs to respond
 * @param data the data received by the client
 */
const handleEnd = (client: Socket, data: string) => {
  client.write("void");
};

export { createClient };
