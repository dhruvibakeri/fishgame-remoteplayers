import { TournamentPlayer } from "../Common/player-interface";

/**
 * A TournamentStatistics represents information retrieved at the end of a
 * tournament (when there is a single winner) detailing the outcome of the
 * tournament.
 *
 * @param ranking an ordering of all the participating players' names
 * in the order of their ranking in the tournament, with the first
 * element being the winner and all proceeeding players in order of
 * when in the tournament they lost.
 */
interface TournamentStatistics {
  readonly ranking: Array<string>;
}

/**
 * A TournamentObserver represents an observer of a tournament. The observer
 * needs to be notified of tournament statistics/updates, using it's update
 * call. Otherwise the tournament manager does not need to have any sense of
 * specific implementation.
 *
 * @param update call for the tournament manager to update the observer of
 * tournament happenings with a simple message string
 */
export interface TournamentObserver {
  readonly update: (msg: string) => void;
}

/**
 * A MatchupPlayers call is the decision making mechanism for matching up players to
 * games for a single round in a tournament. This Matchup could implement any number
 * of tournament styles, (roundrobin, single/double elimination bracket, etc.). The
 * specific implementation doesn't matter to the tournament manager, as it will simply
 * hand the Matchup call a list of TournamentPlayers which will return a 2D array of
 * tournament players. Each inner array will correspond to the players of a game.
 *
 * @param tournamentPlayers list of TournamentPlayers to match to eachother to create games
 */
type MatchupPlayers = (
  tournamentPlayers: Array<TournamentPlayer>
) => Array<Array<TournamentPlayer>>;

/**
 * A RunTournament call is the sole call of the Tournament Manager interface,
 * and provides to whatever entity is running the tournament a way to run a
 * single tournament with the given participating roster of TournamentPlayers
 * and present array of TournamentObservers. This call will run an entire
 * tournament with these players, returning TournamentStatistics to sum up
 * the entire tournament's results.
 *
 * Running the tournament makes use of an external Matchup component which
 * handles the semantics of creating game matchups, which will be repeatedly
 * called after each round of games is complete, feeding some subset of the
 * original participating players into the Matchup component again to narrow
 * the roster of players into a single winner.
 *
 * @param tournamentPlayers the entire roster of participating players within
 * the tournament
 * @param tournamentObservers the observers of the tournament who will be
 * notified of updates to the tournament
 */
type RunTournament = (
  tournamentPlayers: Array<TournamentPlayer>,
  tournamentObservers: Array<TournamentObserver>
) => TournamentStatistics;

/**
 * A TournamentDebrief contains the outcome of running an entire tournament
 * which consists of an array of the names of the winners.
 *
 * @param winners an array containing the names of all the winners of the
 * tournament.
 */
export interface TournamentDebrief {
  readonly winners: Array<string>;
}

/**
 * The Results of running a single Tournament Round.
 * The remaining suriving players of a Round are split
 * into Winners (highest-score) and Losers.
 */
export type RoundResults = [
  winners: Array<TournamentPlayer>,
  losers: Array<TournamentPlayer>,
]