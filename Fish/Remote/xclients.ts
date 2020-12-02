import { inputStateToGameState } from "../Common/Controller/src/testHarnessConversion";
import { Game, getCurrentPlayer } from "../Common/state";

import { createClient } from "./client";

const net = require('net'); 
const PORT = 1234, HOST = 'localhost'; 

const connectClients = (num : number) => {
    for(let i = 0; i < num; i++) {
        const name = `${i + 1}`;
        createClient(name, PORT, HOST);
    };
 };












connectClients(10);