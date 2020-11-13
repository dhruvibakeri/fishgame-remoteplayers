## Data Representation

[x] Change the name of PotentialMoves within `game-tree.ts` to be more clear that it also contains `LazyGameTree`s
[x] Remove the notion of `curPlayerIndex` and instead re-order the `players` array (shift elements, the current player will always be the first element)

## Functionality

[x] Add in timeouts within `referee.ts` and catch failing players
[x] Refactor error handling to use a Result data structure and organize error types to remove any overlapping cases
