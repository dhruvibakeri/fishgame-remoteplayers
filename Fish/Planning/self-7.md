## Self-Evaluation Form for Milestone 7

Please respond to the following items with

1. the item in your `todo` file that addresses the points below.
   It is possible that you had "perfect" data definitions/interpretations
   (purpose statement, unit tests, etc) and/or responded to feedback in a
   timely manner. In that case, explain why you didn't have to add this to
   your `todo` list.

2. a link to a git commit (or set of commits) and/or git diffs the resolve
   bugs/implement rewrites:

These questions are taken from the rubric and represent some of the most
critical elements of the project, though by no means all of them.

(No, not even your sw arch. delivers perfect code.)

### Board

- a data definition and an interpretation for the game _board_

  - Our code base currently correctly addresses this aspect as feedback has already been addressed and we never received any criticism about it since.
  - For the current state of the board, see [here](https://github.ccs.neu.edu/CS4500-F20/christine/blob/688c220eed00b5b3d5004e5bc8a8c2a8b356cac5/Fish/Common/board.ts#L12-L31).

- a purpose statement for the "reachable tiles" functionality on the board representation

  - Our code base currently correctly addresses this aspect from the beginning and we never received any criticism about it.
  - For the current state of the reachable tiles functionality, see the purpose statements for [getReachablePositions](https://github.ccs.neu.edu/CS4500-F20/christine/blob/688c220eed00b5b3d5004e5bc8a8c2a8b356cac5/Fish/Common/Controller/src/movementChecking.ts#L180-L189) and [getReachablePositionsInDirection](https://github.ccs.neu.edu/CS4500-F20/christine/blob/688c220eed00b5b3d5004e5bc8a8c2a8b356cac5/Fish/Common/Controller/src/movementChecking.ts#L142-L152).

  [Reachable Tiles Purpose Statement](https://github.ccs.neu.edu/CS4500-F20/christine/blob/d367c5aed9641ebd4c65b7ff0c90ba59c36e6ff6/Fish/Common/Controller/src/movementChecking.ts#L142-L211)

- two unit tests for the "reachable tiles" functionality

  - Our code base currently correctly addresses this aspect from the beginning and we never received any criticism about it.
  - For the current state of the the reachable tiles unit tests, see [getReachablePositions unit tests](https://github.ccs.neu.edu/CS4500-F20/christine/blob/688c220eed00b5b3d5004e5bc8a8c2a8b356cac5/Fish/Common/Controller/tests/movementChecking.spec.ts#L190-L206) and [getReachablePositionsInDirection unit tests](https://github.ccs.neu.edu/CS4500-F20/christine/blob/688c220eed00b5b3d5004e5bc8a8c2a8b356cac5/Fish/Common/Controller/tests/movementChecking.spec.ts#L147-L188).

### Game States

- a data definition and an interpretation for the game _state_

  - Our code base currently correctly addresses this aspect as feedback has already been addressed and we never received any criticism about it since.
  - We have however made simplifications with our tracking if the current player of a game state seen within our TODO file [here](https://github.ccs.neu.edu/CS4500-F20/christine/blame/master/7/todo.md#L4).
  - For the current state of the game state, see [here](https://github.ccs.neu.edu/CS4500-F20/christine/blob/688c220eed00b5b3d5004e5bc8a8c2a8b356cac5/Fish/Common/state.ts#L16-L35).

- a purpose statement for the "take turn" functionality on states

  - Our code base currently correctly addresses this aspect as feedback has already been addressed and we never received any criticism about it since.
  - For the current state of the taking turns functionality, see the purpose statements for [placePenguin](https://github.ccs.neu.edu/CS4500-F20/christine/blob/688c220eed00b5b3d5004e5bc8a8c2a8b356cac5/Fish/Common/Controller/src/penguinPlacement.ts#L96-L104) and [movePenguin](https://github.ccs.neu.edu/CS4500-F20/christine/blob/688c220eed00b5b3d5004e5bc8a8c2a8b356cac5/Fish/Common/Controller/src/penguinPlacement.ts#L171-L180).

- two unit tests for the "take turn" functionality

  - Our code base currently correctly addresses this aspect from the beginning and we never received any criticism about it.
  - For the current state of the take turn unit tests, see [placePenguin unit tests](https://github.ccs.neu.edu/CS4500-F20/christine/blob/688c220eed00b5b3d5004e5bc8a8c2a8b356cac5/Fish/Common/Controller/tests/penguinPlacement.spec.ts#L138-L229) and [movePenguin unit tests](https://github.ccs.neu.edu/CS4500-F20/christine/blob/688c220eed00b5b3d5004e5bc8a8c2a8b356cac5/Fish/Common/Controller/tests/penguinPlacement.spec.ts#L231-L373).

### Trees and Strategies

- a data definition including an interpretation for _tree_ that represent entire games

  - Our code base currently correctly addresses this aspect as feedback has already been addressed and we never received any criticism about it since.
  - For the current state of the tree, see [here](https://github.ccs.neu.edu/CS4500-F20/christine/blob/688c220eed00b5b3d5004e5bc8a8c2a8b356cac5/Fish/Common/game-tree.ts#L40-L68).

- a purpose statement for the "maximin strategy" functionality on trees

  - Our code base currently correctly addresses this aspect from the beginning and we never received any criticism about it.
  - For the current state of the maximin strategy functionality, see the purpose statement for [chooseNextAction](https://github.ccs.neu.edu/CS4500-F20/christine/blob/688c220eed00b5b3d5004e5bc8a8c2a8b356cac5/Fish/Common/Controller/src/strategy.ts#L232-L241).

- two unit tests for the "maximin" functionality

  - Our code base currently correctly addresses this aspect from the beginning and we never received any criticism about it.
  - For the current state of the maximin unit tests, see [chooseNextAction unit tests](https://github.ccs.neu.edu/CS4500-F20/christine/blob/39de3a327d2db5b744b229bf9ce386cf4695fdc9/Fish/Common/Controller/tests/strategy.spec.ts#L294-L374).

### General Issues

Point to at least two of the following three points of remediation:

- the replacement of `null` for the representation of holes with an actual representation

  - Our code base correctly addressed this from the beginning and we never received any criticism about it.
  - For the current state of this, see [here](https://github.ccs.neu.edu/CS4500-F20/christine/blob/688c220eed00b5b3d5004e5bc8a8c2a8b356cac5/Fish/Common/board.ts#L1-L10).

- one name refactoring that replaces a misleading name with a self-explanatory name

  - Todo: https://github.ccs.neu.edu/CS4500-F20/christine/blame/master/7/todo.md#L3
  - Commit: https://github.ccs.neu.edu/CS4500-F20/christine/commit/34575281436bb561c2cc10753fcf2e0fa44ab28c#diff-327924acc1fbd2520dbd09d26e189579L33-L36

- a "debugging session" starting from a failed integration test:

  - the failed integration test
  - its translation into a unit test (or several unit tests)
  - its fix
  - bonus: deriving additional unit tests from the initial ones

  As of this milestone, there were no outstanding bugs caught by integration tests related to our data representation/component functionalities or pointed out by grading feedback.

### Bonus

Explain your favorite "debt removal" action via a paragraph with
supporting evidence (i.e. citations to git commit links, todo, `bug.md`
and/or `reworked.md`).

This would probably be our decision to make use of a `Result` pattern for our error handling as suggested in a previous milestone feedback, as mentioned in our todo [here](https://github.ccs.neu.edu/CS4500-F20/christine/blame/master/7/reworked.md#L22). This change allowed us to clean up our handling of errors while still properly representing them within the type system, avoiding exceptions. We made use of a library called `true-myth` which for the most part made working with errors more intuitive than needing to constantly check if a result returned from an operation was an error. This was done through the use of methods such as `map` and `andThen` which allowed for better composition of results. For example, in our `movePenguin` function, instead of having to use [isError](https://github.ccs.neu.edu/CS4500-F20/christine/commit/8f7580cf5f23f7b0b853c9981f82aee3b5420415#diff-e18c7dc4bcd0885a63947c573d984951L192-L195) and [casts](https://github.ccs.neu.edu/CS4500-F20/christine/commit/8f7580cf5f23f7b0b853c9981f82aee3b5420415#diff-e18c7dc4bcd0885a63947c573d984951L208) to check if intermediate results had resulted in errors, we could instead compose together different potentially erroneous operations like [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/8f7580cf5f23f7b0b853c9981f82aee3b5420415#diff-e18c7dc4bcd0885a63947c573d984951R192-R198). In this example, the validation of a move and the setting of a tile to a hole which can both potentially return an error are easily composed together using `andThen` and `map` to produce a final `Result` which will propagate the first error that does occur or a successful result.
