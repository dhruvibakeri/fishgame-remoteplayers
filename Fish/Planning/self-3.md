## Self-Evaluation Form for Milestone 3

Under each of the following elements below, indicate below where your
TAs can find:

- the data description of states, including an interpretation:

  - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/96eb60693e1a7c9ffc9bbaec64d384ea89e27e8a/Fish/Common/state.ts#L43

  - This is the definition for our Game state object, which models all aspects of the Game state currently requested within the prompt of the assignment. An interpretation for each field of the state is explained in the interface's comment.

- a signature/purpose statement of functionality that creates states

  - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/96eb60693e1a7c9ffc9bbaec64d384ea89e27e8a/Fish/Common/Controller/src/gameStateCreation.ts#L48

  - This is the declaration of our function for creating a Game state. The signature is within the function declaration along with its types and the purpose statement is in the function's comment.

- unit tests for functionality of taking a turn

  - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/96eb60693e1a7c9ffc9bbaec64d384ea89e27e8a/Fish/Common/Controller/tests/penguinPlacement.spec.ts#L147

  - This `describe` block houses all unit tests for our `movePenguin` function which handles making a movement within the game.

- unit tests for functionality of placing an avatar

  - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/96eb60693e1a7c9ffc9bbaec64d384ea89e27e8a/Fish/Common/Controller/tests/penguinPlacement.spec.ts#L81

  - This `describe` block houses all unit tests for our `placePenguin` function which handles the placement of a Penguin within a Game.

- unit tests for functionality of final-state test

  - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/96eb60693e1a7c9ffc9bbaec64d384ea89e27e8a/Fish/Common/Controller/tests/movementChecking.spec.ts#L258

  - This `describe` block houses all unit tests for our `anyPlayersCanMove` function, which effectively checks the game's ending condition if any players have remaining moves.

The ideal feedback is a GitHub perma-link to the range of lines in specific
file or a collection of files for each of the above bullet points.

WARNING: all such links must point to your commit "96eb60693e1a7c9ffc9bbaec64d384ea89e27e8a".
Any bad links will result in a zero score for this self-evaluation.
Here is an example link:
<https://github.ccs.neu.edu/CS4500-F20/libertyhill/tree/96eb60693e1a7c9ffc9bbaec64d384ea89e27e8a/Fish>

A lesser alternative is to specify paths to files and, if files are
longer than a laptop screen, positions within files are appropriate
responses.

In either case you may wish to, beneath each snippet of code you
indicate, add a line or two of commentary that explains how you think
the specified code snippets answers the request.

## Partnership Eval

Select ONE of the following choices by deleting the other two options.

A) My partner and I contributed equally to this assignment.

My partner and I made sure to work together and contribute equally to this and all previous assignments. We meet over zoom almost every day for a couple hours to discuss the assignment requirements and pair program. We both have about the same skill level with JavaScript/TypeScript so our partnership has gone well so far.

If you chose C, please give some further explanation below describing
the state of your partnership and whether and how you have been or are
addressing this disparity. Describe the overall trajectory of your
partnership from the beginning until now. Be honest with your answer
here, and with each other. Even if it's uncomfortable reading this
together right now.

If you chose one of the other two options, you should feel free to
also add some explanation if you wish.
