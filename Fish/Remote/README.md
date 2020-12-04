## File Organization for Fish/Remote/

- `Fish`
  - `Remote`
    - `Client` : Folder containing files related to client implementation.
      - `client.ts` : contains implementation for the client component.
      - `xclients.ts` : contains implementation for pointing x clients to a certain server.
    - `Server` : Folder containing files related to server implementation.
      - `server.ts` : contains server implementation for the fish game.
    - `RemotePlayer` : Folder containing files related to remote player implementation.
      - `messageConversion.ts` : contains implementation for functions related to validating messages being sent to the server from the client, parsing them approriately, and also sending a message back to the client.
      - `remotePlayer.ts` : contains implementation for the remote player component.
    - `Other` : Folder containing files related to other utility implementations.
      - `json-utils.ts` : contains functions for a parser for a sequence of JSON (assignment C)
    - `README.md` : README explaining Fish/Remote/ file structure and

## Modifications made in other code

- `Fish/Common/Controller/src/referee.ts` :
  //TODO:
  - Including optional argument for movementSoFar
- `Fish/Common/Controller/src/strategy.ts` :
  - The strategy by the client initially took around 2-3 seconds to get the best action during the first few calls made while playing a game on a 5x5 board. This led to a total of 5 seconds for a complete interaction between the referee and the remote player, which was too long.
  - We realized that we were looking through one extra layer to get the minmax score of the maximizing player.
    - Let's say our player is looking for a best action with depth `n`.
    - **Assuming** that the game always starts with `x` number of fish on every tile (which is the case in our implementation), we do not need to go over different movement possibilities for the maximizing player when `depth === 2` and it is the maximizing player's turn. If we know that a move is possible, we can simply add `x` to the maximizing player's current score and return that.
  - This change brought the execution time down by a lot, and we are now able to run a 5x5 tournament with a minimum timeout of 2s for the player-referee interaction.
- `Fish/Common/Controller/src/manager.ts` :
  // TODO:
  - adding 'failingAndCheatingPlayers'
