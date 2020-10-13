// Helper functions for validating logic
import { InvalidGameStateError, InvalidPositionError, IllegalPenguinPositionError, UnreachablePositionError } from "../types/errors";
import { Player } from "../types/state";
import { Game } from "../types/state";
import { Board, BoardPosition, Penguin, PenguinColor, Tile } from "../types/board";
import { getTileOnBoard } from "./boardCreation";
import { getReachablePositions } from "./movement";

/**
 * Given a board and a position, determine whether that position is within the
 * boundaries of the board.
 *
 * @param board the board to be checking against
 * @param position the position to be checked
 * @return whether the given position is on the board
 */
const positionIsOnBoard = (board: Board, position: BoardPosition): boolean => {
  const boardRows = board.tiles.length;
  const boardCols = board.tiles[0].length;

  const isValidRow = 0 <= position.row && position.row < boardRows;
  const isValidCol = 0 <= position.col && position.col < boardCols;

  return isValidRow && isValidCol;
};

/**
 * Given a board and a position, determine whether a penguin can be placed on
 * that position on the board.
 *
 * @param board the board to be checking against
 * @param position the position to be checked
 * @return whether the given position is playable on the board
 */
const positionIsPlayable = (game: Game, position: BoardPosition): boolean =>
  positionIsOnBoard(game.board, position) &&
  game.board.tiles[position.row][position.col].numOfFish > 0 &&
  game.penguinPositions.get(position) === undefined;

/**
 * Determine whether the given dimensions for a board are valid.
 *
 * @param columns the number of columns in the board
 * @param rows the number of rows in the board
 */
const isValidBoardSize = (columns: number, rows: number): boolean => {
  return columns > 0 && rows > 0;
};

/**
 * Determine whether the given minimum number of 1-fish tiles is valid relative
 * to the given board dimensions and hole positions.
 *
 * @param columns the number of columns for the created board
 * @param rows the number of rows for the created board
 * @param holePositions Positions for spaces without a tile
 * @param minimumOneFishTiles minimum number of one-fish tiles on the board
 */
const isValidMinimumOneFishTiles = (
  columns: number,
  rows: number,
  holePositions: Array<BoardPosition>,
  minimumOneFishTiles: number
): boolean => {
  // If upon creating the specified holes in the board, there are no longer
  // enough remaining tiles to meet the minimum number of 1-fish tiles,
  // return an error.
  const numberOfTilesAfterAddingHoles: number =
    rows * columns - holePositions.length;
  return (
    minimumOneFishTiles > 0 &&
    numberOfTilesAfterAddingHoles >= minimumOneFishTiles
  );
};

// TODO test
/**
 * Typeguard for checking whether the given parameter is an Error.
 * 
 * @param anything the input to check against
 */
const isError = (anything: any): anything is Error => {
  const error: Error = anything as Error;
  return error.message !== undefined && error.name !== undefined;
}

// TODO test
/**
 * Determine if the given Player may place a Penguin on the given position with
 * with the given Game state.
 * 
 * @param game the Game state
 * @param player the Player placing the Penguin
 * @param position the position of the placement
 */
const validatePenguinPlacement = (game: Game, player: Player, position: BoardPosition): BoardPosition | InvalidPositionError | IllegalPenguinPositionError => {
  if (!positionIsOnBoard(game.board, position)) {
    return new InvalidPositionError(game.board, position);
  }

  const maybeTile: Tile | InvalidPositionError = getTileOnBoard(game.board, position);
  const maybePenguinPosition: Penguin | undefined = game.penguinPositions.get(position);

  const isNotHole = !isError(maybeTile) && maybeTile.numOfFish > 0;
  const isFree = maybePenguinPosition === undefined;

  if (isNotHole && isFree) {
    return position;
  } else {
    return new IllegalPenguinPositionError(game, player, position);
  }
}

// TODO test
/**
 * Determine whether the given end position is reachable from the given start position on the given Board.
 * @param board 
 * @param startPosition 
 * @param endPosition 
 */
const positionIsReachable = (game: Game, startPosition: BoardPosition, endPosition: BoardPosition): boolean => {
  return getReachablePositions(game, startPosition).filter(
    (position: BoardPosition) => position.col === endPosition.col && position.row === endPosition.row).length > 0;
}

//TODO test
/**
 * Takes in a player and a game state, and checks if the player has at least one remaining
 * unplaced penguin in the given game state
 * 
 * @param player player to check for remaining unplaced penguins
 * @param game game state to check for remaining penguins for given player
 * @returns true if player has at least one unplaced penguin, returns false if they do not
 */
const playerHasUnplacedPenguin = (player: Player, game: Game): boolean => {
  const playerColor: PenguinColor = game.playerToColorMapping.get(player);
  const penguinIndex: number = game.unplacedPenguins.findIndex((penguin: Penguin) => { penguin.color === playerColor });
  return  penguinIndex !== -1;
}

// TODO test
/**
 * Typeguard for checking whether a given Penguin or Error is a Penguin.
 * 
 * @param penguinOrError the Penguin or Error to check
 * @return whether the given Penguin or Error is a Penguin
 */
const isPenguin = (penguinOrError: Penguin | Error): penguinOrError is Penguin => {
  const penguin: Penguin = penguinOrError as Penguin;
  return penguin.color !== undefined;
}

/**
 * Determine if the given Player may move one of its Penguins on a starting
 * position to a given end position on the board of the given Game state.
 * 
 * @param game the Game state
 * @param player the Player moving its Penguin
 * @param endPosition the Player's Penguin's end position after the move
 * @param startPosition the Player's Penguin's current position, not required if
 * penguin is being placed on the board before game starts
 * @return the Penguin being moved if the move is valid or an error if not
 */
const validatePenguinMove = (
  game: Game, 
  player: Player, 
  startPosition: BoardPosition,
  endPosition: BoardPosition
): Penguin | InvalidGameStateError | InvalidPositionError | IllegalPenguinPositionError => {
  // Verify that the start position is on the board.
  if (!positionIsOnBoard(game.board, startPosition)) {
      return new InvalidPositionError(game.board, startPosition);
  }

  // Verify that a Penguin can be placed on the given end position.
  const validatedEndPosition: BoardPosition | InvalidPositionError | IllegalPenguinPositionError = validatePenguinPlacement(game, player, endPosition);

  if (isError(validatedEndPosition)) {
    return validatedEndPosition;
  } else if (!positionIsReachable(game, startPosition, endPosition)) {
    return new UnreachablePositionError(game, player, startPosition, endPosition);
  }

  // Verify that the Player has a Penguin at the starting position.
  const maybePlayerColor: PenguinColor | undefined = game.playerToColorMapping.get(player);
  const maybePenguinAtStart: Penguin | undefined = game.penguinPositions.get(startPosition);

  if (maybePlayerColor === undefined) {
    return new InvalidGameStateError(game);
  }

  const playerHasPenguinAtStart = maybePenguinAtStart !== undefined && maybePlayerColor === maybePenguinAtStart.color;

  if (!playerHasPenguinAtStart) {
    return new IllegalPenguinPositionError(game, player, startPosition, endPosition);
  }

  return maybePenguinAtStart;
}

export {
  positionIsOnBoard,
  positionIsPlayable,
  isValidBoardSize,
  isValidMinimumOneFishTiles,
  validatePenguinPlacement,
  validatePenguinMove,
  playerHasUnplacedPenguin,
  isPenguin,
  isError
};
