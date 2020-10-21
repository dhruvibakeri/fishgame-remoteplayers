import { PenguinColor, BoardPosition, Board, Tile } from "../../board";
import { Player, Game } from "../../state";
import { createNumberedBoard } from "./boardCreation";
import { createGameState } from "./gameStateCreation";
import {
  InputPlayer,
  InputPosition,
  InputState,
  InputBoard,
} from "./testHarnessInput";
import { isError } from "./validation";

/**
 * Given an InputPlayer, derive a unique name for this player.
 *
 * This is used to bridge the gap between the InputPlayer
 * representation which has no explicit name, and the Player
 * representation which does.
 *
 * The current behavior for this is to simply use the InputPlayer's
 * color as their name.
 *
 * @param inputPlayer
 */
const getInputPlayerName = (inputPlayer: InputPlayer): string => {
  return inputPlayer.color;
};

/**
 * Transform the given InputPlayer into a Player.
 *
 * To reconcile differences in the structure of an InputPlayer and a Player,
 * the inputPlayer's color is used as the Player's name.
 *
 * @param inputPlayer the InputPlayer to transform
 * @return the transformed Player
 */
const inputPlayerToPlayer = (inputPlayer: InputPlayer): Player => {
  return {
    name: getInputPlayerName(inputPlayer),
    color: inputPlayer.color,
  };
};

/**
 * Transform the given InputPosition into a BoardPosition.
 *
 * @param inputPosition the InputPosition to transform
 * @return the transformed BoardPosition
 */
const inputPositionToBoardPosition = (
  inputPosition: InputPosition
): BoardPosition => {
  return { row: inputPosition[0], col: inputPosition[1] };
};

/**
 * Transform the given array of InputPlayers into a penguin positions mapping
 * from each position that holds a penguin to the penguin on that position.
 *
 * @param players the array of InputPlayers to transform
 * @return the transformed penguin positions mapping
 */
const inputPlayersToPenguinPositions = (
  players: Array<InputPlayer>
): Map<PenguinColor, Array<BoardPosition>> =>
  new Map(
    players.map((inputPlayer: InputPlayer) => [
      inputPlayer.color,
      inputPlayer.places.map(inputPositionToBoardPosition),
    ])
  );

/**
 * Attempt to transform the given InputState into a Game state, returning
 * the Game state if successful and an Error if one occurred while doing
 * so.
 *
 * @param inputState the InputState to transform
 * @return the successfully transformed Game state or an error
 */
const inputStateToGameState = (inputState: InputState): Game | Error => {
  // Derive information from the InputState necessary to create a Game.
  const board = createNumberedBoard(inputState.board);
  const players = inputState.players.map(inputPlayerToPlayer);
  const penguinPositions = inputPlayersToPenguinPositions(inputState.players);

  // If an error occurred, short circuit and return the error.
  if (isError(board)) {
    return board;
  }

  // Create the Game.
  return {
    ...createGameState(players, board),
    penguinPositions,
  };
};

/**
 * Transform the given BoardPosition into an InputPosition.
 *
 * @param boardPosition the BoardPosition to transform
 * @return the transformed InputPosition
 */
const boardPositionToInputPosition = (
  boardPosition: BoardPosition
): InputPosition => [boardPosition.row, boardPosition.col];

/**
 * For a given Player within a given Game, derive the positions of all that
 * player's Penguins in the form of an array of InputPositions.
 *
 * @param game the Game to derive from
 * @param player the player to get the places for
 * @return the array of InputPositions representing the given player's Penguins
 */
const getPlayerPlaces = (game: Game, player: Player): Array<InputPosition> => {
  const playerPenguinPositions = game.penguinPositions.get(player.color);
  return playerPenguinPositions.map(boardPositionToInputPosition);
};

/**
 * Transform the given Game state into an array of its InputPlayers.
 *
 * @param game the Game to transform
 * @return the Array of InputPlayers derived from the given Game
 */
const gameStateToInputPlayers = (game: Game): Array<InputPlayer> =>
  game.players.map((player: Player) => {
    return {
      color: player.color,
      score: game.scores.get(player.color),
      places: getPlayerPlaces(game, player),
    };
  });

/**
 * Transform the given Board to an InputBoard.
 *
 * @param board the Board to transform
 * @return the transformed InputBoard
 */
const boardToInputBoard = (board: Board): InputBoard =>
  board.tiles.map((row: Array<Tile>) =>
    row.map((tile: Tile) => tile.numOfFish)
  );

/**
 * Transform the given Game state into an InputState.
 *
 * @param game the Game state to transform
 * @return the transformed InputState
 */
const gameToInputState = (game: Game): InputState => {
  return {
    players: gameStateToInputPlayers(game),
    board: boardToInputBoard(game.board),
  };
};

export { inputStateToGameState, gameToInputState };
