[x] Change the name of PotentialMoves within `game-tree.ts` to be more clear that it also contains `LazyGameTree`s

- Renamed PotentialMovement to MovementToResultingTree in [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/34575281436bb561c2cc10753fcf2e0fa44ab28c)

[x] Add in timeouts within `referee.ts` and catch failing players

- Used Javascript `Promise`s and `Promise.race` to create a race between a timer and a player request. If player did not respond before the timer resolved, the player is disqualified. Commit [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/f2ff4f4316e1e21cd9f39cd8f659635097ab61ba)

[x] Refactor error handling to either use a try/catch approach or a Result type of data structure

- Using `true-myth` library, which has support for `Result` and `Maybe` types. Refactored the code-base to use those types