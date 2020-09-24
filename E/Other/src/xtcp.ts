import { Socket } from "net";
const NetcatServer = require("netcat/server");
import { parseJsonSequence, generateOutput } from "./xjson";

const DEFAULT_PORT = 4567;
const WAIT_TIME = 3000;

const nc = new NetcatServer();
let timer: NodeJS.Timeout;

nc.port(DEFAULT_PORT).listen();

nc.on("data", (socket: Socket, chunk: any) => {
  const parsedOutput: string = generateOutput(
    parseJsonSequence(chunk.toString())
  );
  socket.write(parsedOutput);
});

nc.on("ready", () => {
  timer = setTimeout(() => {
    console.log("error. server terminated due to client inactivity.");
    nc.close();
  }, WAIT_TIME);
});

nc.on("connection", () => {
  clearTimeout(timer);
});
