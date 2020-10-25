import {
  Player,
  Game,
  getCurrentPlayerScore,
  getCurrentPlayerColor,
} from "../../state";
import { BoardPosition, Board, PenguinColor } from "../../board";
import {
  InvalidPositionError,
  InvalidGameStateError,
  IllegalPenguinPositionError,
  NoMorePlacementsError,
} from "../types/errors";
import {
  isError,
  playerHasUnplacedPenguin,
  positionIsPlayable,
  validatePenguinMove,
} from "./validation";
import { getFishNumberFromPosition, setTileToHole } from "./boardCreation";
import { getNextPlayerIndex } from "./gameStateCreation";

/**
 * Adds score to current player based on the number of fish at the given tile that
 * the penguin will land on
 *
 * @param game Game state to find fish score and current player
 * @param landingPosition board position penguin is going to land
 * @returns the updated scoresheet from updating the current player's score.
 */
const updatePlayerScore = (
  game: Game,
  landingPosition: BoardPosition
): Map<PenguinColor, number> => {
  const newPlayerScore =
    getCurrentPlayerScore(game) +
    getFishNumberFromPosition(game.board, landingPosition);
  const updatedScores = new Map(game.scores);
  updatedScores.set(getCurrentPlayerColor(game), newPlayerScore);
  return updatedScores;
};

/**
 * Determine whether the two given positions have the same row and col values.
 *
 * @param position1 the first position to compare
 * @param position2 the second position to compare
 * @return whether the two positions are logically equivalent
 */
const positionsAreEqual = (
  position1: BoardPosition,
  position2: BoardPosition
): boolean =>
  position1.col === position2.col && position1.row === position2.row;

/**
 * Place a Penguin at the given end position, optionally also removing the
 * Penguin at a given start position.
 *
 * @param penguinPositions the Penguin position mapping
 * @param color the color of the Penguin to place
 * @param endPosition the end position to add the Penguin to
 * @param startPosition the starting position to clear within the mapping
 * @return the new updated position mapping
 */
const movePenguinInPenguinPositions = (
  game: Game,
  color: PenguinColor,
  endPosition: BoardPosition,
  startPosition?: BoardPosition
): Map<PenguinColor, Array<BoardPosition>> => {
  // Copy the given position mapping.
  const newPenguinPositions = new Map(game.penguinPositions);

  // Remove the Penguin at the start position.
  if (startPosition) {
    const removedPenguinPositions = (
      newPenguinPositions.get(color) || []
    ).filter(
      (position: BoardPosition) => !positionsAreEqual(position, startPosition)
    );
    newPenguinPositions.set(color, removedPenguinPositions);
  }

  // Add the Penguin to its end position.
  newPenguinPositions.set(color, [
    ...(newPenguinPositions.get(color) || []),
    endPosition,
  ]);

  return newPenguinPositions;
};

/**
 * Places a penguin on behalf of a player. Takes in a player, position, and game state,
 * and places the penguin at the given position if it is a valid position.
 *
 * @param player the player placing the penguin
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
  | NoMorePlacementsError
  | InvalidGameStateError
  | IllegalPenguinPositionError => {
  // Validate position where penguin will be placed
  if (!positionIsPlayable(game, position)) {
    return new IllegalPenguinPositionError(game, player, position);
  }

  // Validate that player has unplaced penguin(s) remaining
  if (!playerHasUnplacedPenguin(player, game)) {
    return new NoMorePlacementsError(game);
  }

  // Validate that player is the current player (it's currently the given player's turn)
  if (player.color !== getCurrentPlayerColor(game)) {
    return new InvalidGameStateError(
      game,
      "Player attempting to play out of turn"
    );
  }

  // Decrement count of unplaced penguins for player
  const newUnplacedPenguins: Map<PenguinColor, number> = new Map(
    game.remainingUnplacedPenguins
  );
  const penguinsRemaining = game.remainingUnplacedPenguins.get(player.color);
  newUnplacedPenguins.set(
    player.color,
    penguinsRemaining ? penguinsRemaining - 1 : 0
  );

  // Place penguin.
  const updatedPenguinPositions = movePenguinInPenguinPositions(
    game,
    player.color,
    position
  );

  return {
    ...game,
    curPlayerIndex: getNextPlayerIndex(game),
    penguinPositions: updatedPenguinPositions,
    remainingUnplacedPenguins: newUnplacedPenguins,
    scores: updatePlayerScore(game, position),
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
  const isValidOrError:
    | true
    | IllegalPenguinPositionError
    | InvalidGameStateError
    | InvalidPositionError = validatePenguinMove(
    game,
    player,
    startPosition,
    endPosition
  );

  if (isError(isValidOrError)) {
    // If the move was invalid, return the error.
    return isValidOrError;
  } else {
    // If the move is valid, update the Game state's Penguin position
    // mapping and return the new state.
    const updatedPenguinPositions = movePenguinInPenguinPositions(
      game,
      player.color,
      endPosition,
      startPosition
    );

    // Update board (turn tile penguin will be leaving into a hole)
    // setTileToHole will always return board because we've already verified that startPosition is a
    // valid board position earlier in this function
    const newBoard = setTileToHole(game.board, startPosition) as Board;

    return {
      ...game,
      board: newBoard,
      curPlayerIndex: getNextPlayerIndex(game),
      penguinPositions: updatedPenguinPositions,
      scores: updatePlayerScore(game, endPosition),
    };
  }
};

export {
  positionsAreEqual,
  movePenguinInPenguinPositions,
  placePenguin,
  movePenguin,
  getFishNumberFromPosition,
  updatePlayerScore,
};
