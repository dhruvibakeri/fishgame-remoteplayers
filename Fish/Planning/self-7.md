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

  We did not need to rework our board data definition/interpretation as it has already been functional and passing integration tests. Feedback on our interpretation has already been previously addressed.

- a purpose statement for the "reachable tiles" functionality on the board representation

  We did not need to rework our purpose statement for this functionality, since we did not receive feedback deeming it inadequate.

- two unit tests for the "reachable tiles" functionality

  We did not need to further implement unit tests for this functionality since we had already included tests previously.

### Game States

- a data definition and an interpretation for the game _state_

  We did not need to rework our game state data definition/interpretation as it has already been functional and passing integration tests. Feedback on our representation and interpretation has already been previously addressed.

- a purpose statement for the "take turn" functionality on states

  We did not need to rework our purpose statement for this functionality, since we did not receive feedback deeming it inadequate.

- two unit tests for the "take turn" functionality

  We did not need to further implement unit tests for this functionality since we had already included tests previously.

### Trees and Strategies

- a data definition including an interpretation for _tree_ that represent entire games

  We did not need to rework our game tree data definition/interpretation as it has already been functional and passing integration tests. Feedback on our representation and interpretation including properly modeling the different types of states of a game (game is over, current player is stuck, current player can't move) has already been previously addressed.

- a purpose statement for the "maximin strategy" functionality on trees

  We did not need to rework our purpose statemnt for this functionality, since we did not receive feedback deeming it inadequate.

- two unit tests for the "maximin" functionality

  We did not need to further implement unit tests for this functionality since we had already included tests previously.

### General Issues

Point to at least two of the following three points of remediation:

- the replacement of `null` for the representation of holes with an actual representation

  N/A

- one name refactoring that replaces a misleading name with a self-explanatory name

  Todo:

  https://github.ccs.neu.edu/CS4500-F20/christine/blame/master/7/todo.md#L3

  Commit:

  https://github.ccs.neu.edu/CS4500-F20/christine/commit/34575281436bb561c2cc10753fcf2e0fa44ab28c#diff-327924acc1fbd2520dbd09d26e189579L33-L36

- a "debugging session" starting from a failed integration test:
   Also N/A -- previously failing integration tests were fixed prior
  - the failed integration test
  - its translation into a unit test (or several unit tests)
  - its fix
  - bonus: deriving additional unit tests from the initial ones

### Bonus

Explain your favorite "debt removal" action via a paragraph with
supporting evidence (i.e. citations to git commit links, todo, `bug.md`
and/or `reworked.md`).

This would probably be our decision to make use of a `Result` pattern for our error handling as suggested in a previous milestone feedback, as mentioned in our todo [here](https://github.ccs.neu.edu/CS4500-F20/christine/blame/master/7/reworked.md#L22). This change allowed us to clean up our handling of errors while still properly representing them within the type system, avoiding exceptions. We made use of a library called `true-myth` which for the most part made working with errors more intuitive than needing to constantly check if a result returned from an operation was an error. This was done through the use of methods such as `map` and `andThen` which allowed for better composition of results. For example, in our `movePenguin` function, instead of having to use [`isError`](https://github.ccs.neu.edu/CS4500-F20/christine/commit/8f7580cf5f23f7b0b853c9981f82aee3b5420415#diff-e18c7dc4bcd0885a63947c573d984951L192-L195) and [casts](https://github.ccs.neu.edu/CS4500-F20/christine/commit/8f7580cf5f23f7b0b853c9981f82aee3b5420415#diff-e18c7dc4bcd0885a63947c573d984951L208) to check if intermediate results had resulted in errors, we could instead compose together different potentially erroneous operations like [here](https://github.ccs.neu.edu/CS4500-F20/christine/commit/8f7580cf5f23f7b0b853c9981f82aee3b5420415#diff-e18c7dc4bcd0885a63947c573d984951R192-R198). In this example, the validation of a move and the setting of a tile to a hole which can both potentially return an error are easily composed together using `andThen` and `map` to produce a final `Result` which will propagate the first error that does occur or a successful result.
