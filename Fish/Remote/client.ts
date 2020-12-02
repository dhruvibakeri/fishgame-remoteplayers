import { Socket } from "net";
import { inputStateToGameState, movementToAction, boardPositionToInputPosition } from "../Common/Controller/src/testHarnessConversion";
import { Game, MovementGame } from "../Common/state";
import { getNextPenguinPlacementPosition, chooseNextAction } from "../Common/Controller/src/strategy";
import { Movement } from "../Common/game-tree";
import { Maybe } from "true-myth";
import { BoardPosition } from "../Common/board";
import { parseJsonSequence } from "./json-utils";

const net = require('net'); 

enum TournamentPhase {
    INITIAL,
    STARTING,
    ENDED,
    PLACING,
    PLAYING
}

const createClient = (name: string, port: number, host: string) => {
    const client = net.connect(port, host);
    let currentPhase: TournamentPhase = TournamentPhase.INITIAL;
    client.on("connect", () => {
        client.write(name);
    });
    
    client.on("data", (data: string) => {
        const messages : String[] = parseJsonSequence(new String(data));
        console.log("client messages",messages)
        messages.forEach((message: String) => {
            console.log("message:", message);
            currentPhase = changePhaseIfNecessary(message as string);
            switch(currentPhase) {
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
}

const changePhaseIfNecessary = (data: string) => {
    const parsed = JSON.parse(data);
    if (parsed[0] === "start" && parsed[1][0] === true) {
        console.log("changing phase to start")
        return TournamentPhase.STARTING;
    } 
    if (parsed[0] === "playing-as") {
        console.log("changing phase to start")
        return TournamentPhase.STARTING;
    }
    if (parsed[0] === "playing-with") {
        console.log("changing phase to start")
        return TournamentPhase.STARTING;
    }
    if (parsed[0] === "setup") {
        console.log("changing phase to placing")
        return TournamentPhase.PLACING;
    }
    if (parsed[0] === "take-turn") {
        console.log("changing phase to playing")
        return TournamentPhase.PLAYING;
    }
    if (parsed[0] === "end") {
        console.log("changing phase to end")
        return TournamentPhase.ENDED;
    }
    return TournamentPhase.INITIAL;
}

const handlePlacing = (client: Socket, data: string) => {
    console.log("handling placing")
    const parsed = JSON.parse(data);
    const game: Game = inputStateToGameState(parsed[1][0]).unsafelyUnwrap();
    const nextPos: Maybe<BoardPosition> = getNextPenguinPlacementPosition(game);
    nextPos.map((pos: BoardPosition) => {
        console.log("sending placement", JSON.stringify(boardPositionToInputPosition(pos)))
        client.write(JSON.stringify(boardPositionToInputPosition(pos)));
        return pos;
    });
}

const handlePlaying = (client: Socket, data: string) => {
    console.log("handling playing")
    const parsed = JSON.parse(data);
    const game: Game = inputStateToGameState(parsed[1][0]).unsafelyUnwrap();
    const nextMovement: Maybe<Movement> = chooseNextAction(game as MovementGame, 2);
    nextMovement.map((move : Movement) => {
        console.log("sending movement", JSON.stringify(movementToAction(move)))
        client.write(JSON.stringify(movementToAction(move)))   
        return move;
    });
}


const handleStart = (client : Socket, data : string) => {
     console.log("handling start")
     client.write("void");
}

const handleEnd = (client : Socket, data : string) => {
    console.log("handling end")
    client.write("void");
}

export { createClient };