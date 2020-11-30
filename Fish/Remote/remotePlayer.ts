import { Socket } from "net";
import { GameDebrief, TournamentPlayer,
  GameIsStarting,
  MakePlacement,
  MakeMovement,
  GameHasEnded,
  DisqualifyMe,
  AssignColor,
  WonTournament,
  PlayingAgainst, TournamentIsStarting } from "../Common/player-interface";
import { Game, MovementGame } from "../Common/state";
import { BoardPosition, PenguinColor } from "../Common/board";
import { getNextPenguinPlacementPosition, chooseNextAction } from "../Common/Controller/src/strategy";
import { Movement } from "../Common/game-tree";
import { InputState, Action, InputPosition } from "../Common/Controller/src/testHarnessInput";
import { movementToAction, gameToInputState, inputPositionToBoardPosition, inputPositionsToMovement } from "../Common/Controller/src/testHarnessConversion";



/**
 * Implementation of the player-referee protocol GameIsStarting call.
 * This is to let the player know that the game they are participating in is
 * beginning. At this point, this player implementation doesn't need to do
 * anything with this information but we define the function in case that
 * another implementation does.
 *
 * @param game the initial Game state of the game
 */



// TODO
const tournamentIsStarting = (socket: Socket): TournamentIsStarting => {
    return (hasTournamentStarted: boolean): void => {
      sendMessage(socket, "start", [hasTournamentStarted])
    }
  }

// TODO
const gameIsStarting = (game: Game): void => {
  return;
}

// TODO
const makePlacement = (socket: Socket): MakePlacement => {
  return (game: Game): Promise<BoardPosition> => {
    return new Promise((resolve, reject) => {
      sendMessageGame(socket, "setup", [game]);
      socket.on('data', function(data : string) {
        const inputPosition = parseMessage(data) as InputPosition; 
        const boardPosition = inputPositionToBoardPosition(inputPosition);
        resolve(boardPosition);
      });      
    });
  }
}

// TODO
const makeMovement = (socket: Socket): MakeMovement => {
    return (game: Game, movementsSoFar?: Movement[]): Promise<Movement> => {
        return new Promise((resolve, reject) => {
            sendMessageMovement(socket, "take-turn", [game, movementsSoFar as Movement[]]);
            socket.on('data', function (data: string) {
                const inputMove = parseMessage(data) as [InputPosition, InputPosition]; 
                const movement = inputPositionsToMovement(inputMove[0], inputMove[1]);
                resolve(movement);
            });
        });
    }
}


//TODO
const parseMessage = (message : string) : [InputPosition, InputPosition] | InputPosition => {
  const data = JSON.parse(message);

  if (isInputPosition(data)) {
    return data as InputPosition;
  }

  if (isTuplePositions(data)) {
    return data as [InputPosition, InputPosition];
  }

  return data;
}

function isInputPosition(data: any): data is InputPosition {
  return true;
}

function isTuplePositions(data : any): data is [InputPosition, InputPosition] {
    return true;
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


const wonTournament = (socket: Socket): WonTournament => {
  return (didIWin: boolean): Promise<boolean> => {
    sendMessage(socket, "end", [didIWin]);
    return Promise.resolve(true);
  }
}

const assignColor = (socket: Socket): AssignColor => {
  return (color: PenguinColor): void => {
    const message = ["playing-as", [color]];
    sendMessage(socket, "playing-as", [color])
  }
}

const playingAgainst = (socket : Socket): PlayingAgainst => {
  return (colors :PenguinColor[]) : void => {
    sendMessage(socket, "playing-with", colors)
  }
}

type Argument = PenguinColor | PenguinColor[] | Game | Movement[] | boolean;

type OutputObj = PenguinColor | PenguinColor[] | InputState | Action[] | boolean;

function isGame(arg: Argument): arg is Game {
  return (arg as Game).board && (arg as Game).players && true;
}

function isMovements(arg: Argument): arg is Movement[] {
  return (arg as Movement[]).every((movement: Movement) => movement.endPosition && movement.startPosition && true);
}

const argumentToOut = (arg: Argument): OutputObj => {
  if (isGame(arg)) {
    return gameToInputState(arg as Game);
  }

  if (isMovements(arg)) {
    return (arg as Movement[]).map(movementToAction) as Action[];
  }

  return arg;
}

const sendMessage = (socket: Socket, name: string, args: Array<Argument>): void => {
  const message = [name, args.map((arg) => arg)];
  socket.write(JSON.stringify(message));
}

const sendMessageGame = (socket: Socket, name: string, args: Array<Argument>): void => {
    const message = [name, args.map((arg) => gameToInputState(arg as Game))];
    socket.write(JSON.stringify(message));
  }

const sendMessageMovement = (socket: Socket, name: string, args: Array<Argument>): void => {
    const message = [name, args.map((arg) => (arg as Movement[]).map(movementToAction) as Action[])];
    socket.write(JSON.stringify(message));
}


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