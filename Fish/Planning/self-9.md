## Self-Evaluation Form for Milestone 9

You must make an appointment with your grader during his or her office
hour to demo your project. See the end of the self-eval for the assigned
grader. 

Indicate below where your TA can find the following elements in your strategy 
and/or player-interface modules: 

1. for human players, point the TA to
   - the interface (signature) that an AI player implements
   - the interface that the human-GUI component implements
   - the implementation of the player GUI

2. for game observers, point the TA to
   - the `game-observer` interface that observers implement : [`src`](https://github.ccs.neu.edu/CS4500-F20/fairview/blob/d17f3d8ac8dc2640d9e51763258bde7f2ad3dac6/Fish/Common/Controller/src/gameObserver-interface.ts#L5-L17)
   - the point where the `referee` consumes observers : [`src`](https://github.ccs.neu.edu/CS4500-F20/fairview/blob/d17f3d8ac8dc2640d9e51763258bde7f2ad3dac6/Fish/Admin/referee.ts#L677-L681)
   - the callback from `referee` to observers concerning turns : 
      - placement turns : [`src`](https://github.ccs.neu.edu/CS4500-F20/fairview/blob/d17f3d8ac8dc2640d9e51763258bde7f2ad3dac6/Fish/Admin/referee.ts#L270)
      - movement turns : [`src`](https://github.ccs.neu.edu/CS4500-F20/fairview/blob/d17f3d8ac8dc2640d9e51763258bde7f2ad3dac6/Fish/Admin/referee.ts#L361)

3. for tournament observers, point the TA to
   - the `tournament-observer` interface that observers implement 
   - the point where the `manager` consumes observers 
   - the callback to observes concerning the results of rounds 


Do not forget to meet the assigned TA for a demo; see bottom.  If the
TA's office hour overlaps with other obligations, sign up for a 1-1.


**Please use GitHub perma-links to the range of lines in specific
file or a collection of files for each of the above bullet points.**


  WARNING: all perma-links must point to your commit "d17f3d8ac8dc2640d9e51763258bde7f2ad3dac6".
  Any bad links will be penalized.
  Here is an example link:
    <https://github.ccs.neu.edu/CS4500-F20/fairview/tree/d17f3d8ac8dc2640d9e51763258bde7f2ad3dac6/Fish>

Assigned grader = Julia Belyakova (julbinb@gmail.com)

