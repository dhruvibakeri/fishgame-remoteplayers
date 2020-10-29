# 5 &mdash; The Strategy | Design Task

## Referee API

### **RunGame: `(players: Array<TournamentPlayer>, boardDimensions: BoardDimension, observers: Array<Observer>) => GameDebrief`**

A GameDebrief is (see `Common/player-interface.ts` for full description):
```
interface GameDebrief {
  readonly activePlayers: Array<ActivePlayer>;
  readonly kickedPlayers: Array<InactivePlayer>;
}

interface ActivePlayer {
  readonly name: string,
  readonly score: number
}

interface InactivePlayer {
  readonly name: string;
}
```

This call is meant to be used by a Tournament Manager to tell a Referee to create and run an entire game using the provided information using the given array of `TournamentPlayer`s and the given `BoardDimension`. A `TournamentPlayer` consists of information persisted by the Tournament Manager upon signing up a player to participate in a game, and must at a minimum include the player's uniquely identifying name and their age. A `BoardDimension` simply includes the number of rows and columns within the game's board. The Referee may either reject this information if it is deemed invalid (there are too many players, the board dimensions are invalid/can't hold all the players' avatars), or proceed to create and run a game with the given information. The Referee upon completing the game returns a `GameDebrief` back to the Tournament Manager as outlined above.

The given array of `Observer`s specifies to the Referee what game observers they need to inform upon each change to the state over the course of creating and running the game. An `Observer` should possess some interface for informing them which the Referee may call.

---

## Referee Component

### Setting up the game

Upon being called by the Tournament Manager to run a game via the `RunGame` call, the Referee must first set up the game. This process consists of the following steps in order:
- Convert the array of `TournamentPlayer`s into an array of `Player`s:
    - Deciding each player's color
    - Creating the ordering of player's based upon their ages (ascending)
- Set up the `Board`:
    - Create a board of the provided `BoardDimension`s, determining the number of fish on each tile
    - By some strategy, possibly place holes around the board
- Create the initial `Game` state for the game to be run using the created `Player`s and `Board`
- Notify each of the players that the game is starting (`GameIsStarting`)
- Run placement rounds in the decided order of turns until all avatars are placed, for each placement:
    - Make a call out to each player via their player-Referee interface (`MakePlacement`) to receive their placement position
    - Validate the placement and apply the placement to the state if it is valid. If the placement is not valid or if the player doesn't respond before their turn times out, the player is notified (`DisqualifyMe`) and kicked (their penguins are removed, they no longer make turns)

### Running the game

The Referee's most important job (the job it will spend the most time doing) is running the game. The term 'running the game' encompasses all actions made after all penguins have been placed until the conclusion of the game (when no more penguins have available moves).
- To run the game, the Referee follows the order of players it created while setting up the game, and one by one makes a call to the player to make a move.
    - The Referee will have a time limit within which a player must respond to the Referee's call for a move.
        - If the player fails to respond with a move in that time limit, the Referee will consider that a failing player, and disqualify them from the game, meaning they will not be able to make more moves and cannot win the game. They will make a call to the player's DisqualifyMe functionality to let them know they've been disqualified, and remove their penguins from the game.
    - If the player responds to the Referee's call for a move within the Referee's time limit, the Referee must validate the player's desired movement against the game's rulebook.
        - If the player's move is illegal according the the rulebook, the Referee will consider the player a cheating player. The Referee will notify the player by calling the player's DisqualifyMe functionality, and remove their penguins from the game.
        - If the player's move is legal, the Referee will trigger an update in `Game` state to reflect that movement.
- As the Referee is running the game, the Referee also has the responsibility of updating any game observers of changes in the `Game` state. To do so the Referee will make a call to the observer component to signal a change.

### Shutting down the game

Upon reaching and recognizing the end state of the game it is running, the Referee must then shut down the game and deliver its outcome. This is the point at which the Referee will respond back to the Tournament Manager's `RunGame` call. As part of shutting down the game, the Referee must maintain over the course of it some list of all players that have been kicked. Then the process is:
- Construct the final `GameDebrief` using the final `Game` state and the list of kicked players
- Report the outcome to each of the players (`GameHasEnded`)
- Report the outcome to each of the `Observer`s
- Respond back to the caller (Tournament Manager) with the `GameDebrief`
