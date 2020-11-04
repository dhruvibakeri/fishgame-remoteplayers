import { BoardPosition } from "./board";
import { Movement } from "./game-tree";
import { Game } from "./state";

/**
 * A GameDebrief represents information about the outcome of a completed Fish
 * game. It is meant to house information from which each player can glean
 * how the game played out.
 *
 * @param activePlayers represents the roster of players who remained active
 * until the end of the game, with their scores. This will be ordered by
 * descending score.
 *
 * @param kickedPlayers represents the roster of players who either failed
 * or were kicked out of the game due to failing to make a move within a
 * specified timeout when requested, or making invalid or illegal moves.
 * Note that in the final debrief, we do not distinguish between failed and
 * cheating players, instead lumping them together into a single array of
 * InactivePlayers which only notes their identifying information.
 */
interface GameDebrief {
  readonly activePlayers: Array<ActivePlayer>;
  readonly kickedPlayers: Array<InactivePlayer>;
}

/**
 * An ActivePlayer is a player who stayed in the game until the end of the game.
 * Even if a player's penguins got stuck before the end of the game, they are still
 * an active player. An active player is one who did not get disqualified for any reason.
 *
 * @param name The name of the player given to the referee by the Tournament manager
 * before the game began. Note that this name must uniquely define this player.
 * @param score The player's final score at the conclusion of the game
 */
interface ActivePlayer {
  readonly name: string;
  readonly score: number;
}

/**
 * An InactivePlayer is a player who either failed to make a move within the
 * specified timeout duration of their turn when requested, or who delivered
 * a move that was found to be illegal based upon the GameTree of the current
 * Game's state. In either cases, the player was subsequently kicked upon
 * making either violation during the course of the game.
 *
 * @param name the name of the player given to the referee by the Tornament manager
 * before the game began. Note that this name must uniquely define this player.
 */
interface InactivePlayer {
  readonly name: string;
}

/**
 * A GameIsStarting call is meant to allow the referee to signal to the player
 * that the game is starting. The referee passes the initial game state to the
 * player, but does not need or expect a response from the player. This call is
 * used by the referee exactly once at the start of the game.
 *
 * @param game the initial starting game state
 */
type GameIsStarting = (game: Game) => void;

/**
 * A MakePlacement call is meant to expose to the referee how to place its
 * next avatar from the given a Game state. Essentially, it is a function that
 * the player must implement to this signature which returns the information
 * necessary for the referee to interpret and execute their placement, which
 * is simply the BoardPosition of their placement on the board.
 *
 * @param game the current Game state from which the player will be making
 * their placement.
 * @return the BoardPosition which represents where the player wishes to place
 * their penguin.
 */
type MakePlacement = (game: Game) => BoardPosition;

/**
 * A MakeMovement call is meant to expose to the referee how to take its
 * next turn i.e. moving one of its avatars from the given Game state.
 * Essentially, it is a function that the player must implements to this
 * signature which returns the information necessary for the referee to
 * interpret and execute their turn, which is the Movement which contains the
 * starting position of the avatar they wish to move on the board, and the
 * ending position they wish to move to on the board.
 *
 * @param game the current Game state from which the player will be making
 * their placement.
 * @return the Movement which represents the starting and ending positions on
 * the board of the player's turn.
 */
type MakeMovement = (game: Game) => Movement;

/**
 * The GameHasEnded call allows the referee to send the player a debrief
 * of the game results, signalling the conclusion of the game. The referee sends the
 * GameDebrief which contains a list of players who got kicked/disqualified during
 * the game and a list of those who did not. The players can then, if they so choose,
 * determine the winner of the game or their placement based on the `score` attribute
 * of each player object in the list. This call should only be hit after the game
 * is over as it signals to the player that the game is finished.
 *
 * @param gameDebrief the GameDebrief being given to the player containing information
 * regarding the game's outcome.
 */
type GameHasEnded = (gameDebrief: GameDebrief) => void;

/**
 * A DisqualifyMe call gives the referee a way to signal to the player that they've
 * attempted to make an illegal move. The referee sends the player a short message
 * about why the were disqualified, the player does not need to return any information
 * as this is simply a flag function, to flag the player that they've been kicked
 * from the game. This call will be hit immediately after the referee requests a move
 * and marks it as illegal.
 */
type DisqualifyMe = (msg: string) => void;

/**
 * A TournamentPlayer represents an implementation of the player-referee
 * protocol, specifying both identifying information for the player, along
 * with the various calls that the referee may make to this player in order
 * to notify them of the game starting or ending, request the corresponding
 * actions for their turns, and notify them of potential disqualification.
 *
 *
 * @param gameIsStarting call to tell the player that the game is starting
 * @param makePlacement call to ask the player for a penguin placement location
 * @param makeMovement call to ask the player for a penguin movement
 * @param gameHasEnded call to tell the player that the game has ended and give
 * game results
 * @param disqualifyMe call to tell the player they've been disqualified
 */
interface TournamentPlayer {
  name: string;
  gameIsStarting: GameIsStarting;
  makePlacement: MakePlacement;
  makeMovement: MakeMovement;
  gameHasEnded: GameHasEnded;
  disqualifyMe: DisqualifyMe;
}

export {
  GameDebrief,
  ActivePlayer,
  InactivePlayer,
  GameIsStarting,
  MakePlacement,
  MakeMovement,
  GameHasEnded,
  DisqualifyMe,
  TournamentPlayer,
};
