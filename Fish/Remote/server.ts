import {
    TournamentPlayer
  } from "../Common/player-interface";
  import {
    runTournament
  } from "../Common/Controller/src/manager";

import { createSamplePlayer } from "../Player/player";
import { createRemotePlayer } from "./remotePlayer";

const net = require('net'); 

const port = 1234; 

const host = 'localhost'; 

const server = net.createServer(); 

server.listen(port, host, () => { 
console.log(`TCP server listening on ${host}:${port}`); 
}); 

let sockets : any[] = []; 

let players : TournamentPlayer[] = [];

server.on('connection', (socket : any) => { 

var clientAddress = `${socket.remoteAddress}:${socket.remotePort}`; 

console.log(`new client connected: ${clientAddress}`); 

        let player : TournamentPlayer = createRemotePlayer(players.length.toString(), socket)
        players.push(player)
        console.log("adding player", player)
        
        if(players.length === 10) {
            console.log("starting tournament")
            console.log(players);
            runTournament({rows : 5, cols : 5, numFish: 2}, players).unsafelyUnwrap().then((debrief) => {
                console.log("tournament over")
                sockets.forEach((sock) => {
                    sock.write(JSON.stringify(debrief))
                    sock.end(() => {
                        console.log("closing connection with", `${sock.remoteAddress}:${sock.remotePort}`)
                    })
                })
                server.close()
            })
            }
            

sockets.push(socket); 

    socket.on('error', (err : any) => { 
    console.log(`Error occurred in ${clientAddress}: ${err.message}`); 
        }); 
    });
