# 6 &mdash; Games! | Design Task

## Tournament Manager Protocol

The following details all the calling conventions within the Tournament Manager API which a Tournament Manager must implement. It details how to supply players and observers to a Tournament Manager and request it to run a tournament with these inputs, returning the result of this.

The purpose of a Tournament Manager is to run tournaments for the game company. To run a tournament, the sign up server will handle the sign-ups and acceptance of remote-player connections, collect them for a certain period, and then hand them off to the tournament manager via it's `RunTournament` call to run the tournament and return the results. We assume the sign up server will handle collecting the proper number of players for a tournament, meaning it won't provide the tournament manager a number of players that will cause a leftover invalid 1-player game.

---

### `RunTournament: (Array<TournamentPlayer, Array<TournamentObserver>>) => TournamentStatistics`

The RunTournament call signals to the Tournament Manager to run an entire tournament with the given array of TournamentPlayers. This puts the manager/this call in charge of:

- creating matchups
- running each round of games
- identifying the winners/losers
- keeping track of failing/cheating players
- funneling players into more games until there is a single winner, meaning that the tournament is over.
- updating tournament observers of tournament state

Upon completion of the tournament, this call will return the final TournamentStatistics which will inform the caller of the ordered ranking of players, where the first was the winner and the rest are the losers in order of when they lost descending.

### `MatchupPlayers: (Array<TournamentPlayer>) => Array<Array<TournamentPlayer>>`

MatchupPlayers is an internal function for the Tournament Manager to divide the tournament players into games, depending on the function's own implementation of a tournament. It is given the array of all (non-failing/cheating) players in the tournament. This function could implement any type of tournament (single/double elimination bracket, round robin, etc), but regardless of this implementation it returns an array of arrays of players.

The outer array represents a tournament round, consisting of internal arrays (2-4 players) representing each game matching for the tournament round. This function is called by the tournament manager after RunTournament begins, and is repeatedly called from RunTournament throughout the tournament after the completion of each round. It is called as many times as it takes to complete the tournament and determine a tournament winner.
