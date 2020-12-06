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
  - The `best action strategy` present in the code base we inherited took a very long time to compute the best action for the first few calls during a game with a 5x5 board and it was taking more than 7 seconds for the referee-player interaction.
  - The `getMinMaxScore` function takes in a `gameTree`, the `maximizing player's penguin color` and the `depth`.
  - The `getMinMaxScore` function if `depth === 0` or the `given gameTree` has no directly reachable states i.e **the game is over** (base case), it returns the score of the maximizing player at that point.
  - The `getMinMaxScore` function if `depth != 0`, creates game-trees for directly reachable states from the state in the given game-tree, and on each of those game-trees runs `getMinMaxScore` again. It keeps track of the score of the maximizing player that is returned for every resulting tree in a `list of scores`.
  - Once it has been through all the resulting trees, it returns the maximum score from that list (if it is currently the maximizing player's turn) or the minimum score from the list (if it is the other players' turn).
  - Such an implementation where when `depth === 1` and it is currently the turn of the player that **comes before the maximizing player**, and then it goes through multiple resulting game trees where the current game state has the **maximizing player as its current turn** while also running `getMinMaxScore` on them takes a really long time on a 5x5 board because there are many possible moves at that point.
  - We realized that for when `depth === 1` and it is currently the turn of the player that **comes before the maximizing player**, for every resulting gameTree where now the current game state has the **maximizing player as its current turn** instead of calling `getMinMaxScore` on each one, we could just check if the penguins of the maximizing player have moves, and for the ones that do, we get the score they would get from those moves( **we do not need to go through each move since the score will always be the number of fishes on the tile the penguin is moving from**) and then finally return the max of all the scores collected for the different penguins.
  - This seemed to decrease the time to a maximum of 2 seconds for the referee-player interaction.
- `Fish/Common/Controller/src/manager.ts` :
  - adding 'failingAndCheatingPlayers' to TournamentManager
  - Reason: this was something that was always left open as an option, pending on this Milestone.
    As of Milestone 8, the spec didn't mention what to do with failingAndCheatingPlayers, so those
    players were discarded after each game was over. This change keeps them, and returns them
    as part of the tournament results.
