import { PenguinColor, BoardPosition, Board, Tile } from "../../board";
import { Movement } from "../../game-tree";
import { Player, Game, getCurrentPlayer } from "../../state";
import { createNumberedBoard } from "./boardCreation";
import { createGameState } from "./gameStateCreation";
import { movePenguin } from "./penguinPlacement";
import {
  InputPlayer,
  InputPosition,
  InputState,
  InputBoard,
  Action,
  MoveResponseQuery,
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
 * Given two InputPositions representing the starting and ending positions of
 * a Movement, create a Movement from them.
 *
 * @param fromPosition the starting InputPosition of the movement
 * @param toPosition the ending InputPosition of the movement
 * @return the converted Movement
 */
const inputPositionsToMovement = (
  fromPosition: InputPosition,
  toPosition: InputPosition
): Movement => {
  return {
    startPosition: inputPositionToBoardPosition(fromPosition),
    endPosition: inputPositionToBoardPosition(toPosition),
  };
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
 * Transform the given array of InputPlayers into a scoresheet mapping from
 * each player's color to their specified score.
 *
 * @param players the array of InputPlayers to transform
 * @return the transformed scoresheet mapping
 */
const inputPlayersToScores = (
  players: Array<InputPlayer>
): Map<PenguinColor, number> =>
  new Map(
    players.map((inputPlayer: InputPlayer) => [
      inputPlayer.color,
      inputPlayer.score,
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
  const scores = inputPlayersToScores(inputState.players);

  // If an error occurred, short circuit and return the error.
  if (isError(board)) {
    return board;
  }

  // Create the Game.
  return {
    ...createGameState(players, board),
    penguinPositions,
    scores,
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
 * @param index the index of this player in the ordering of players, used
 * to fix reorderings
 * @return the array of InputPositions representing the given player's Penguins
 */
const getPlayerPlaces = (
  game: Game,
  player: Player,
  index: number
): Array<InputPosition> => {
  const playerPenguinPositions = game.penguinPositions.get(player.color);
  if (index === 0 && playerPenguinPositions.length > 1) {
    // If the player is the first player in the ordering and their number of
    // placed penguins is greater than 1, this means that the ordering of
    // their penguins positions within its corresponding Game state penguin
    // position array has been changed. More specifically, Game movements
    // remove the original penguin position and appends them to the end of
    // the position array. This compensates for that to prevent issues with
    // recognizing JSON equality (order matters) by placing the last
    // penguin position back at the start, since it's also guaranteed by the
    // test harness that the first penguin will always been the one that moves.
    const reOrderedPenguinPositions = [
      playerPenguinPositions[playerPenguinPositions.length - 1],
      ...playerPenguinPositions.slice(0, playerPenguinPositions.length - 1),
    ];
    return reOrderedPenguinPositions.map(boardPositionToInputPosition);
  }
  return playerPenguinPositions.map(boardPositionToInputPosition);
};

/**
 * Transform the given Game state into an array of its InputPlayers.
 *
 * @param game the Game to transform
 * @return the Array of InputPlayers derived from the given Game
 */
const gameStateToInputPlayers = (game: Game): Array<InputPlayer> =>
  game.players.map((player: Player, index: number) => {
    return {
      color: player.color,
      score: game.scores.get(player.color),
      places: getPlayerPlaces(game, player, index),
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

/**
 * Given a MoveResponseQuery, return the Game state that results from applying
 * the specified movement to the game state.
 *
 * Since the xtree harness assumes that the given MoveResponseQuery is valid
 * and a portion of this validity means that the move outlined in the query
 * is valid for the given state, these same assumptions may also be held here when
 * applying the movement to the Game state. This assumption also ensures that
 * the given InputState is also a valid state for movement i.e. all penguins
 * are placed, since no movement would be valid otherwise.
 *
 * @param moveResponseQuery the MoveResponseQuery to process
 * @return the Game state resulting from the query or false if for some reason
 * this fails.
 */
const performMoveResponseQuery = (
  moveResponseQuery: MoveResponseQuery
): Game | false => {
  // Convert the state within the query into a Game state, assuming the
  // Game is valid as specified in the xtree harness assumptions.
  const gameState: Game | Error = inputStateToGameState(
    moveResponseQuery.state
  );

  // Create a Movement from the from and to positions within the query.
  const movement: Movement = inputPositionsToMovement(
    moveResponseQuery.from,
    moveResponseQuery.to
  );

  // The movement is assumed to be valid.
  if (isError(gameState)) {
    return false;
  } else {
    return movePenguin(
      gameState,
      getCurrentPlayer(gameState),
      movement.startPosition,
      movement.endPosition
    ) as Game;
  }
};

/**
 * Convert the given Movement into an Action.
 *
 * @param movement the Movement to convert
 * @return the converted Action
 */
const movementToAction = (movement: Movement): Action => [
  boardPositionToInputPosition(movement.startPosition),
  boardPositionToInputPosition(movement.endPosition),
];

export {
  inputStateToGameState,
  gameToInputState,
  performMoveResponseQuery,
  inputPositionToBoardPosition,
  movementToAction,
};
