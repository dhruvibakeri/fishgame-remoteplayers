const { createServer } = require("./server");

const MIN_ARG_COUNT = 1;
const HOST = "localhost";

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

const parseArgs = (args: string[]): [number] => {
    if (args.length < MIN_ARG_COUNT) {
        throw new Error("Invalid number of arguments. Expected format: ./xserver p")
    }

    const port = parsePort(args[0]);
    return [port];
}
/**
 * Consumes command-line input:
 *  p - the port number to start the server on
 * Starts the tournament server on ${HOST} on port p,
 * and then waits for players to connect before executing.
 */
const startServer = () => {
    const args = process.argv.slice(2);
    try {
        const [port]: [number] = parseArgs(args);
        createServer(port, HOST);
    } catch (e) {
        console.log(e.message);
    }
}

startServer();