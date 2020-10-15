import { Player, Game } from "../types/state";
import { BoardPosition, Penguin } from "../types/board";
import {
  InvalidPositionError,
  InvalidGameStateError,
  IllegalPenguinPositionError,
} from "../types/errors";
import {
  isError,
  playerHasUnplacedPenguin,
  positionIsPlayable,
  validatePenguinMove,
} from "./validation";

/**
 * Place a Penguin at the given end position, optionally also removing the
 * Penguin at a given start position.
 *
 * @param penguinPositions the Penguin position mapping
 * @param penguin the Penguin to move to the end position
 * @param endPosition the end position to add the Penguin to
 * @param startPosition the starting position to clear within the mapping
 * @return the new updated position mapping
 */
const movePenguinInPenguinPositions = (
  penguinPositions: Map<BoardPosition, Penguin>,
  penguin: Penguin,
  endPosition: BoardPosition,
  startPosition?: BoardPosition
): Map<BoardPosition, Penguin> => {
  // Copy the given position mapping.
  const newPenguinPositions: Map<BoardPosition, Penguin> = new Map(
    penguinPositions
  );

  // Remove the Penguin at the start position.
  if (startPosition) {
    newPenguinPositions.delete(startPosition);
  }

  // Add the Penguin to its end position.
  newPenguinPositions.set(endPosition, penguin);

  return newPenguinPositions;
};

/**
 * Places a penguin on behalf of a player. Takes in a penguin, position, and game state,
 * and places the penguin at the given position if it is a valid position.
 *
 * @param penguin Penguin to be placed
 * @param game Current game state
 * @param position Position at which to place the penguin
 * @return the Game state with the updated board or an error
 */
const placePenguin = (
  player: Player,
  game: Game,
  position: BoardPosition
):
  | Game
  | InvalidPositionError
  | InvalidGameStateError
  | IllegalPenguinPositionError => {
  // Validate position where penguin will be placed
  if (!positionIsPlayable(game, position)) {
    return new IllegalPenguinPositionError(game, player, position);
  }

  // Validate that player has unplaced penguin(s) remaining
  if (!playerHasUnplacedPenguin(player, game)) {
    return new InvalidGameStateError(
      game,
      "Player does not have any remaining unplaced penguins"
    );
  }

  // Create penguin to be placed
  const penguinToPlace = { color: game.playerToColorMapping.get(player) };

  // Decrement count of unplaced penguins for player
  const newUnplacedPenguins: Map<Player, number> = new Map(
    game.remainingUnplacedPenguins
  );
  newUnplacedPenguins.set(
    player,
    game.remainingUnplacedPenguins.get(player) - 1
  );

  // Place penguin
  const updatedPenguinPositions: Map<
    BoardPosition,
    Penguin
  > = movePenguinInPenguinPositions(
    game.penguinPositions,
    penguinToPlace,
    position
  );

  return {
    ...game,
    remainingUnplacedPenguins: newUnplacedPenguins,
    penguinPositions: updatedPenguinPositions,
  };
};

/**
 * Move the given Player's penguin at the given start position on the Board of
 * the given Game state to a given end position.
 *
 * @param game the Game state
 * @param player the Player who is moving their Penguin
 * @param startPosition the position of Penguin the Player wishes to move
 * @param endPosition the position the Player wants to move its Penguin to
 * @return the new Game state with the resulting move or an error
 */
const movePenguin = (
  game: Game,
  player: Player,
  startPosition: BoardPosition,
  endPosition: BoardPosition
):
  | Game
  | InvalidPositionError
  | IllegalPenguinPositionError
  | InvalidGameStateError => {
  // Validate the move and get the Penguin being moved.
  const playerPenguinOrError:
    | Penguin
    | IllegalPenguinPositionError
    | InvalidGameStateError
    | InvalidPositionError = validatePenguinMove(
    game,
    player,
    startPosition,
    endPosition
  );

  if (isError(playerPenguinOrError)) {
    // If the move was invalid, return the error.
    return playerPenguinOrError;
  } else {
    // If the move is valid, update the Game state's Penguin position
    // mapping and return the new state.
    const updatedPenguinPositions = movePenguinInPenguinPositions(
      game.penguinPositions,
      playerPenguinOrError,
      endPosition,
      startPosition
    );

    return {
      ...game,
      penguinPositions: updatedPenguinPositions,
    };
  }
};

export { movePenguinInPenguinPositions, placePenguin, movePenguin };
