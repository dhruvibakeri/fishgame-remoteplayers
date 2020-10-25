# 4 &mdash; The Game Tree | Design Task

## Player-Referee API Protocol

The following are the various endpoints within the player-referee API which each participating player must implement. It is meant to surface the lines of communication between the referee and player components so that each player may expose to the referee how to make its placements and movements, notify them of their of diqualification, and provide to the them information on the outcome of the game.

---

### MakePlacement: `() => BoardPosition`

The MakePlacement endpoint is meant to expose to the referee that calls it

---

### MakeMovement: `() => Movement`

MakeMovement endpoint is meant as a signal to the player from the referee that it is their turn to make a move. The referee does not need to pass

---

### ReceiveGameDebrief: `(GameDebrief)

---

### DisqualifyMe
