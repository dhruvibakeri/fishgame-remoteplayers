import { Board, BoardPosition } from "../../board";
import { Game, Player } from "../../state";
import { Movement, GameTree } from "../../game-tree";

/**
 * Error used to represent the use of out-of-bounds positions for a given board.
 */
class InvalidPositionError extends Error {
  board: Board;
  position: BoardPosition;
  message: string;

  constructor(board: Board, position: BoardPosition, message?: string) {
    super();
    this.board = board;
    this.position = position;
    if (message) {
      this.message = message;
    } else {
      this.message = "Invalid position.";
    }
    this.stack = new Error().stack;
  }
}

/**
 * Error used to represent invalid constraints used to specify a board.
 */
class InvalidBoardConstraintsError extends Error {
  columns: number;
  rows: number;
  holes?: number;
  minimumTiles?: number;
  message: string;

  constructor(
    columns: number,
    rows: number,
    holes?: number,
    minimumTiles?: number,
    message?: string
  ) {
    super();
    this.columns = columns;
    this.rows = rows;
    if (holes) {
      this.holes = holes;
    }
    if (minimumTiles) {
      this.minimumTiles = minimumTiles;
    }
    if (message) {
      this.message = message;
    } else {
      this.message = "Board constraints are invalid.";
    }
    this.stack = new Error().stack;
  }
}

/**
 * Error used to represent an out-of-bounds number of players used to create a
 * game state, that is a number less than 2 or greater than 4.
 */
class InvalidNumberOfPlayersError extends Error {
  numOfPlayers: number;
  message: string;

  constructor(numOfPlayers: number, message?: string) {
    super();
    this.numOfPlayers = numOfPlayers;
    if (message) {
      this.message = message;
    } else {
      this.message = "Invalid number of players specified for game.";
    }
    this.stack = new Error().stack;
  }
}

/**
 * Error used to represent the placement or movement of an avatar to an illegal
 * position within a game state.
 */
class IllegalPenguinPositionError extends Error {
  game: Game;
  player: Player;
  position1: BoardPosition;
  position2?: BoardPosition;
  message: string;

  constructor(
    game: Game,
    player: Player,
    position1: BoardPosition,
    position2?: BoardPosition,
    message?: string
  ) {
    super();
    this.game = game;
    this.player = player;
    this.position1 = position1;
    if (position2) {
      this.position2 = position2;
    }
    if (message) {
      this.message = message;
    } else {
      this.message = "Illegal Penguin position specified by Player.";
    }
    this.stack = new Error().stack;
  }
}

/**
 * Error used to represent the movement of an avatar to an unreachable position.
 */
class UnreachablePositionError extends IllegalPenguinPositionError {
  constructor(
    game: Game,
    player: Player,
    startPosition: BoardPosition,
    endPosition: BoardPosition,
    message?: string
  ) {
    super(game, player, startPosition, endPosition, message);
  }
}

/**
 * Error used to represent an invalid existing game state.
 */
class InvalidGameStateError extends Error {
  game?: Game;
  message: string;

  constructor(game?: Game, message?: string) {
    super();
    if (game) {
      this.game = game;
    }
    if (message) {
      this.message = message;
    } else {
      this.message = "Invalid game state detected.";
    }
    this.stack = new Error().stack;
  }
}

/**
 * Error used to represent an invalid existing game state.
 */
class IllegalMovementError extends Error {
  gameTree: GameTree;
  movement: Movement;
  message: string;

  constructor(gameTree: GameTree, movement: Movement, message?: string) {
    super();
    this.gameTree = gameTree;
    this.movement = movement;
    if (message) {
      this.message = message;
    } else {
      this.message = `Illegal movement movement from (${movement.startPosition.col},${movement.startPosition.row}) to (${movement.endPosition.col},${movement.endPosition.row}).`;
    }
    this.stack = new Error().stack;
  }
}

/**
 * Error used to represent an invalid existing game state.
 */
class InvalidKeyError extends Error {
  key: string;
  value: string;
  message: string;

  constructor(key: string, value: string, message?: string) {
    super();
    this.key = key;
    this.value = value;
    if (message) {
      this.message = message;
    } else {
      this.message = `Invalid key string "${key}" for type ${value}`;
    }
    this.stack = new Error().stack;
  }
}

export {
  InvalidPositionError,
  InvalidBoardConstraintsError,
  InvalidNumberOfPlayersError,
  IllegalPenguinPositionError,
  UnreachablePositionError,
  InvalidGameStateError,
  IllegalMovementError,
  InvalidKeyError,
};
