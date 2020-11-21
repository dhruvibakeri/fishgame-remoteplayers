## Self-Evaluation Form for Milestone 8

Indicate below where your TAs can find the following elements in your strategy and/or player-interface modules:

1. did you organize the main function/method for the manager around
the 3 parts of its specifications --- point to the main function

  - [runTournament](https://github.ccs.neu.edu/CS4500-F20/christine/blob/880c0d9c2aacec62d300e43c7f5627ecb3bc62ca/Fish/Common/Controller/src/manager.ts#L228-L283)


2. did you factor out a function/method for informing players about
the beginning and the end of the tournament? Does this function catch
players that fail to communicate? --- point to the respective pieces

   - [informWinnersAndLosers](https://github.ccs.neu.edu/CS4500-F20/christine/blob/880c0d9c2aacec62d300e43c7f5627ecb3bc62ca/Fish/Common/Controller/src/manager.ts#L199-L226)
   - [winners become loesrs](https://github.ccs.neu.edu/CS4500-F20/christine/blob/880c0d9c2aacec62d300e43c7f5627ecb3bc62ca/Fish/Common/Controller/src/manager.ts#L221) -- requestTimeout throws error, which prevents winner from becoming "final winner"


3. did you factor out the main loop for running the (possibly 10s of
thousands of) games until the tournament is over? --- point to this
function.

   - [runTournament](https://github.ccs.neu.edu/CS4500-F20/christine/blob/880c0d9c2aacec62d300e43c7f5627ecb3bc62ca/Fish/Common/Controller/src/manager.ts#L228-L283)
   
   - [runTournamentRound](https://github.ccs.neu.edu/CS4500-F20/christine/blob/880c0d9c2aacec62d300e43c7f5627ecb3bc62ca/Fish/Common/Controller/src/manager.ts#L155-L197) runs a single round of the tournament.

**Please use GitHub perma-links to the range of lines in specific
file or a collection of files for each of the above bullet points.**


  WARNING: all perma-links must point to your commit "880c0d9c2aacec62d300e43c7f5627ecb3bc62ca".
  Any bad links will be penalized.
  Here is an example link:
    <https://github.ccs.neu.edu/CS4500-F20/christine/tree/880c0d9c2aacec62d300e43c7f5627ecb3bc62ca/Fish>

