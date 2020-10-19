import { Player, Game, getPositionKey } from "../../state";
import { BoardPosition, Penguin, Board } from "../../board";
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
import { setTileToHole } from "./boardCreation";

/**
 * Returns the number of fish on the tile at the given position
 *
 * @param game Game state to find board tile position
 * @param position tile position to find fish number at
 * @returns number representing the number of fish at the given position
 */
const getCurPlayerIndex = (game: Game): number => {
  return game.players.findIndex((player: Player) => player === game.curPlayer);
};

/**
 * Takes in the game state and returns the player that should be the next curPlayer
 *
 * @param game Game to find next player
 * @returns player that would be the next curPlayer for the given game state
 */
const getNextPlayer = (game: Game): Player => {
  const nextPlayerIndex = getCurPlayerIndex(game) + 1;
  if (nextPlayerIndex === game.players.length) {
    return game.players[0];
  }
  return game.players[nextPlayerIndex];
};

/**
 * Returns the number of fish on the tile at the given position
 *
 * @param game Game state to find board tile position
 * @param position tile position to find fish number
 * @returns number representing the number of fish at the given position
 */
const getFishNumberFromPosition = (
  game: Game,
  position: BoardPosition
): number => {
  return game.board.tiles[position.row][position.col].numOfFish;
};

/**
 * Adds score to current player based on the number of fish at the given tile that
 * the penguin will land on
 *
 * @param game Game state to find fish score and current player
 * @param landingPosition board position penguin is going to land
 * @returns Current player with additional points from number of fish at given landingPosition
 */
const updatePlayerScore = (
  game: Game,
  landingPosition: BoardPosition
): Player => {
  const newPlayerScore =
    game.curPlayer.score + getFishNumberFromPosition(game, landingPosition);
  return { ...game.curPlayer, score: newPlayerScore };
};

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
  game: Game,
  penguin: Penguin,
  endPosition: BoardPosition,
  startPosition?: BoardPosition
): Map<string, Penguin> => {
  // Copy the given position mapping.
  const newPenguinPositions: Map<string, Penguin> = new Map(
    game.penguinPositions
  );

  // Remove the Penguin at the start position.
  if (startPosition) {
    newPenguinPositions.delete(getPositionKey(startPosition));
  }

  // Add the Penguin to its end position.
  newPenguinPositions.set(getPositionKey(endPosition), penguin);

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

  // Validate that player is the current player (it's currently the given player's turn)
  if (player !== game.curPlayer) {
    return new InvalidGameStateError(
      game,
      "Player attempting to play out of turn"
    );
  }

  // Create penguin to be placed
  const penguinToPlace = { color: game.playerToColorMapping.get(player.name) };

  // Decrement count of unplaced penguins for player
  const newUnplacedPenguins: Map<string, number> = new Map(
    game.remainingUnplacedPenguins
  );
  newUnplacedPenguins.set(
    player.name,
    game.remainingUnplacedPenguins.get(player.name) - 1
  );

  // Place penguin
  const updatedPenguinPositions: Map<
    string,
    Penguin
  > = movePenguinInPenguinPositions(game, penguinToPlace, position);

  // Find next curPlayer
  const nextCurPlayer = getNextPlayer(game);

  // Update current player score
  game.players[getCurPlayerIndex(game)] = updatePlayerScore(game, position);

  return {
    ...game,
    curPlayer: nextCurPlayer,
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
      game,
      playerPenguinOrError,
      endPosition,
      startPosition
    );

    // Find next curPlayer
    const nextCurPlayer = getNextPlayer(game);

    // Update board (turn tile penguin will be leaving into a hole)
    // setTileToHole will always return board because we've already verified that startPosition is a
    // valid board position earlier in this function
    const newBoard = setTileToHole(game.board, startPosition) as Board;

    // Update player score
    game.players[getCurPlayerIndex(game)] = updatePlayerScore(
      game,
      endPosition
    );

    return {
      ...game,
      board: newBoard,
      curPlayer: nextCurPlayer,
      penguinPositions: updatedPenguinPositions,
    };
  }
};

export {
  movePenguinInPenguinPositions,
  placePenguin,
  movePenguin,
  getCurPlayerIndex,
  getNextPlayer,
  getFishNumberFromPosition,
  updatePlayerScore,
};
