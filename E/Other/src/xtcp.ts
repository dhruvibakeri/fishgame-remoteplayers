import { Transform, Readable } from "stream";
const NetcatServer = require("netcat/server");
import getRawBody from "raw-body";
import { parseJsonSequence, generateOutput } from "./xjson";

const DEFAULT_PORT = 4567;
const LOCALHOST = "127.0.0.1";
const WAIT_TIME = 3000;

const nc = new NetcatServer();
const outputStream: Transform = new Transform();
nc.addr(LOCALHOST)
  .port(DEFAULT_PORT)
  .wait(WAIT_TIME)
  .listen()
  .pipe(outputStream);

getRawBody(outputStream, {
  encoding: true,
})
  .then(parseJsonSequence)
  .then(generateOutput)
  .then((output: string) => {
    const s = new Readable();
    s.push(output);
    s.push(null);
    nc.serve(s);
  })
  .catch((err: string) => alert(err));
