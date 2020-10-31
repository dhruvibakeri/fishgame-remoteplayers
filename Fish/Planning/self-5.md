## Self-Evaluation Form for Milestone 5

Under each of the following elements below, indicate below where your
TAs can find:

- the data definition, including interpretation, of penguin placements for setups 
  Placing a single penguin: https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/9432785ef5beba5966da53456e0824dcfa6d38c1/Fish/Player/strategy.ts#L42-L50
  Placing all remainng unplaced penguins in zig zag pattern: https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/9432785ef5beba5966da53456e0824dcfa6d38c1/Fish/Player/strategy.ts#L71-L77

- the data definition, including interpretation, of penguin movements for turns
  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/9432785ef5beba5966da53456e0824dcfa6d38c1/Fish/Player/strategy.ts#L232-L241

- the unit tests for the penguin placement strategy 
  Unit tests for placing a single penguin: https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/9432785ef5beba5966da53456e0824dcfa6d38c1/Fish/Common/Controller/tests/strategy.spec.ts#L219-L252
  Unit tests for placing all remaining unplaced penguins in zig zag pattern: https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/9432785ef5beba5966da53456e0824dcfa6d38c1/Fish/Common/Controller/tests/strategy.spec.ts#L254-L264

- the unit tests for the penguin movement strategy; 
  given that the exploration depth is a parameter `N`, there should be at least two unit tests for different depths 
  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/9432785ef5beba5966da53456e0824dcfa6d38c1/Fish/Common/Controller/tests/strategy.spec.ts#L266-L341
  
- any game-tree functionality you had to add to create the `xtest` test harness:
  - where the functionality is defined in `game-tree.PP`
    - Added a separate game state type called `MovementGame` which is a game state where all penguins have been placed and is in the movement phase of game play. We added this to ensure a game tree isn't created from a game where not all penguins have been placed. We used this game state in our game tree creation to validate game state.
      - game-tree.ts git-diff:https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/34e931d8697929d8585b4a766f651e726680bf5f/Fish/Planning/git-diff/gameTreeDiff.txt#L11-L29
      - gameTreeCreation.ts git-diff: https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/34e931d8697929d8585b4a766f651e726680bf5f/Fish/Planning/git-diff/gameTreeCreationDiff.txt#L22-L116
    - We also added new bridge functionality to translate the expected test input into our data structures, and translate our data into the expected output json format.
      - data conversion (testHarnessConversion.ts) git-diff: https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/34e931d8697929d8585b4a766f651e726680bf5f/Fish/Planning/git-diff/testHarnessConversionDiff.txt#L30-L204
      - added input data types (testHarnessInput.ts) git-diff: https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/34e931d8697929d8585b4a766f651e726680bf5f/Fish/Planning/git-diff/testHarnessInputDiff.txt#L20-L62
  - where the functionality is used in `xtree`
    - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/9432785ef5beba5966da53456e0824dcfa6d38c1/Fish/Common/Controller/src/xtree.ts#L16-L117
  - you may wish to submit a `git-diff` for `game-tree` and any auxiliary modules 

**Please use GitHub perma-links to the range of lines in specific
file or a collection of files for each of the above bullet points.**

  WARNING: all perma-links must point to your commit "9432785ef5beba5966da53456e0824dcfa6d38c1".
  Any bad links will result in a zero score for this self-evaluation.
  Here is an example link:
    <https://github.ccs.neu.edu/CS4500-F20/libertyhill/tree/9432785ef5beba5966da53456e0824dcfa6d38c1/Fish>

