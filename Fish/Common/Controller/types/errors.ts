import { BoardParameters } from "../src/referee";
import { Board, BoardPosition } from "../../board";
import { TournamentPlayer } from "../../player-interface";
import { Game, Player } from "../../state";

/**
 * Error used to represent invalid constraints used to specify a board.
 */
class IllegalBoardError extends Error {
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
 * Error used when trying to create a game tree from an invalid game state,
 * meaning a game state in which not all penguins have been placed.
 */
class IllegalGameTreeError extends Error {
  game: Game;
  message: string;

  constructor(game: Game, message?: string) {
    super();
    this.game = game;
    if (message) {
      this.message = message;
    } else {
      this.message =
        "Invalid game for tree generation. Not all penguins have been placed";
    }
    this.stack = new Error().stack;
  }
}

/**
 * Error to indicate invalid constraints for constructing a game state
 */
class IllegalGameStateError extends Error {
  players: Array<Player>;
  board: Board;

  constructor(players: Array<Player>, board: Board, message?: string) {
    super();
    this.players = players;
    this.board = board;
    if (message) {
      this.message = message;
    } else {
      this.message = "Invalid board and players for state";
    }
    this.stack = new Error().stack;
  }
}

/**
 * Error to indicate that a movement is not possible, whether that
 * has to do with acting out of turn, invalid coordinates, or simply not possible.
 */
class IllegalMovementError extends Error {
  game: Game;
  player: Player;
  position1: BoardPosition;
  position2: BoardPosition;
  message: string;

  constructor(
    game: Game,
    player: Player,
    position1: BoardPosition,
    position2: BoardPosition,
    message?: string
  ) {
    super();
    this.game = game;
    this.player = player;
    this.position1 = position1;
    this.position2 = position2;

    if (message) {
      this.message = message;
    } else {
      this.message =
        "Illegal movement specified by player for the current game state.";
    }
    this.stack = new Error().stack;
  }
}

/**
 * Error to indicate that a placement is not possible, whether that has
 * to do with acting out of turn, invalid coordinates, or simply not possible.
 */
class IllegalPlacementError extends Error {
  game: Game;
  player: Player;
  position: BoardPosition;
  message: string;

  constructor(
    game: Game,
    player: Player,
    position: BoardPosition,
    message?: string
  ) {
    super();
    this.game = game;
    this.player = player;
    this.position = position;
    if (message) {
      this.message = message;
    } else {
      this.message =
        "Illegal placement specified by player for the current game state.";
    }
    this.stack = new Error().stack;
  }
}
/**
 * Error to indicate an out-of-bounds position on a board.
 */
class IllegalPositionError extends Error {
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

class IllegalTournamentError extends Error {
  boardParameters: BoardParameters;
  tournamentPlayers: Array<TournamentPlayer>;
  message: string;

  constructor(
    boardParameters: BoardParameters,
    tournamentPlayers: Array<TournamentPlayer>,
    message?: string
  ) {
    super();
    if (message) {
      this.message = message;
    } else {
      this.message = "Invalid board parameters and tournament players for tournament."
    }
    this.boardParameters = boardParameters;
    this.tournamentPlayers = tournamentPlayers;
    this.stack = new Error().stack;
  }
}

class NotMovementGameError extends Error {
  game: Game;
  message: string;

  constructor(game: Game, message?: string) {
    super();
    this.game = game;
    if (message) {
      this.message = message;
    } else {
      this.message = "Not all penguins have been placed.";
    }
    this.stack = new Error().stack;
  }
}

export {
  IllegalGameStateError,
  IllegalBoardError,
  IllegalGameTreeError,
  IllegalMovementError,
  IllegalPlacementError,
  IllegalPositionError,
  NotMovementGameError,
  IllegalTournamentError
};
