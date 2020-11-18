```
title: Welcome to swimlanes.io

_: **Tournament Begins**

Manager -> Referee: runGame()


_: **Game Started**

Referee -> ProxyPlayer: gameIsStarting()

Client <- ProxyPlayer: JSON GAME_STARTED


_: **Placement Rounds**

Referee -> ProxyPlayer: getPlacement()

Client <- ProxyPlayer: JSON getPlacement

Client -> ProxyPlayer: JSON BoardPosition

ProxyPlayer -> Referee: BoardPosition


_: **Movement Rounds**

Referee -> ProxyPlayer: getMovement()

Client <- ProxyPlayer: JSON getMovement

Client -> ProxyPlayer: JSON Movement

ProxyPlayer -> Referee: Movement


group: Player makes a bad move

Referee -> ProxyPlayer: disqualifyMe()

Client -> ProxyPlayer: JSON DISQUALIFIED

end



_: **Game Ends**

Referee -> ProxyPlayer: gameHasEnded()

Client <- ProxyPlayer: JSON GameDebrief


...: {fas-spinner} Run multiple Rounds of Games


_: **Tournament Ends**

Manager -> ProxyPlayer: wonTournament()

ProxyPlayer -> Client: JSON TOURNAMENT_WON 

Client -> ProxyPlayer: JSON ACCEPTED

ProxyPlayer -> Manager: true 
```

