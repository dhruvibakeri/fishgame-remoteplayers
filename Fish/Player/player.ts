import { BoardPosition } from "../Common/board";
import { Game, MovementGame } from "../Common/state";
import { getNextPenguinPlacementPosition, chooseNextAction } from "../Common/Controller/src/strategy";
import { Movement } from "../Common/game-tree";
import { GameDebrief, TournamentPlayer } from "../Common/player-interface";

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
const makePlacement = (game: Game): BoardPosition => {
  // The player assumes that the game given to them by the referee is
  // valid in that it contains enough positions for all of each player's
  // placements, in which case this strategy must be able to find an
  // available BoardPosition.
  return getNextPenguinPlacementPosition(game).unwrapOrElse(null);
};

/**
 * Given a game, this function uses the logic from ./strategy.ts to make
 * the best possible move based on the tree with LOOKAHEAD_DEPTH and returns
 * that best move.
 *
 * @param game current state of the game for the player to make a move on
 */
const makeMovement = (game: Game): Movement => {
  // The player assumes the given game is a valid MovementGame, as it's being
  // handed to the player directly from the Referee. Since the given game is a
  // valid MovementGame the function will return a valid Movement.
  return chooseNextAction(game as MovementGame, LOOKAHEAD_DEPTH).unwrapOrElse(null);
};

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
 * Given the player's name, create a TournamentPlayer implementation using the
 * strategies for placement and movement outlined within "./strategy.ts"
 *
 * All functionalities apart from making placements/movements remain unim
 *
 * @param name the name of the player
 * @return the created sample TournamentPlayer
 */
const createSamplePlayer = (name: string): TournamentPlayer => {
  return {
    name,
    gameIsStarting,
    makePlacement,
    makeMovement,
    gameHasEnded,
    disqualifyMe,
  };
};

export { createSamplePlayer };
