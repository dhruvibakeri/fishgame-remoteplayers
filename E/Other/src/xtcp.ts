import { stdout } from "process";
import { Duplex } from "stream";
const NetcatServer = require("netcat/server");
import { parseJsonSequence, generateOutput } from "./xjson";

const DEFAULT_PORT = 4567;

class ProcessStream extends Duplex {
  jsonBuffer: string = ""; // rename

  write(chunk: any) {
    this.jsonBuffer += chunk.toString();
    return true;
  }

  read() {
    return generateOutput(parseJsonSequence(this.jsonBuffer));
  }
}

// setup
const nc = new NetcatServer();
const processStream: ProcessStream = new ProcessStream();

// connect
console.log("starting server");
nc.port(DEFAULT_PORT).listen().pipe(processStream);

nc.on("ready", () => {
  console.log("server is ready!");
});

nc.on("waitTimeout", () => {
  console.log("timeout");
  nc.close();
});

nc.on("connection", () => {
  console.log("client has connected!");
});

nc.on("clientClose", () => {
  console.log("client has disconnected :^(");
});
