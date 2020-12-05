import { TournamentPlayer } from "../../Common/player-interface";
import { runTournament } from "../../Common/Controller/src/manager";
import { createRemotePlayer } from "./../RemotePlayer/remotePlayer";
import { BoardParameters } from "../../Common/Controller/src/referee";
import { Server, Socket } from "net";
import { parseJsonSequence } from "./../Other/json-utils";

const net = require("net");

// Minimum number of players required to start a tournament
const MIN_CONNECTIONS = 5;
// Maximum number of players allowed in a tournament
const MAX_CONNECTIONS = 10;
// Wait time for a server to accept player sign ups
const SIGNUP_PERIOD = 30000;
// Number of times server can go into a waiting stage to accept player sign ups
const SIGNUP_ATTEMPTS = 2;

/**
 * Type representing a connected player
 * TournamentPlayer - TournamentPlayer object
 * Socket - Socket to which the given player is connected
 */
type ConnectedPlayer = [TournamentPlayer, Socket];

/**
 * Type representing the Server options
 * minConnections - number of minimum connections allowed
 * maxConnections - number of maximum connections allowed
 * signupPeriod - waiting time allowed for players to sign up
 * signupAttempts - number of signup attempts allowed for a tournament
 * boardParams - board parameters for the entire tournament
 */
type ServerOpts = {
  readonly minConnections: number;
  readonly maxConnections: number;
  readonly signupPeriod: number;
  readonly signupAttempts: number;
  readonly boardParams: BoardParameters;
};

// default server options
const defaultOpts: ServerOpts = {
  minConnections: MIN_CONNECTIONS,
  maxConnections: MAX_CONNECTIONS,
  signupAttempts: SIGNUP_ATTEMPTS,
  signupPeriod: SIGNUP_PERIOD,
  boardParams: { rows: 5, cols: 5, numFish: 2 },
};

/**
 * Starts up a server on the given port and host, with the given server options.
 * @param port port to start server on
 * @param host host to host server on
 * @param opts options for the server, set to default unless otherwise mentioned
 */
const createServer = async (
  port: number,
  host: string,
  opts: ServerOpts = defaultOpts
) => {
  opts = Object.assign({}, defaultOpts, opts);
  // creates a server object
  const server = net.createServer();
  // server starts listening for connections
  server.listen(port, host);
  // console.log("server started");

  // starts sign up period and collects players according to the signup protocol
  const players: ConnectedPlayer[] = await signUpProtocol(server, opts);

  if (players.length !== 0) {
    // starts listening for messages from the connected players
    players.forEach(([, socket]) => {
      socket.on("data", (data: string) => {
        const messages = parseJsonSequence(new String(data.toString()));
        messages.forEach((message: String) => {
          // emits a 'data-received' event for each message received
          socket.emit("data-received", message.toString());
        });
      });
    });

    // starts up a tournament with the given players and board parameters
    const results = await runTournament(
      opts.boardParams,
      players.map(([tp]) => tp)
    ).unsafelyUnwrap();
    // ends connection with players after tournament is over
    players.forEach(([, socket]) => socket.destroy());
    // prints out results
    console.log([
      results.winners.length,
      results.cheatingOrFailingPlayers.length,
    ]);
  }
};

/**
 * starts up a sign up period and awaits client connections on the given sever,
 * based on the given server options
 * @param server server to start up sign up period for
 * @param opts options for the server
 */
const signUpProtocol = (
  server: Server,
  opts: ServerOpts
): Promise<ConnectedPlayer[]> => {
  // list to keep track of connected players
  const players: ConnectedPlayer[] = [];
  // list to keep track of names taken by players
  const usedNames: Set<string> = new Set<string>();

  return new Promise((resolve) => {
    let attemptsLeft = opts.signupAttempts - 1;

    // checks whether after the allowed sign up period, required number of players have connected to the server
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

    // every time a connection on the server is established
    server.on("connection", (socket: Socket) => {
      // console.log(
      //   "connection made with " + `${socket.remoteAddress}:${socket.remotePort}`
      // );

      // creates a remote player with the name given by the client
      socket.once("data", (data: string) =>
        createPlayerIfValidName(data, usedNames, socket, players)
      );

      // if player count reaches the maximum limit, the server stops accepting new connections.
      if (players.length > opts.maxConnections) {
        server.close();
        clearInterval(timer);
        resolve(players);
      }
    });
  });
};

/**
 * Checks whether after the allowed sign up period, required number of
 * players have connected to the server
 * @param attemptsLeft count of sign up period attempts left
 * @param server server to connect the players to
 * @param timer timer to keep track of the sign up period time limit
 * @param players list of players connected to the server
 * @param opts server options
 * @param resolve
 */
const resolvePlayersIfLegal = (
  attemptsLeft: number,
  server: Server,
  timer: any,
  players: ConnectedPlayer[],
  opts: ServerOpts,
  resolve
) => {
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
};

/**
 * Creates a new player if the given name is a valid name.
 * @param data name received from client
 * @param usedNames names occupied by currently connected players
 * @param socket socket concerning the client
 * @param players list of connected playeres
 */
const createPlayerIfValidName = (
  data: string,
  usedNames: Set<String>,
  socket: Socket,
  players: ConnectedPlayer[]
) => {
  const name = data.toString();
  if (usedNames.has(name)) {
    socket.destroy(
      new Error(
        `${name} has been taken already by another player. Please use another name`
      )
    );
  } else {
    const player = createRemotePlayer(data.toString(), socket);
    // console.log("adding player", player);
    players.push([player, socket]);
  }
};

export { createServer };
