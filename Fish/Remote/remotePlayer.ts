import { Socket } from "net";
import { GameDebrief, TournamentPlayer,
  MakePlacement,
  MakeMovement,
  AssignColor,
  WonTournament,
  PlayingAgainst, TournamentIsStarting } from "../Common/player-interface";
import { Game } from "../Common/state";
import { BoardPosition, PenguinColor } from "../Common/board";
import { Movement } from "../Common/game-tree";
import { InputPosition } from "../Common/Controller/src/testHarnessInput";
import { inputPositionToBoardPosition, inputPositionsToMovement } from "../Common/Controller/src/testHarnessConversion";
import { sendMessage, parseMessage } from "./messageConversion";

/**
 * Implementation of the player-referee protocol GameIsStarting call.
 * This is to let the player know that the game they are participating in is
 * beginning. At this point, this player implementation doesn't need to do
 * anything with this information but we define the function in case that
 * another implementation does.
 *
 * @param game the initial Game state of the game
 */
const gameIsStarting = (game: Game): void => {
    return;
}

/**
 * Function to let the player know that the game has ended, and to inform them
 * of the game's outcome using a GameDebrief.
 *
 * @param gameDebrief the game's final outcome
 */
const gameHasEnded = (gameDebrief: GameDebrief): void => {
    return;
};

/**
 * Function to let the player know they've been disqualified. At this point,
 * this player implementation doesn't need to do anything with this information
 * but we define the function in the case that another implementation does
 * want to handle disqualification.
 *
 * @param msg message indicating why the player was disqualified
 */
const disqualifyMe = (msg: string): void => {
    return;
};

/**
 * Implementation of TournamentIsStarting for a remote player, and translates
 * the TournamentIsStarting function call into a socket message for the remote client.
 * @param socket the socket that the client is listening on.
 */
const tournamentIsStarting = (socket: Socket): TournamentIsStarting => {
    return (hasTournamentStarted: boolean): void => {
      sendMessage(socket, "start", [hasTournamentStarted])
    }
  }


/**
 * Implementation of MakePlacement for a remote player. Translate the
 * MakePlacement function call into a socket message for the remote client,
 * and then translate the client response back into the expected response for MakePlacement.
 * @param socket the socket that the client is listening on.
 */
const makePlacement = (socket: Socket): MakePlacement => {
  return (game: Game): Promise<BoardPosition> => {
    return new Promise((resolve, reject) => {
      sendMessage(socket, "setup", [game]);
      socket.on('data', function(data : string) {
        const inputPosition = parseMessage(data) as InputPosition; 
        const boardPosition = inputPositionToBoardPosition(inputPosition);
        resolve(boardPosition);
      });      
    });
  }
}

/**
 * Implementation of MakeMovement for a remote player. Translates the
 * MakeMovement function call into a socket message for the remote client,
 * and then translate the client response back into the expected response for
 * MakeMovement.
 * @param socket the socket that the client is listening on.
 */
const makeMovement = (socket: Socket): MakeMovement => {
    return (game: Game, movementsSoFar?: Movement[]): Promise<Movement> => {
        return new Promise((resolve, reject) => {
            sendMessage(socket, "take-turn", [game, movementsSoFar as Movement[]]);
            socket.on('data', function (data: string) {
                const inputMove = parseMessage(data) as [InputPosition, InputPosition]; 
                const movement = inputPositionsToMovement(inputMove[0], inputMove[1]);
                resolve(movement);
            });
        });
    }
}

/**
 * Implementation of WonTournament for the remote player,
 * Informs the client of their tournament result (true for won,
 * false for loss), and then accepts that result if the client
 * responds.
 * @param socket the socket that the client is listening on.
 */
const wonTournament = (socket: Socket): WonTournament => {
  return (didIWin: boolean): Promise<boolean> => {
    sendMessage(socket, "end", [didIWin]);
    return Promise.resolve(true);
  }
}

/**
 * Implementation of AssignColor for the remote player.
 * Informs the client of the color that they will be playing as
 * for the current game.
 * @param socket the socket that the client is listening on.
 */
const assignColor = (socket: Socket): AssignColor => {
  return (color: PenguinColor): void => {
    sendMessage(socket, "playing-as", [color])
  }
}

/**
 * Implementation of PlayingAgainst for the remote player.
 * Informs the client of the colors of the opponents that they will
 * be facing for this current game.
 * @param socket the socket that the client is listening on.
 */
const playingAgainst = (socket : Socket): PlayingAgainst => {
  return (colors :PenguinColor[]) : void => {
    sendMessage(socket, "playing-with", colors)
  }
}

/**
 * Creates a RemotePlayer protocol, which will translate player actions
 * and function calls into socket-messages, and translate client responses
 * into Game data.
 *
 * @param name the name of the client player
 * @param socket the socket that the client is listening on.
 */
export const createRemotePlayer = (name: string, socket: Socket): TournamentPlayer => {
  return {
    name,
    gameIsStarting,
    tournamentIsStarting : tournamentIsStarting(socket),
    makePlacement : makePlacement(socket),
    makeMovement : makeMovement(socket),
    gameHasEnded,
    disqualifyMe,
    wonTournament : wonTournament(socket),
    playingAgainst : playingAgainst(socket),
    assignColor: assignColor(socket),
  };
}

module.exports = {
  createRemotePlayer
}