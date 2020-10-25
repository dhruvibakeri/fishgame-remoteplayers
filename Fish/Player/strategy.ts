import { BoardPosition } from "../Common/board";
import { Game, getCurrentPlayer, Player } from "../Common/state";
import { placePenguin } from "../Common/Controller/src/penguinPlacement";
import {
  positionIsPlayable,
  isError,
} from "../Common/Controller/src/validation";
import {
  IllegalPenguinPositionError,
  InvalidGameStateError,
  NoMorePlacementsError,
} from "../Common/Controller/types/errors";
import { Movement } from "../Common/game-tree";

/**
 * Using the zig-zag strategy as outlined in Milestone 5, finds the next
 * playable position on the board in the given game. Returns the position
 * of the next playable tile.
 *
 * @param game Game to search for next available tile in zig-zag pattern
 * @returns BoardPosition representing the next available position to place
 * a penguin.
 */
const getNextPenguinPlacementPosition = (game: Game): BoardPosition => {
  for (let row = 0; row < game.board.tiles.length; row++) {
    for (let col = 0; col < game.board.tiles[0].length; col++) {
      if (positionIsPlayable(game, { row, col })) {
        return { row, col };
      }
    }
  }
};

/**
 * Using the zig-zag strategy as outlined in Milestone 5, find the next
 * position for the placement of the given game's current player's
 * penguin while they have penguins to place.
 *
 * @param game the Game state from which to place the next penguin
 * @return the resulting Game state from the placement or an error
 * if the penguin can't be placed
 */
const placeNextPenguin = (
  game: Game
):
  | Game
  | NoMorePlacementsError
  | InvalidGameStateError
  | IllegalPenguinPositionError => {
  // Get next available space in zig zag pattern.
  const placementPosition: BoardPosition = getNextPenguinPlacementPosition(
    game
  );

  // Attempt to place the penguin and return the result.
  return placePenguin(getCurrentPlayer(game), game, placementPosition);
};

/**
 * Places all remaining unplaced penguins in given Game in the zig-zag pattern
 * outlined in Milestone 5.
 *
 * @param game Game state to place all remaining unplaced penguins
 * @returns Game with all penguins placed in playable spaces in a zig-zag pattern
 */
const placeAllPenguinsZigZag = (
  game: Game
):
  | Game
  | NoMorePlacementsError
  | InvalidGameStateError
  | IllegalPenguinPositionError => {
  let curPlayer: Player = getCurrentPlayer(game);
  let placedPenguinGame:
    | Game
    | NoMorePlacementsError
    | InvalidGameStateError
    | IllegalPenguinPositionError = game;
  while (
    game.remainingUnplacedPenguins.get(curPlayer.color) > 0 &&
    !isError(placedPenguinGame)
  ) {
    placedPenguinGame = placeNextPenguin(game);
    if (!isError(placedPenguinGame)) {
      curPlayer = getCurrentPlayer(placedPenguinGame);
    }
  }

  return placedPenguinGame;
};

const chooseNextAction = (game: Game, lookAheadDepth: number): Movement => {
  // Create the GameTree for the given state.
  // Examine depth-first to find the movement(s) that leads to the minimal
  // maximum gain for the Game's current player.
  // Tie break the found movements.
  // Return the next movement.
};

export {
  getNextPenguinPlacementPosition,
  placeNextPenguin,
  placeAllPenguinsZigZag,
  chooseNextAction,
};
