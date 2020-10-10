## Self-Evaluation Form for Milestone 2

A fundamental guideline of Fundamentals I, II, and OOD is to design
methods and functions systematically, starting with a signature, a
clear purpose statement (possibly illustrated with examples), and
unit tests.

Under each of the following elements below, indicate below where your
TAs can find:

- the data description of tiles, including an interpretation:

  - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/c18014e88ab1966947fd7cbd01d39444be398bf8/Fish/Common/Controller/types/board.ts#L1

    This includes our object interface containing the fields currently necessary to describe a tile. Our interpretation simply describes whether a tile is a hole and the number of fish that are on the tile, trying to express it in the simplest possible terms without redundant or repeated information.

- the data description of boards, include an interpretation:

  - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/c18014e88ab1966947fd7cbd01d39444be398bf8/Fish/Common/Controller/types/board.ts#L6

    This description is also as simple as possible, describing a board as a 2D array of tiles. It contains our interpretation of a board only needing to consist of tiles and nothing more to keep it separated from other gane pieces and any baked in logic and thus making it flexible for future use.

- the functionality for removing a tile:

  - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/c18014e88ab1966947fd7cbd01d39444be398bf8/Fish/Common/Controller/src/boardCreation.ts#L107

    This function encompasses the "removing" functionality for our board, marking a tile on a given board as a hole.

  - purpose:

    - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/c18014e88ab1966947fd7cbd01d39444be398bf8/Fish/Common/Controller/src/boardCreation.ts#L99

      This function contains a comment explaining the purpose of the function.

  - signature:

    - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/c18014e88ab1966947fd7cbd01d39444be398bf8/Fish/Common/Controller/src/boardCreation.ts#L108

      The signature here is part of the function declaration, specifying its parameters and their types along with the possible return types.

  - unit tests:

    - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/c18014e88ab1966947fd7cbd01d39444be398bf8/Fish/Common/Controller/tests/boardCreation.spec.ts#L107

      This contains a couple unit tests for this function, testing its error handling and remove functionality.

- the functionality for reaching other tiles on the board:

  - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/c18014e88ab1966947fd7cbd01d39444be398bf8/Fish/Common/Controller/src/movement.ts#L33

    This function implements the requested functionality of getting all the reachable positions on a board from a given point.

  - purpose:

    - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/c18014e88ab1966947fd7cbd01d39444be398bf8/Fish/Common/Controller/src/movement.ts#L23

      This function contains a comment explaining the purpose of the function.

  - signature:

    - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/c18014e88ab1966947fd7cbd01d39444be398bf8/Fish/Common/Controller/src/movement.ts#L34

      The signature here is part of the function declaration, specifying its parameters and their types along with the possible return types.

  - unit tests:

    - https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/c18014e88ab1966947fd7cbd01d39444be398bf8/Fish/Common/Controller/tests/movement.spec.ts#L29

      This contains a unit test for the function testing its correct behavior on a mock board. In hindsight, it should have also contained a test for invalid inputs, such as an invalid position not on the board being given.

The ideal feedback is a GitHub perma-link to the range of lines in specific
file or a collection of files for each of the above bullet points.

WARNING: all such links must point to your commit "c18014e88ab1966947fd7cbd01d39444be398bf8".
Any bad links will result in a zero score for this self-evaluation.
Here is an example link:
<https://github.ccs.neu.edu/CS4500-F20/libertyhill/tree/c18014e88ab1966947fd7cbd01d39444be398bf8/Fish>

A lesser alternative is to specify paths to files and, if files are
longer than a laptop screen, positions within files are appropriate
responses.

In either case you may wish to, beneath each snippet of code you
indicate, add a line or two of commentary that explains how you think
the specified code snippets answers the request.
