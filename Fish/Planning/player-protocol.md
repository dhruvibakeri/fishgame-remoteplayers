# 4 &mdash; The Game Tree | Design Task

## Player-Referee API Protocol

The following are the various calling conventions within the player-referee API which each participating player must implement. It is meant to surface the lines of communication between the referee and player components so that each player may expose to the referee how to make its placements and movements, notify the player of diqualification, and provide to the player information on the outcome of the game.

___

### MakePlacement: `(Game) => BoardPosition`

The MakePlacement call is meant to expose to the referee that calls it a means to get that player's next placement within the placement rounds of the Game. This means that making this call should only be done within a the placement stage of the game, at that player's turn. As part of making this call, the referee must supply the current Game state of the game from which the player will be making their placement, which should correctly denote the receiving player as the current player. The return of this call is subsequently the position on the Board of the current Game state where the player wishes to place their penguin.

___

### MakeMovement: `(Game) => Movement`

MakeMovement call is meant as a signal to the player from the referee that it is their turn to make a move. The referee passes the current game state to the player so the player can use that game state to evaluate the best possible move if needed. The player then responds with the movement they want to make for that turn. With this, a MakeMovement call to a player should only be made during the movement phase of the game, at the receiving player's turn. The return of this call is the Movement, specifying the starting position where their existing penguin is placed and ending position, which the player wishes to make at this turn.

---

### SendGameDebrief: `(GameDebrief) => void`

The SendGameDebrief call is meant to provide a referee a means to provide to the player a debrief on the outcome of a game, meaning that this call is only supposed to be made after the game reaches its ending state with no players being able to make moves. It acts more or less as a drop off of the debrief where the referee may just call the player's SendGameDebrief with the information where that player will do with the information as they see fit within their implementation.

---

### DisqualifyMe: `(string) => void`

The DisqualifyMe call is a signal to the player that they've attempted to make an illegal move or violate the rules in some way and are now disqualified from the game. The referee sends a short message to inform the player why they were disqualified, but the player does not need to return any response, as there isn't anything they can do about the disqualification. The referee would use this call directly after the player performs an action, becase at the current time the only thing that can result in player disqualification is an illegal action.
