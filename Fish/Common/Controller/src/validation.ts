// Helper functions for validating logic
import { IllegalPenguinMoveError, InvalidGameStateError } from "../types/errors";
import { Player } from "../types/state";
import { Game } from "../types/state";
import { Board, BoardPosition, Penguin, PenguinColor, Tile } from "../types/board";

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
 * Determine if the given Player may move one of its Penguins on a given
 * valid starting position to a given valid end position on the board of the
 * given Game state.
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
): Penguin | IllegalPenguinMoveError | InvalidGameStateError => {
    const maybePlayerColor: PenguinColor | undefined = game.playerToColorMapping.get(player);
    const maybePenguinAtStart: Penguin | undefined = game.penguinPositions.get(startPosition);
    const maybePenguinAtEnd: Penguin | undefined = game.penguinPositions.get(endPosition);

    const correctPenguinColor: boolean = maybePenguinAtStart !== undefined && maybePlayerColor === maybePenguinAtStart.color;
    const endPositionIsOpen: boolean = maybePenguinAtEnd === undefined;
    const isValidMove: boolean = correctPenguinColor && endPositionIsOpen;

    if (!maybePlayerColor) {
      return new InvalidGameStateError(game, "Incomplete player to penguin color mapping.");
    } if (maybePenguinAtStart && isValidMove) {
      return maybePenguinAtStart;
    } else {
      return new IllegalPenguinMoveError(game, player, startPosition, endPosition);
    }
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

export {
  positionIsOnBoard,
  positionIsPlayable,
  isTile,
  isBoard,
  isValidBoardSize,
  isValidMinimumOneFishTiles,
  validatePenguinMove,
  playerHasUnplacedPenguin,
  isPenguin,
};
