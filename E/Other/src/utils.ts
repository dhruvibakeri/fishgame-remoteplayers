/**
 * Takes in a string and checks if it can be parsed to a valid TCP port
 * if not, logs usage message and ends program
 *
 * @param port string representing the port
 */
const parsePort = (port: string) => {
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 0 || portNum > 65535) {
        console.log("Usage: ./xtcp [TCP-port-number]");
        process.exit();
    };
    return portNum;
};

/**
 * Checks if there are more than the expected 3 arguments
 * if not, logs usage message and ends program
 *
 * @param args array of strings representing arguments
 */
const checkArgs = (args: string[]) => {
    if (args.length > 3) {
        console.log("Usage: ./xtcp [TCP-port-number]");
        process.exit();
    };
};

export { parsePort, checkArgs };