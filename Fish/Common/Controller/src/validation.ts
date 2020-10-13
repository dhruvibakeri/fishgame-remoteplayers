// Helper functions for validating logic
import { IllegalPenguinMoveError, InvalidGameStateError, InvalidPositionError } from "../types/errors";
import { Player } from "../types/state";
import { Game } from "../types/state";
import { Board, BoardPosition, Penguin, PenguinColor, Tile } from "../types/board";
import { getTileOnBoard } from "./boardCreation";
import { getReachablePositions } from "./movement";
import { start } from "repl";

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
const positionIsPlayable = (board: Board, position: BoardPosition): boolean =>
  positionIsOnBoard(board, position) &&
  board.tiles[position.row][position.col].numOfFish > 0;

/**
 * Typeguard for checking whether a given tile or error is a tile.
 *
 * @param tileOrError the given tile or error
 * @return whether the input is a tile
 */
const isTile = (tileOrError: Tile | Error): tileOrError is Tile => {
  const tile: Tile = tileOrError as Tile;
  return tile.numOfFish !== undefined;
};

/**
 * Typeguard for checking whether a given board or error is a board.
 *
 * @param tileOrError the given tile or error
 * @return whether the input is a tile
 */
const isBoard = (boardOrError: Board | Error): boardOrError is Board => {
  const board: Board = boardOrError as Board;
  return board.tiles !== undefined && Array.isArray(board.tiles);
};

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
 * Determine if the given Player may move one of its Penguins on a starting
 * position to a given end position on the board of the given Game state.
 * 
 * @param game the Game state
 * @param player the Player moving its Penguin
 * @param startPosition the Player's Penguin's current position
 * @param endPosition the Player's Penguin's end position after the move
 * @return the Penguin being moved if the move is valid or an error if not
 */
const validatePenguinMove = (
  game: Game, 
  player: Player, 
  startPosition: BoardPosition, 
  endPosition: BoardPosition
): Penguin | IllegalPenguinMoveError | InvalidGameStateError | InvalidPositionError => {
    // Verify that the start and end positions are valid.
    if (!positionIsOnBoard(game.board, startPosition)) {
        return new InvalidPositionError(game.board, startPosition);
    } else if (!positionIsOnBoard(game.board, endPosition)) {
        return new InvalidPositionError(game.board, endPosition);
    }

    // Define relevant constants for validating a move.
    const maybePlayerColor: PenguinColor | undefined = game.playerToColorMapping.get(player);
    const maybePenguinAtStart: Penguin | undefined = game.penguinPositions.get(startPosition);
    const maybePenguinAtEnd: Penguin | undefined = game.penguinPositions.get(endPosition);
    const endTile: Tile = getTileOnBoard(game.board, endPosition) as Tile;

    // Determine if the move is valid based upon what entites are present at 
    // the start/end positions.
    const endTileIsReachableFromStart = getReachablePositions(game.board, startPosition).filter(
      (position: BoardPosition) => position.col === endPosition.col && position.row === endPosition.row).length > 0; // TODO make into helper
    const correctPenguinColor = maybePenguinAtStart !== undefined && maybePlayerColor === maybePenguinAtStart.color;
    const endPositionIsNotAHole = endTile.numOfFish > 0;
    const noPenguinOnEndPosition = maybePenguinAtEnd === undefined;
    const isValidMove = endTileIsReachableFromStart && correctPenguinColor && endPositionIsNotAHole && noPenguinOnEndPosition;

    // Return the penguin if there was no error and the move was valid, otherwise error.
    if (!maybePlayerColor) {
      return new InvalidGameStateError(game);
    } if (maybePenguinAtStart && isValidMove) {
      return maybePenguinAtStart;
    } else {
      return new IllegalPenguinMoveError(game, player, startPosition, endPosition);
    }
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

export {
  positionIsOnBoard,
  positionIsPlayable,
  isTile,
  isBoard,
  isValidBoardSize,
  isValidMinimumOneFishTiles,
  validatePenguinMove,
  isPenguin,
};
