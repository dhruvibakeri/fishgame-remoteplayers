import { BoardPosition } from "../Common/board";
import { Game, MovementGame } from "../Common/state";
import { getNextPenguinPlacementPosition, chooseNextAction } from "../Common/Controller/src/strategy";
import { GameDebrief, TournamentPlayer } from "../Common/player-interface";
import { InputDepth } from "../Common/Controller/src/testHarnessInput";

const LOOKAHEAD_DEPTH = 2;

/**
 * Implementation of the player-referee protocol GameIsStarting call.
 * This is to let the player know that the game they are participating in is
 * beginning. At this point, this player implementation doesn't need to do
 * anything with this information but we define the function in case that
 * another implementation does.
 *
 * @param game the initial Game state of the game
 */
const gameIsStarting = (game: Game): void => {
  return;
};

/**
 * Given a game, this function uses the logic from ./strategy.ts to make a
 * placement for this player. This is made by choosing the next available
 * position from the top leftmost of the board, iterating through positions
 * from left to right, top down.
 *
 * @param game current state of the game for the player to make a placement on
 */
const makePlacement = (game: Game): Promise<BoardPosition> => {
  // The player assumes that the game given to them by the referee is
  // valid in that it contains enough positions for all of each player's
  // placements, in which case this strategy must be able to find an
  // available BoardPosition.
  return Promise.resolve(
    getNextPenguinPlacementPosition(game).unsafelyUnwrap()
  );
};

/**
 * Given a depth, create a MakeMovement function that uses the logic from ./strategy.ts 
 * to make the best possible move based on the tree with that depth and return
 * that best move.
 *
 * @param depth the maximum lookahead depth to use in this player's minimax strategy
 * @return a MakeMovement function which uses the minimax strategy with the given depth
 */
const makeMovementWithDepth = (depth: number) => (game: Game) => Promise.resolve(
    chooseNextAction(game as MovementGame, depth).unsafelyUnwrap()
  );

/**
 * Function to let the player know that the game has ended, and to inform them
 * of the game's outcome using a GameDebrief.
 *
 * @param gameDebrief the game's final outcome
 */
const gameHasEnded = (gameDebrief: GameDebrief): void => {
  return;
};

/**
 * Function to let the player know they've been disqualified. At this point,
 * this player implementation doesn't need to do anything with this information
 * but we define the function in the case that another implementation does
 * want to handle disqualification.
 *
 * @param msg message indicating why the player was disqualified
 */
const disqualifyMe = (msg: string): void => {
  return;
};

/**
 * Function to let this player know whether they've won or not. At this point,
 * this player implementation doesn't need to do anything with this information,
 * so we simply accept the outcome.
 *
 * @param didIWin whether this player won the tournament
 */
const wonTournament = async (didIWin: boolean): Promise<boolean> => {
  return true;
}

/**
 * Given the player's name, create a TournamentPlayer implementation using the
 * strategies for placement and movement outlined within "./strategy.ts"
 *
 * All functionalities apart from making placements/movements remain unim
 *
 * @param name the name of the player
 * @return the created sample TournamentPlayer
 */
const createSamplePlayer = (name: string, depth: InputDepth = LOOKAHEAD_DEPTH): TournamentPlayer => {
  return {
    name,
    gameIsStarting,
    makePlacement,
    makeMovement: makeMovementWithDepth(depth),
    gameHasEnded,
    disqualifyMe,
    wonTournament
  };
};

export { createSamplePlayer };
