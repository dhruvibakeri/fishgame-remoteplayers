import { BoardPosition } from "./board"
import { Movement } from "./game-tree"
import { Player, Game } from "./state"

/**
 * A GameDebrief represents information about the outcome of a completed Fish
 * game. It is meant to house information from which each player can glean 
 * how the game played out. 
 * 
 * @param activePlayers represents the roster of players who remained active 
 * until the end of the game. Since players also contain their respective 
 * scores, it also acts as an end-of-game scoresheet.
 * 
 * @param kickedPlayers represents the roster of players who either failed
 * or were kicked out of the game due to making invalid or illegal moves.
 */
interface GameDebrief {
    readonly activePlayers: Array<Player>;
    readonly kickedPlayers: Array<Player>;
}

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
type MakePlacement = (game: Game) => BoardPosition

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
type MakeMovement = (game: Game) => Movement

/**
 * The SendGameDebrief call allows the referee to send the player a debrief
 * of the game results following the conclusion of the game. The referee sends the
 * GameDebrief which contains a list of players who got kicked/disqualified during
 * the game and a list of those who did not. The players can then, if they so choose,
 * determine the winner of the game or their placement based on the `score` attribute
 * of each player object in the list. This call should only be hit after the game
 * is over as it signals to the player that the game is finished.
 * 
 * @param gameDebrief the GameDebrief being given to the player containing information
 * regarding the game's outcome.
 */
type SendGameDebrief = (gameDebrief: GameDebrief) => void


/**
 * A DisqualifyMe call gives the referee a way to signal to the player that they've
 * attempted to make an illegal move. The referee sends the player a short message
 * about why the were disqualified, the player does not need to return any information
 * as this is simply a flag function, to flag the player that they've been kicked
 * from the game. This call will be hit immediately after the referee requests a move
 * and marks it as illegal.
 */
type DisqualifyMe = (msg: string) => void;
