import {
    TournamentPlayer
  } from "../Common/player-interface";
  import {
    runTournament
  } from "../Common/Controller/src/manager";
import { createRemotePlayer } from "./remotePlayer";
import {BoardParameters} from "../Common/Controller/src/referee";
import { Server, Socket } from "net";
import { parseJsonSequence } from "./json-utils";

const net = require('net');

// Minimum number of players required on the tournament
const MIN_CONNECTIONS = 5;
const MAX_CONNECTIONS = 10;
const SIGNUP_PERIOD = 3000;
const SIGNUP_ATTEMPTS = 2;

const port = 1234; 

const host = 'localhost'; 

/**
 * 
 * Create Server ( PORT ) 
 * 
 * Sign Up period: 30s 
 *  - Minimum: 5 Players
 *  - Maximum: 10 Players
 * 
 * On Connection: 
 *  - check name + maximum limits
 *  - create remote proxy and add to player array
 *  - start tournament if maximum reached -- otherwises keep waiting
 * 
 * If Sign Up period over:
 *  - not enough players? Try once more
 *  - enough players? Start Tournament
 * 
 * Tournament Started: 
 *  - manager given players
 *  - tournament runs
 *  - Server prints output and then shuts down
 * 
 */

type ConnectedPlayer = [TournamentPlayer, Socket];

type ServerOpts = {
    readonly minConnections: number,
    readonly maxConnections: number,
    readonly signupPeriod: number,
    readonly signupAttempts: number,
    readonly boardParams: BoardParameters
}

const defaultOpts: ServerOpts = {
    minConnections: MIN_CONNECTIONS,
    maxConnections: MAX_CONNECTIONS,
    signupAttempts: SIGNUP_ATTEMPTS,
    signupPeriod: SIGNUP_PERIOD,
    boardParams: {rows : 5, cols : 5, numFish: 2},
}

const createServer = async (port: number, host: string, opts: ServerOpts = defaultOpts) => {
    opts = Object.assign({}, defaultOpts, opts);
    const server = net.createServer();
    server.listen(port, host);
    console.log("server started");
    const players: ConnectedPlayer[] = await signUpProtocol(server, opts);    
    if (players.length !== 0) {
        players.forEach(([, socket]) => {
            socket.on('data', (data: string) => {
                const messages = parseJsonSequence(new String(data.toString()));
                messages.forEach((message: String) => {
                    socket.emit('data-received', message.toString());
                });
            });
        });

        const results = await runTournament(opts.boardParams, players.map(([tp,]) => tp)).unsafelyUnwrap();
        players.forEach(([, socket]) => socket.destroy());
        console.log("Results:", [results.winners.length, results.cheatingOrFailingPlayers.length]);
    }
}

const signUpProtocol = (server: Server, opts: ServerOpts): Promise<ConnectedPlayer[]> => {
    const players: ConnectedPlayer[] = [];
    const usedNames: Set<string> = new Set<string>();
    return new Promise((resolve) => {
        let attemptsLeft = opts.signupAttempts - 1;
        const timer = setInterval(() => {
            if (attemptsLeft <= 0) {
                server.close();
                clearInterval(timer);
                if (players.length < opts.minConnections) {
                    console.log("Not enough players to start a tournament");
                    players.forEach(([, socket]) => socket.destroy());
                    resolve([]);
                } else {
                    resolve(players);
                }
            } else {
                attemptsLeft -= 1;
            }
        }, opts.signupPeriod);

        server.on("connection", (socket: Socket) => {
            console.log("connection made with " + `${socket.remoteAddress}:${socket.remotePort}` );
            socket.once('data', (data: string) => {
                const name = data.toString();
                if (usedNames.has(name)) {
                    socket.destroy(new Error(`${name} has been taken already by another player. Please use another name`));
                } else {
                    const player = createRemotePlayer(data.toString(), socket);
                    console.log("adding player", player)
                    players.push([player, socket]);
                }
            });
    
            if (players.length > opts.maxConnections) {
                server.close();
                clearInterval(timer);
                resolve(players);
            }
        });
    });
}

createServer(port, host);

export { createServer };

