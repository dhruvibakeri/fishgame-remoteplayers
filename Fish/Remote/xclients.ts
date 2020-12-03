import { createClient } from "./client";

const PORT = 1234,
  HOST = "localhost";

/**
 * Connects the given number of clients to the server on the given port and host
 * @param num number of clients to be created
 */
const connectClients = (num: number) => {
  for (let i = 0; i < num; i++) {
    const name = `${i + 1}`;
    createClient(name, PORT, HOST);
  }
};

// connects 10 clients to the server
connectClients(10);
