# 6 &mdash; Games! | Design Task

## Tournament Manager Protocol

The following details all the calling conventions within the Tournament Manager API which a Tournament Manager must implement. It details how to supply players and observers to a Tournament Manager and request it to run a tournament with these inputs, returning the result of this.

The purpose of a Tournament Manager is 

### `RunTournament: (Array<TournamentPlayer, Array<TournamentObserver>>) => TournamentStatistics`

The RunTournament call signals to the Tournament Manager to run an entire tournament with the given array of TournamentPlayers. This puts the manager/this call in charge of creating matchups, running each round of games, identifying the winners/losers, and funneling them into more games until there is a single winner, meaning that the tournament is over. Upon this, this call will return the final TournamentStatistics which will inform the caller of the ordered ranking of players, where the first was the winner and the rest are the losers in order of when they lost descending.