import {
  Argument,
  convertArgumentToOutput,
  isGame,
  isMovements,
  parseMessage,
  sendMessage,
  waitForResponse,
} from "../RemotePlayer/messageConversion";
import { PenguinColor, Board } from "../../Common/board";
import { createNumberedBoard } from "../../Common/Controller/src/boardCreation";
import { createGameState } from "../../Common/Controller/src/gameStateCreation";
import { Game, Player } from "../../Common/state";
import { Movement } from "../../Common/game-tree";
import { gameToInputState } from "../../Common/Controller/src/testHarnessConversion";

const net = require("net");
import { Socket } from "net";

describe("check for game type validity", () => {
  const player1: Player = {
    name: "1",
    color: PenguinColor.Red,
  };
  const player2: Player = {
    name: "2",
    color: PenguinColor.White,
  };

  const numberedBoard: Board = createNumberedBoard([
    [1, 3, 5, 4],
    [3, 2, 4, 1],
    [2, 3, 5, 1],
    [4, 1, 1, 2],
  ]).unsafelyUnwrap();
  const numberedGame = createGameState(
    [player1, player2],
    numberedBoard
  ).unsafelyUnwrap();

  const validGame: Game = numberedGame;
  const invalidGame: any = { a: "hi" };

  it("check for valid game", () => {
    expect(isGame(validGame)).toEqual(true);
  });

  it("check for invalid game", () => {
    expect(isGame(invalidGame)).toEqual(undefined);
  });
});

describe("check for Movements type validity", () => {
  const validMovements: Movement[] = [
    { startPosition: { row: 0, col: 0 }, endPosition: { row: 1, col: 0 } },
    { startPosition: { row: 1, col: 0 }, endPosition: { row: 0, col: 0 } },
  ];
  const invalidMovements: any = { a: "hi" };

  it("check for valid movement", () => {
    expect(isMovements(validMovements)).toEqual(true);
  });

  it("check for invalid game", () => {
    expect(isMovements(invalidMovements)).toEqual(undefined);
  });
});

describe("test parsing of message", () => {
  const placementMessage: string = "[3,4]";
  const movementMessage: string = "[[0,0],[3,4]]";

  it("parse incoming placement message", () => {
    expect(parseMessage(placementMessage)).toEqual([3, 4]);
  });

  it("parse incoming movement message", () => {
    expect(parseMessage(movementMessage)).toEqual([
      [0, 0],
      [3, 4],
    ]);
  });
});

describe("test conversion of outgoing message from logical data representation to appopriate format for the client", () => {
  const player1: Player = {
    name: "1",
    color: PenguinColor.Red,
  };
  const player2: Player = {
    name: "2",
    color: PenguinColor.White,
  };

  const numberedBoard: Board = createNumberedBoard([
    [1, 3, 5, 4],
    [3, 2, 4, 1],
    [2, 3, 5, 1],
    [4, 1, 1, 2],
  ]).unsafelyUnwrap();
  const numberedGame = createGameState(
    [player1, player2],
    numberedBoard
  ).unsafelyUnwrap();

  const outgoingStateMessage: Game = numberedGame;
  const outgoingMovementMessage: Movement[] = [
    { startPosition: { row: 0, col: 0 }, endPosition: { row: 1, col: 0 } },
  ];

  it("convert outgoing state message", () => {
    expect(convertArgumentToOutput(outgoingStateMessage)).toEqual(
      gameToInputState(outgoingStateMessage)
    );
  });

  it("convert outgoing movement message", () => {
    expect(convertArgumentToOutput(outgoingMovementMessage)).toEqual([
      [
        [0, 0],
        [1, 0],
      ],
    ]);
  });
});

describe("test sending a message to the given client", () => {
  const placementMessage: string = "[3,4]";
  const movementMessage: string = "[[0,0],[3,4]]";

  const player1: Player = {
    name: "1",
    color: PenguinColor.Red,
  };
  const player2: Player = {
    name: "2",
    color: PenguinColor.White,
  };

  const numberedBoard: Board = createNumberedBoard([
    [1, 3, 5, 4],
    [3, 2, 4, 1],
    [2, 3, 5, 1],
    [4, 1, 1, 2],
  ]).unsafelyUnwrap();
  const numberedGame = createGameState(
    [player1, player2],
    numberedBoard
  ).unsafelyUnwrap();

  let data_recvd: string = "";

  const createDummyServer = (port: number, name: string, args: Argument[]) => {
    const server = net.createServer();
    // server starts listening for connections
    server.listen(port, "localhost");
    server.on("connection", (socket: Socket) => {
      sendMessage(socket, name, args);
      socket.end();
      server.close();
    });
  };

  const createDummyClient = (port: number): Promise<string> => {
    return new Promise((resolve) => {
      const client = net.connect(port, "localhost");
      client.on("connect", () => {
        // client sends name to server upon connection
      });
      client.once("data", (data: string) => {
        data_recvd = data.toString();
        resolve(data_recvd);
      });
    });
  };

  createDummyServer(1234, "playing-as", [PenguinColor.Red]);

  createDummyServer(2345, "playing-with", [
    PenguinColor.Red,
    PenguinColor.White,
    PenguinColor.Black,
  ]);

  createDummyServer(3456, "start", [true]);

  createDummyServer(4567, "end", [true]);

  createDummyServer(5678, "setup", [numberedGame]);

  createDummyServer(6789, "take-turn", [numberedGame]);

  it("send a 'playing-as' message to client", () => {
    createDummyClient(1234).then((str: string) => {
      expect(str).toEqual('["playing-as",["Red"]]');
    });
  });

  it("send a 'playing-with' message to client", () => {
    createDummyClient(2345).then((str: string) => {
      expect(str).toEqual('["playing-with",["Red","White","Black"]]');
    });
  });

  it("send a 'start' message to client", () => {
    createDummyClient(3456).then((str: string) => {
      expect(str).toEqual('["start",[true]]');
    });
  });

  it("send a 'end' message to client", () => {
    createDummyClient(4567).then((str: string) => {
      expect(str).toEqual('["end",[true]]');
    });
  });

  it("send a 'setup' message to client", () => {
    createDummyClient(5678).then((str: string) => {
      expect(str).toEqual(
        '["setup",[{"players":[{"color":"Red","score":0,"places":[]},{"color":"White","score":0,"places":[]}],"board":[[1,3,5,4],[3,2,4,1],[2,3,5,1],[4,1,1,2]]}]]'
      );
    });
  });

  it("send a 'take-turn' message to client", () => {
    createDummyClient(6789).then((str: string) => {
      expect(str).toEqual(
        '["take-turn",[{"players":[{"color":"Red","score":0,"places":[]},{"color":"White","score":0,"places":[]}],"board":[[1,3,5,4],[3,2,4,1],[2,3,5,1],[4,1,1,2]]}]]'
      );
    });
  });
});
