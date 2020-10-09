# 2 &mdash; The Game Pieces | Design Task

## Game State Representation

The game state will consist of several elements that need to be kept track of as the game goes on.

It is worth noting the difference between game state and the state of the board/game pieces. The board contains static elements that are for the most part divorced from game logic relating to rules or the game being played. The game state is a layer on top of the board that attaches logic related to the state of a game being played. Therefore, a game state contains a board.

With that, the game state needs to keep track of the following elements:

- A `Board` object representing the current layout of the board
- The roster/ordering of `Player`s ordered by birth date, where the internal representation of a player is meant to carry any static, unchanging information about a player which at least for gameplay purposes must include:
  - Their name
  - Their birth date
- Player information which a referee may need to update over the course of the game, this may be represented as a `Map` from `Player` to `PlayerSheet` where a `PlayerSheet` includes:
  - The player's assigned `PenguinColor`
  - Whether this player is active, meaning that player can still move and has not been kicked for making an invalid move
  - The player's score
  - How many penguins this player has left to place
- Which player's turn it currently is
- The current game stage, this is represented as an enumeration of the stages of gameplay which in order are:
  - `Setup` - the referee is creating the board and setting up the game state
  - `Placement` - players are placing their penguins
  - `Movement` - players are moving their penguins and collecting fish
  - `Finished` - no players can move anymore, a winner can be derived
- The collection of `Penguin`s placed on the board

## Game State External Interface

The primary external interface for the game state will be the player interface. This interface will allow players to know the current state of the game and make decisions and moves based on the game state they're given. It is also worth noting that while the interface is external to the game state, actions are still passed through the referee first in order to check them against rules. The provided player commands are as follows:

- **Request game state:** No input required from player. Provides all game state information detailed in the `Game State` section above so the player can stay up to date with the game and plan/make moves.
  - We will also likely have options for this request, in case the player only wants specific portions of the game state such as the board, instead of all available game state information at once.
- **Place Penguin:** Player must indicate where on the board they would like to place their penguin. The game will respond with info about whether or not the penguin was able to be placed on the board and how many are left to be placed. The player can repeat this action until all their penguins have been placed. This adds a new `Penguin` to the game state's collection of `Penguin`s and moves to the next player's turn.
- **Request list of possible moves for penguin:** Player must provide input for which penguin they would like to receive valid moves. The game will return a list of all possible tiles the given penguin could move to based on the board.
- **Move Penguin:** Player must provide input for which penguin they would like to move and where. Updates that penguin's position, the player's score, and moves the current turn to the next player. The game state will respond information regarding with whether or not the penguin was successfully moved and how many points were earned.

The next portion is the game state's external interface for the referee. This will allow the referee to access and manipulate the board.

- **Request game state:** Exactly the same as in the player's interface. The referee would use this in order to check a received player action's validity against the current game state.
- **Deactivate player:** Take the player to deactivate and change the game state to mark that player as inactive. Done if the player no longer has any moves or in response to that player making an invalid move.
- **Change game stage:** Move the game state to the next stage if possible.
- **Assign color:** Take a `PenguinColor` and a `Player` and update that player's color in their `PlayerSheet`.
- **Set board:** Take a `Board` and set that board to the game state's board.
