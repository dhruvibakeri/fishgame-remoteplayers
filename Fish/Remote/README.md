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
    - `tests` :
      - `remotePlayer.spec.ts` : tests for the remote player component.
      - `messageConversion.spec.ts` : tests to check if messages are converted to the correct format while sending them to the client.
      - `client.spec.ts` : tests to check whether the client correctly responds to the requests from the server.
    - `Other` : Folder containing files related to other utility implementations.
      - `json-utils.ts` : contains functions for a parser for a sequence of JSON (assignment C)
    - `README.md` : README explaining Fish/Remote/ file structure and

## Modifications made in other code

- `Fish/Common/Controller/src/referee.ts` :
  //TODO:
  - Including optional argument for movementSoFar
- `Fish/Common/Controller/src/manager.ts` :
  // TODO:
  - adding 'failingAndCheatingPlayers'
