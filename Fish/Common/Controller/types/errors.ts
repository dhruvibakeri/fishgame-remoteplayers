import { Board, BoardPosition } from "./board";
import { Game, Player } from "./state";

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

class InvalidNumberOfPlayersError extends Error {
  numOfPlayers: number;
  message: string;

  constructor(
    numOfPlayers: number, 
    message?: string
  ) {
    super();
    this.numOfPlayers = numOfPlayers
    if (message) {
      this.message = message;
    } else {
      this.message = "Invalid number of players specified for game.";
    }
    this.stack = new Error().stack;
  }
}

class IllegalPenguinMoveError extends Error {
  game: Game;
  player: Player;
  startPosition: BoardPosition;
  endPosition: BoardPosition;
  message: string;

  constructor(
    game: Game,
    player: Player,
    startPosition: BoardPosition,
    endPosition: BoardPosition,
    message?: string
  ) {
    super();
    this.game = game;
    this.player = player;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    if (message) {
      this.message = message;
    } else {
      this.message = "Illegal Penguin move made by player.";
    }
    this.stack = new Error().stack;
  }
}

class InvalidGameStateError extends Error {
  game: Game;
  message: string;

  constructor(
    game: Game,
    message?: string
  ) {
    super();
    this.game = game;
    if (message) {
      this.message = message;
    } else {
      this.message = "Invalid game state detected.";
    }
    this.stack = new Error().stack;
  }
}

export { 
  InvalidPositionError, 
  InvalidBoardConstraintsError, 
  InvalidNumberOfPlayersError,
  IllegalPenguinMoveError,
  InvalidGameStateError,
};
