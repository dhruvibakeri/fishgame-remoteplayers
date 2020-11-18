![](/home/fdwraith/Github/christine/Fish/Planning/remote.png)

#### Requests to Client

```
{
	"TYPE": "MESSAGE",
	"MESSAGE": "GAME_STARTED" | "TOURNAMENT_WON" | "DISQUALIFIED"
}
```

```
{
	"TYPE": "PLACEMENT"
	"GAME": <GAME-STATE>
}
```

```
{
	"TYPE": "MOVEMENT"
	"GAME": <GAME-STATE>
}
```

```
{
	"TYPE": "DEBRIEF"
	"DEBRIEF": <GAME-DEBRIEF>
}
```

#### Responses From Client

```
{
	"TYPE": "ACCEPTANCE"
	"ACCEPTED": true | false
}
```

```
{
	"TYPE": "MOVEMENT"
	"MOVEMENT": <MOVEMENT>
}
```

```
{
	"TYPE": "PLACEMENT"
	"PLACEMENT": <BOARD-POSITION> 
}
```

###### `<GAME-STATE>`, `<DEBRIEF>`, `<BOARD-POSITION>` are JSON-serialized versions of our data.

***

The `ProxyPlayer` is an implementation of `TournamentPlayer` that will asynchronously send out requests to a remote client, and then convert those client responses back into internal data representations uses by the `TournamentManager` and `Referee`.

These requests and responses are encoded into JSON-format, as shown above, and represent the language used to bridge the network gap between server and client implementations. 

For Example, when the `Referee` requests a `getPlacement(Game g)` from the `ProxyPlayer`, the `ProxyPlayer` translates this into a `PLACEMENT` message by JSON-serializing the `Game g`. This is what is sent across the network, which the `Client` will receive and respond with the corresponding `PLACEMENT` response. In the event of a malformed response, a timeout, or whatever it may be, the server will disqualify the player. 

Upon receiving an appropriate JSON response, the `ProxyPlayer` will convert it into a `BoardPosition`, and pass that value to the `Referee`, and the game resumes from there.

Another type of request that a `Client` might receive is a `MESSAGE` request, which may contain a body of text describing an event in the tournament, such as `GAME_STARTED` or `DISQUALIFIED`, in which there may not necessitate a response from the `Client`.