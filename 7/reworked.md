[x] Change the name of PotentialMoves within `game-tree.ts` to be more clear that it also contains `LazyGameTree`s

- Renamed PotentialMovement to MovementToResultingTree in [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/34575281436bb561c2cc10753fcf2e0fa44ab28c)

[x] Add in timeouts within `referee.ts` and catch failing players

- Used Javascript `Promise`s and `Promise.race` to create a race between a timer and a player request. If player did not respond before the timer resolved, the player is disqualified. Commit [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/f2ff4f4316e1e21cd9f39cd8f659635097ab61ba)

[x] Refactor error handling to either use a try/catch approach or a Result type of data structure

- Using `true-myth` library, which has support for `Result` and `Maybe` types. Refactored the code-base to use those types. 
- Also reduced the redundancy of the Error types and and use same variants for different parts of the code. 
- [Squashed Changes Here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/8f7580cf5f23f7b0b853c9981f82aee3b5420415)

[x] Remove the notion of `curPlayerIndex` and instead re-order the `players` array (shift elements, the current player will always be the first element)

- Removed the `curPlayerIndex`, and shifted the `players` array inside of `Game`s. These changes propagated up to the Referee, who relied on the `curPlayerIndex` to get `TournamentPlayer`s. This was fixed by storing a `Map<Name, TournamentPlayer>` instead of `Array<TournamentPlayer>` inside of `RefereeState`.
- [Changes Here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/bb3707068534237e2d966b8e1d8c9af4d0c5f00b)