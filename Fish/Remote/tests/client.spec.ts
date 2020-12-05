import {
  changePhaseIfNecessary,
  handleEnd,
  handlePlacing,
  handlePlaying,
  handleStart,
  TournamentPhase,
} from "../Client/client";

const net = require("net");
import { Socket } from "net";

describe("check if client recognizes phase of tournament based on the received message", () => {
  it("recognizes tournament starting phase when 'start' message is sent", () => {
    expect(changePhaseIfNecessary('["start",[true]]')).toEqual(
      TournamentPhase.STARTING
    );
  });

  it("recognizes tournament starting phase when 'playing-as' message is sent", () => {
    expect(changePhaseIfNecessary('["playing-as",["Red"]]')).toEqual(
      TournamentPhase.STARTING
    );
  });

  it("recognizes tournament starting phase when 'playing-with' message is sent", () => {
    expect(
      changePhaseIfNecessary('["playing-with",["Red","White","Black"]]')
    ).toEqual(TournamentPhase.STARTING);
  });

  it("recognizes tournament placing phase when 'setup' message is sent", () => {
    expect(
      changePhaseIfNecessary(
        '["setup",[{"players":[{"color":"Red","score":0,"places":[]},{"color":"White","score":0,"places":[]}],"board":[[1,3,5,4],[3,2,4,1],[2,3,5,1],[4,1,1,2]]}]]'
      )
    ).toEqual(TournamentPhase.PLACING);
  });

  it("recognizes tournament playing phase when 'take-turn' message is sent", () => {
    expect(
      changePhaseIfNecessary(
        '["take-turn",[{"players":[{"color":"Red","score":0,"places":[]},{"color":"White","score":0,"places":[]}],"board":[[1,3,5,4],[3,2,4,1],[2,3,5,1],[4,1,1,2]]}]]'
      )
    ).toEqual(TournamentPhase.PLAYING);
  });

  it("recognizes tournament ending phase when 'end' message is sent", () => {
    expect(changePhaseIfNecessary('["end",[true]]')).toEqual(
      TournamentPhase.ENDED
    );
  });

  it("changes phase to INITIAL if invalid message is sent", () => {
    expect(changePhaseIfNecessary('["enddd",[true]]')).toEqual(
      TournamentPhase.INITIAL
    );
  });
});

describe("test sending a response to the server", () => {
  let data_recvd: string = "";

  const createDummyServer = (port: number) => {
    return new Promise((resolve) => {
      const server = net.createServer();
      // server starts listening for connections
      server.listen(port, "localhost");
      server.on("connection", (socket: Socket) => {
        socket.once("data", (data: string) => {
          data_recvd = data.toString();
          resolve(data_recvd);
        });
        socket.end();
        server.close();
      });
    });
  };

  const createDummyClient = (
    port: number,
    message: string,
    handlingFunction: (client: Socket, str: string) => void
  ): Promise<string> => {
    return new Promise((resolve) => {
      const client = net.connect(port, "localhost");
      client.on("connect", () => {
        handlingFunction(client, message);
      });
    });
  };

  createDummyServer(1111).then((res) => {
    expect(res).toEqual("void");
  });

  createDummyServer(2222).then((res) => {
    expect(res).toEqual("void");
  });
  createDummyServer(3333).then((res) => {
    expect(res).toEqual("void");
  });
  createDummyServer(4444).then((res) => {
    expect(res).toEqual("[0,0]");
  });
  createDummyServer(5555).then((res) => {
    expect(res).toEqual("[[0,2],[2,2]]");
  });
  createDummyServer(1222).then((res) => {
    expect(res).toEqual("void");
  });

  it("send a 'response' for 'start' message to the server", () => {
    createDummyClient(1111, '["start",[true]]', handleStart);
  });

  it("send a 'response' for 'playing-as' message to the server", () => {
    createDummyClient(2222, '["playing-as",["Red"]]', handleStart);
  });

  it("send a 'response' for 'playing-with' message to the server", () => {
    createDummyClient(
      3333,
      '["playing-with",["Red","White","Black"]]',
      handleStart
    );
  });

  it("send a 'response' for 'setup' message to the server", () => {
    createDummyClient(
      4444,
      '["setup",[{"players":[{"color":"Red","score":0,"places":[]},{"color":"White","score":0,"places":[]}],"board":[[1,3,5,4],[3,2,4,1],[2,3,5,1],[4,1,1,2]]}]]',
      handlePlacing
    );
  });

  it("send a 'response' for 'take-turn' message to the server", () => {
    createDummyClient(
      5555,
      '["take-turn",[{"players":[{"color":"Red","score":0,"places":[[0,0],[0,2],[1,0],[1,2]]},{"color":"White","score":0,"places":[[0,1],[0,3],[1,1],[1,3]]}],"board":[[1,3,5,4],[3,2,4,1],[2,3,5,1],[4,1,1,2]]}]]',
      handlePlaying
    );
  });

  it("send a 'response' for 'end' message to the server", () => {
    createDummyClient(1222, "void", handleEnd);
  });
});
