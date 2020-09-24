import { Socket } from "net";
const NetcatServer = require("netcat/server");
import { parseJsonSequence, generateOutput } from "./xjson";
import { checkArgs, parsePort } from "./utils";

checkArgs(process.argv);

const DEFAULT_PORT = 4567;
const WAIT_TIME = 3000;
const PORT = process.argv[2] ? parsePort(process.argv[2]) : DEFAULT_PORT;

const nc = new NetcatServer();
let timer: NodeJS.Timeout;

nc.port(PORT).listen();

nc.on("data", (socket: Socket, chunk: any) => {
  const parsedOutput: string = generateOutput(
    parseJsonSequence(chunk.toString())
  );
  socket.write(parsedOutput);
});

nc.on("ready", () => {
  timer = setTimeout(() => {
    nc.close();
  }, WAIT_TIME);
});

nc.on("connection", () => {
  clearTimeout(timer);
});



