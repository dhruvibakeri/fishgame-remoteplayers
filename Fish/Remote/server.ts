import {
    TournamentPlayer
  } from "../Common/player-interface";
  import {
    runTournament
  } from "../Common/Controller/src/manager";

import { createSamplePlayer } from "../Player/player";
import { createRemotePlayer } from "./remotePlayer";
import { Socket } from "dgram";

const net = require('net'); 

const port = 1234; 

const host = 'localhost'; 

const server = net.createServer(); 

let readyForTournament : boolean = false;

let tournamentStarted : boolean = false;

/**
 * 
 * Create Server ( PORT ) 
 * 
 * Sign Up period: 30s 
 *  - Minimum: 5 Players
 *  - Maximum: 10 Players
 * 
 * On Connection: 
 *  - check name + maximum limits
 *  - create remote proxy and add to player array
 *  - start tournament if maximum reached -- otherwises keep waiting
 * 
 * If Sign Up period over:
 *  - not enough players? Try once more
 *  - enough players? Start Tournament
 * 
 * Tournament Started: 
 *  - manager given players
 *  - tournament runs
 *  - Server prints output and then shuts down
 * 
 */

server.listen(port, host, () => { 
console.log(`TCP server listening on ${host}:${port}`);
setTimeout(signUpProtocol, 3000); 
}); 

const signUpProtocol = () => {
    server.getConnections(function (error: any, count: any) {
        if (count < 5) {
            console.log("re-entering waiting stage")
            setTimeout(() => {
                server.getConnections(function (error: any, count: any) {
                    if(count < 5) {
                        throw Error('Minimum player count not reached')
                    }
                    else {
                        getReadyForTournament();
                        tournamentStarted = true;
                        runTournament({rows : 5, cols : 5, numFish: 2}, players)
                    }
                });
            }, 3000)
        }
        else {
            getReadyForTournament();
            tournamentStarted = true;
            runTournament({rows : 5, cols : 5, numFish: 2}, players)
        }

    });
}

let sockets : any[] = []; 

let players : TournamentPlayer[] = [];

let connections : number = 0

server.on('connection', (socket : any) => { 

    connections += 1;

    var clientAddress = `${socket.remoteAddress}:${socket.remotePort}`; 

    console.log(`new client connected: ${clientAddress}`); 

    

    socket.on('data', (data : any) => {     
        //names = names + data.toString()
        if(!tournamentStarted) {
            console.log("name received")
            let player : TournamentPlayer = createRemotePlayer(data.toString(), socket)
            players.push(player)
            console.log("adding player", player) 
        }
        else {
            socket.emit('data-received', data)
        }
    })
    
    sockets.push(socket); 

    
        if(connections === 10) {
            readyForTournament = true;
            console.log("max player limit reached")
            server.close()
        }

    socket.on('error', (err : any) => { 
    console.log(`Error occurred in ${clientAddress}: ${err.message}`); 
    }); 
});


const getReadyForTournament = () => {
    console.log("sign up period over")
    readyForTournament = true;
    server.close();
}






    /*let player : TournamentPlayer = createRemotePlayer(players.length.toString(), socket)
        players.push(player)
        console.log("adding player", player)
        
        if(players.length === 10) {
            console.log("starting tournament")
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
            }*/
