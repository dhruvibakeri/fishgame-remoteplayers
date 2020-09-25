import { Socket } from "net";
const NetcatServer = require("netcat/server");
import { parseJsonSequence, generateOutput } from "./xjson";
import parsePort from "./utils";

const WAIT_TIME = 3000;

const port = parsePort(process.argv);
const nc = new NetcatServer();
let timer: NodeJS.Timeout;

nc.port(port).listen();

nc.on("data", (socket: Socket, chunk: any) => {
  const parsedOutput: string = generateOutput(
    parseJsonSequence(chunk.toString())
  );
  socket.write(parsedOutput);
});

nc.on("ready", () => {
  timer = setTimeout(() => {
    console.log("Server terminated due to client inactivity.");
    nc.close();
  }, WAIT_TIME);
});

nc.on("connection", () => {
  clearTimeout(timer);
});
