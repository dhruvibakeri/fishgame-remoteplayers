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
      - `messageConversion.spec.ts` : test to check if messages are converted to the correct format while sending them to the client.
      - `client.spec.ts` : tests to check whether the client correctly responds to the requests from the server.
    - `Other` : Folder containing files related to other utility implementations.
      - `json-utils.ts` : contains functions for a parser for a sequence of JSON (assignment C)
    - `README.md` : README explaining Fish/Remote/ file structure and

## Modifications made in other code

- `Fish/Common/Controller/src/referee.ts` :
  - Adding movementSoFar as optional argument for RefereeState + player-interface getMovement
  - Reason: As the code-base was built with a functional pattern in mind, building an 
    adapter around `runGame` wasn't an easy option, because there wasn't any methods we could 
    override -- we would have to override almost everything runGame touched. 
    So we added the movementSoFar array to the Referee state to pass actions to remote players
- `Fish/Common/Controller/src/strategy.ts` :
  //TODO:
- `Fish/Common/Controller/src/manager.ts` :
  - adding 'failingAndCheatingPlayers' to TournamentManager
  - Reason: this was something that was always left open as an option, pending on this Milestone.
    As of Milestone 8, the spec didn't mention what to do with failingAndCheatingPlayers, so those
    players were discarded after each game was over. This change keeps them, and returns them
    as part of the tournament results.
