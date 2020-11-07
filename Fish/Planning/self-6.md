## Self-Evaluation Form for Milestone 6

Indicate below where your TAs can find the following elements in your strategy and/or player-interface modules:

The implementation of the "steady state" phase of a board game
typically calls for several different pieces: playing a _complete
game_, the _start up_ phase, playing one _round_ of the game, playing a _turn_,
each with different demands. The design recipe from the prerequisite courses call
for at least three pieces of functionality implemented as separate
functions or methods:

- the functionality for "place all penguins"

  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Admin/referee.ts#L194-L222

- a unit test for the "place all penguins" funtionality

  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Common/Controller/tests/referee.spec.ts#L477-L533

- the "loop till final game state" function

  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Admin/referee.ts#L273-L296

- this function must initialize the game tree for the players that survived the start-up phase

  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Admin/referee.ts#L251-L254

- a unit test for the "loop till final game state" function

  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Common/Controller/tests/referee.spec.ts#L624-L736

- the "one-round loop" function

  We did not split games into rounds but rather just into a placement phase and movement phase, each of which simply consist of turns with each "round" simply wrapping to the next one. The closest notion to this is simply running all placement/movement rounds:

  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Admin/referee.ts#L194-L222

  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Admin/referee.ts#L273-L296

- a unit test for the "one-round loop" function

  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Common/Controller/tests/referee.spec.ts#L477-L533

  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Common/Controller/tests/referee.spec.ts#L624-L736

- the "one-turn" per player function

  Running a single placement turn:
  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Admin/referee.ts#L163-L192

  Running a single movement turn:
  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Admin/referee.ts#L236-L271

- a unit test for the "one-turn per player" function with a well-behaved player

  Running a single placement turn:
  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Common/Controller/tests/referee.spec.ts#L464-L468

  Running a single movement turn:
  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Common/Controller/tests/referee.spec.ts#L611-L615

- a unit test for the "one-turn" function with a cheating player

  Running a single placement turn:
  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Common/Controller/tests/referee.spec.ts#L470-L474

  Running a single movement turn:
  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Common/Controller/tests/referee.spec.ts#L617-L621

- a unit test for the "one-turn" function with an failing player

  We did not implement any checking for failing players yet as defined in our referee purpose statement, instead saving this for the networking component of this project where cases a failure will be much more prominent.

- for documenting which abnormal conditions the referee addresses

  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Admin/referee.ts#L568-L579

- the place where the referee re-initializes the game tree when a player is kicked out for cheating and/or failing

  https://github.ccs.neu.edu/CS4500-F20/libertyhill/blob/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish/Admin/referee.ts#L394-L438

**Please use GitHub perma-links to the range of lines in specific
file or a collection of files for each of the above bullet points.**

WARNING: all perma-links must point to your commit "b156d00ef0dbc53e79f7eb7a4feaef084660bee0".
Any bad links will be penalized.
Here is an example link:
<https://github.ccs.neu.edu/CS4500-F20/libertyhill/tree/b156d00ef0dbc53e79f7eb7a4feaef084660bee0/Fish>
