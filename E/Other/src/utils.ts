const MAX_PORT = 65535;
const MIN_PORT = 3000; // Specified on Piazza as the minimum port to be used
const DEFAULT_PORT = 4567;

/**
 * Takes in an array of command line arguments and tries to parse it into a
 * valid TCP port.
 *
 * @param args Array of strings representing arguments.
 * @returns The parsed port number.
 */
const parsePort = (args: string[]): number => {
  return validatePort(validateNumberOfArgs(args));
};

/**
 * Takes in a number and checks whether it is a valid TCP port, returning
 * the number if so.
 *
 * @param port String representing the port.
 * @returns The valid port
 */
const validatePort = (port: number): number => {
  if (!isNaN(port) && port > MIN_PORT && port <= MAX_PORT) {
    return port;
  } else {
    console.log("Invalid port number: " + port);
    process.exit();
  }
};

/**
 * Checks if there are no more than three command line arguments in the given
 * array of strings, returning the parsed argument if it exists, a default if
 * it doesn't, and logging a usage message and ending the program otherwise.
 *
 * @param args Array of strings representing arguments.
 * @returns The third argument parsed into a number as the port or the default.
 */
const validateNumberOfArgs = (args: string[]): number => {
  if (args.length === 3) {
    return parseInt(args[2]);
  } else if (args.length < 3) {
    return DEFAULT_PORT;
  } else {
    console.log("Usage: ./xtcp [TCP-port-number]");
    process.exit();
  }
};

export default parsePort;
