## Data Representation

[x] Change the name of PotentialMoves within `game-tree.ts` to be more clear that it also contains `LazyGameTree`s
[ ] Add documentation for `GameIsStarting` and `GameHasEnded` player-referee calls within `player-protocol.md`
[ ] Add further documentation for placing/taking turns within the player-referee protocol within `player-protocol.md` (note that they are often used)

## Functionality

[ ] Add in timeouts within `referee.ts` and catch failing players
[ ] Refactor error handling to either use a try/catch approach or a Result type of data structure
[ ] Refactor error types to remove any overlapping cases
[ ] Remove the notion of `curPlayerIndex` and instead re-order the `players` array (shift elements, the current player will always be the first element)
[x] Remove unecessary copying of board tiles array within `board.ts`
