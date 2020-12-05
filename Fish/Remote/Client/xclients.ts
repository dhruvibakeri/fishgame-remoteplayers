import { createClient } from "./client";
import {parentPort, workerData, Worker} from "worker_threads";
const worker = require('worker_threads');

const MIN_CONNECTIONS = 5;
const MAX_CONNECTIONS = 10;
const MIN_ARG_COUNT = 2;

const parseClientCount = (arg: string): number => {
  let numClients;

  try {
    numClients = parseInt(arg);
  } catch {
    throw new Error("Could not parse the number of clients. Please specify a number");
  }

  if (numClients < MIN_CONNECTIONS || numClients > MAX_CONNECTIONS) {
    throw new Error(`Please specify a number from ${MIN_CONNECTIONS} - ${MAX_CONNECTIONS} for n`);
  }
  return numClients;
}

const parsePort = (arg: string): number => {
  let port;
  try {
    port = parseInt(arg);
  } catch {
    throw new Error("Could not parse the port number. Please specify a number");
  }

  if (port < 1 || port > 65535) {
    throw new Error("Please specify a number from 1 - 65535 for p");
  }

  return port;
}

const parseArgs = (args: string[]): [number, number, string] => {
  if (args.length < MIN_ARG_COUNT) {
    console.log("Invalid number of arguments. Expected format: ./xclients n p [ip]");
    return;
  }
  args = args.length == MIN_ARG_COUNT ? [...args, "localhost"] : args
  const numClients = parseClientCount(args[0]);
  const port = parsePort(args[1]);
  return [numClients, port, args[2]];
}

/**
 * Consumes command-line input:
 *  n - the number of clients
 *  p - the port to connect to
 *  [ip] - the ip address / host to listen on
 * Connects n remotePlayers to the specified host + port, and
 * then behaves as a player would in a game.
 */
const connectClients = async () => {
  if (worker.isMainThread) {
    const args = process.argv.slice(2);
    const [numClients, port, host]: [number, number, string] = parseArgs(args);
    const connections = [];
    for (let i = 0; i < numClients; i += 1) {
      connections.push(new Promise(resolve => {
        // @ts-ignore
        const w = new Worker(__filename, {workerData: {name: `${i + 1}`, port, host}});
        // @ts-ignore
        w.on('message', resolve(true));
      }))
    }
    await Promise.all(connections);
  } else {
    const {name, port, host} = workerData;
    await createClient(name, port, host);
    parentPort.postMessage("done");
  }
}

connectClients().then(() => {});
