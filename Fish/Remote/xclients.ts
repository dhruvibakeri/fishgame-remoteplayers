import { createClient } from "./client";

const PORT = 1234, HOST = 'localhost'; 

const connectClients = (num : number) => {
    for(let i = 0; i < num; i++) {
        const name = `${i + 1}`;
        createClient(name, PORT, HOST);
    };
 };

connectClients(10);