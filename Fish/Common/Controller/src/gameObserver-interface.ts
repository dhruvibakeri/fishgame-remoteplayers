import { GameDebrief } from "../../player-interface";
import { Game } from "../../state";


/**
 * A GameObserver is an observer of a game being run by the referee. A GameObserver would
 * get instant updates of any changes being made at any stage of the game. 
 *  Updates include : 
 *   - starting of a game
 *   - changes made during the game (placement turns / movement turns)
 *   - ending of a game 
 */
export interface GameObserver {
    readonly gameIsStarting: GameIsStartingObserver;
    readonly gameHasChanged: GameHasChanged;
    readonly gameHasEnded: GameHasEndedObserver;
}

/**
 * A GameIsStarting call is meant to allow the referee to signal to the Game Observer
 * that the game is starting. The referee passes the initial game state to the
 * Game Observer, but does not need or expect a response from the Game Observer. This call is
 * used by the referee exactly once at the start of the game.
 *
 * @param game the initial starting game state
 */
export type GameIsStartingObserver = (game: Game) => void;

/**
 * A GameHasChanged call is made to let the Game Observer know that a player
 * has made a placement turn or a movement turn. The changed Game which represents
 * the changed Game State, is handed to the Game Observer as well. 
 */
export type GameHasChanged = (game: Game) => void;

/**
 * The GameHasEnded call allows the referee to send the Game Observer a debrief
 * of the game results, signalling the conclusion of the game. The referee sends the
 * GameDebrief which contains a list of players who got kicked/disqualified during
 * the game and a list of those who did not. This call should only be hit after the game
 * is over as it signals to the Game Observer that the game is finished.
 *
 * @param gameDebrief the GameDebrief being given to the Game Observer containing information
 * regarding the game's outcome.
 */
export type GameHasEndedObserver = (gameDebrief: GameDebrief) => void;

