[x] Change the name of PotentialMoves within `game-tree.ts` to be more clear that it also contains `LazyGameTree`s

- Renamed PotentialMovement to MovementToResultingTree in [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/34575281436bb561c2cc10753fcf2e0fa44ab28c#diff-327924acc1fbd2520dbd09d26e189579L33-L36)

[x] Remove the notion of `curPlayerIndex` and instead re-order the `players` array (shift elements, the current player will always be the first element)

- Removed the `curPlayerIndex`, and shifted the `players` array inside of `Game`s. These changes propagated up to the Referee, who relied on the `curPlayerIndex` to get `TournamentPlayer`s. This was fixed by storing a `Map<Name, TournamentPlayer>` instead of `Array<TournamentPlayer>` inside of `RefereeState`.
- [Changes Here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/bb3707068534237e2d966b8e1d8c9af4d0c5f00b)
  - Remove `curPlayerIndex` from `Game` [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/bb3707068534237e2d966b8e1d8c9af4d0c5f00b#diff-95bc0a56510ffacbd0296c399d7b42c2L29-R35)
  - Add shifting functionality [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/bb3707068534237e2d966b8e1d8c9af4d0c5f00b#diff-cf3bb810a9eaedb768c662db92032718R21-R25)

[x] Add in timeouts within `referee.ts` and catch failing players

- Used Javascript `Promise`s and `Promise.race` to create a race between a timer and a player request. If player did not respond before the timer resolved, the player is disqualified. Commit [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/f2ff4f4316e1e21cd9f39cd8f659635097ab61ba)
  - Update player-referee protocol to return `Promise`s for placement/movement requests [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/f2ff4f4316e1e21cd9f39cd8f659635097ab61ba#diff-4177ce6be87e834adecf8d40d240d5aaL76-R92)
  - Add function to apply timeout to requests [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/f2ff4f4316e1e21cd9f39cd8f659635097ab61ba#diff-589422440c9002c944173380c2ba0eadR191-R203)
  - Update running placement rounds to use timeout and catch failing players [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/f2ff4f4316e1e21cd9f39cd8f659635097ab61ba#diff-589422440c9002c944173380c2ba0eadL192-R240)
  - Update running movement rounds to use timeout and catch failing players [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/f2ff4f4316e1e21cd9f39cd8f659635097ab61ba#diff-589422440c9002c944173380c2ba0eadL268-R324)

[x] Refactor error handling to use a Result data structure and organize error types to remove any overlapping cases

- Using `true-myth` library, which has support for `Result` and `Maybe` types. Refactored the code-base to use those types.
- Also reduced the redundancy of the Error types and and use same variants for different parts of the code [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/8f7580cf5f23f7b0b853c9981f82aee3b5420415#diff-35c20cd6b317afa40d5dac211667f349L238-R187)
- [Squashed Changes Here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/8f7580cf5f23f7b0b853c9981f82aee3b5420415)