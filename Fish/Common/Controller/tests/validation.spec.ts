import {
  positionIsOnBoard,
  positionIsPlayable,
  isValidBoardSize,
  isValidMinimumOneFishTiles,
  pathIsPlayable,
  validatePenguinMove,
  playerHasUnplacedPenguin,
  isError,
} from "../src/validation";
import { createBlankBoard, createHoledOneFishBoard, setTileToHole } from "../src/boardCreation";
import { Board, BoardPosition, Penguin, PenguinColor } from "../types/board";
import { Game, Player } from "../types/state";
import { createGameState } from "../src/gameStateCreation";
import { IllegalPenguinPositionError, UnreachablePositionError, InvalidGameStateError, InvalidNumberOfPlayersError, InvalidPositionError } from "../types/errors";

describe("validation", () => {
  const player1: Player = { name: "foo", age: 20 };
  const player2: Player = { name: "bar", age: 30 };
  const player3: Player = { name: "baz", age: 42 };
  const players: Array<Player> = [player1, player2];
  const playerToColorMapping: Map<Player, PenguinColor> = new Map([
    [player1, PenguinColor.Black], 
    [player2, PenguinColor.Brown],
  ]);
  const holePosition: BoardPosition = { col: 1, row: 0 };
  const holePositions: Array<BoardPosition> = [holePosition];
  const validStartPosition: BoardPosition = { col: 0, row: 0 };
  const validEndPosition: BoardPosition = { col: 0, row: 1 };
  const board: Board = createHoledOneFishBoard(2, 2, holePositions, 1) as Board;
  const player1Penguin: Penguin = { color: PenguinColor.Black };
  const penguinPositions: Map<BoardPosition, Penguin> = new Map([[validStartPosition, player1Penguin]]);
  const game: Game = {
    ...createGameState(players, playerToColorMapping, board) as Game,
    penguinPositions,
  };
  const twoPenguinPositions: Map<BoardPosition, Penguin> = new Map(penguinPositions);
  twoPenguinPositions.set(validEndPosition, { color: PenguinColor.White });
  const gameWithTwoPenguins: Game = {
    ...game,
    penguinPositions: twoPenguinPositions,
  };

  describe("positionIsOnBoard", () => {
    const testPositionIsOnBoard = (
      numRows: number,
      numCols: number,
      rowPos: number,
      colPos: number
    ): boolean => {
      const position: BoardPosition = { row: rowPos, col: colPos };
      const board: Board = createBlankBoard(numRows, numCols, 1) as Board;
      return positionIsOnBoard(board, position);
    };

    it("rejects a position 1 past the x bound", () => {
      expect(testPositionIsOnBoard(3, 3, 2, 3)).toEqual(false);
    });

    it("rejects a position 1 past the y bound", () => {
      expect(testPositionIsOnBoard(3, 3, 3, 2)).toEqual(false);
    });

    it("rejects a position 1 past the x and y bounds", () => {
      expect(testPositionIsOnBoard(3, 3, 3, 3)).toEqual(false);
    });

    it("rejects a position far past the x bound", () => {
      expect(testPositionIsOnBoard(3, 3, 2, 10)).toEqual(false);
    });

    it("rejects a position far past the y bound", () => {
      expect(testPositionIsOnBoard(3, 3, 20, 1)).toEqual(false);
    });

    it("rejects a position far past the x and y bounds", () => {
      expect(testPositionIsOnBoard(3, 3, 42, 12)).toEqual(false);
    });

    it("accepts a position within the bounds", () => {
      expect(testPositionIsOnBoard(3, 3, 1, 0)).toEqual(true);
    });

    it("accepts a position within the bounds which is a hole", () => {
      const position: BoardPosition = { row: 2, col: 1 };
      const board: Board = setTileToHole(
        createBlankBoard(3, 3, 1) as Board,
        position
      ) as Board;

      expect(positionIsOnBoard(board, position)).toEqual(true);
    });

    it("accepts a position at the x bound", () => {
      expect(testPositionIsOnBoard(3, 3, 1, 2)).toEqual(true);
    });

    it("accepts a position at the y bound", () => {
      expect(testPositionIsOnBoard(3, 3, 2, 1)).toEqual(true);
    });

    it("accepts a position at the x and y bounds", () => {
      expect(testPositionIsOnBoard(3, 3, 2, 2)).toEqual(true);
    });
  });

  describe("positionIsPlayable", () => {
    it("rejects a position not on the board", () => {
      const position: BoardPosition = { row: 3, col: 3 };
      expect(positionIsPlayable(game, position)).toEqual(false);
    });

    it("rejects a position that is a hole", () => {
      expect(positionIsPlayable(game, holePosition)).toEqual(false);
    });

    it("rejects a position that has a penguin already on it", () => {
      expect(positionIsPlayable(game, validStartPosition)).toEqual(false);
    })

    it("accepts a position that is on the board and is not a hole", () => {
      expect(positionIsPlayable(game, validEndPosition)).toEqual(true);
    });
  });

  describe("isValidBoardSize", () => {
    it("rejects a column amount of 0", () => {
      expect(isValidBoardSize(0, 1)).toEqual(false);
    });

    it("rejects a row amount of 0", () => {
      expect(isValidBoardSize(1, 0)).toEqual(false);
    });

    it("rejects a negative column amount", () => {
      expect(isValidBoardSize(-2, 3)).toEqual(false);
    });

    it("rejects a negative row amount", () => {
      expect(isValidBoardSize(2, -4)).toEqual(false);
    });

    it("accepts positve board size", () => {
      expect(isValidBoardSize(3, 3)).toEqual(true);
    });
  });

  describe("isValidMinimumOneFishTiles", () => {
    const holePositions: Array<BoardPosition> = [{ row: 3, col: 3 }];

    it("rejects a number of tiles after adding holes that is lower than the minimum one fish tiles", () => {
      expect(isValidMinimumOneFishTiles(3, 3, holePositions, 9)).toEqual(false);
    });

    it("rejects a greater minimum number of 1-fish tiles than total board tiles", () => {
      expect(isValidMinimumOneFishTiles(3, 3, [], 10)).toEqual(false);
    });

    it("rejects a negative number of minimum 1-fish tiles", () => {
      expect(isValidMinimumOneFishTiles(3, 3, [], -2)).toEqual(false);
    });

    it("accepts a minimum number of 1-fish tiles which can be added to the given board dimensions after adding the given holes", () => {
      expect(isValidMinimumOneFishTiles(3, 3, holePositions, 3));
    });
  });

  describe("isError", () => {
    it("rejects something that is not an Error", () => {
      expect(isError(3)).toEqual(false);
    });

    it("accepts an Error", () => {
      expect(isError(new InvalidNumberOfPlayersError(3))).toEqual(true);
    });
  });

  describe("pathIsPlayable", () => {
    it("rejects the same start and end position", () => {
      expect(pathIsPlayable(game, validStartPosition, validStartPosition)).toEqual(false);
    });

    it("rejects an unreachable position", () => {
      expect(pathIsPlayable(game, validStartPosition, holePosition)).toEqual(false);
    });

    it("rejects a start position that is not on the board", () => {
      expect(pathIsPlayable(game, { row: 7, col: 8 }, validEndPosition)).toEqual(false);
    });

    it("rejects an end position that is not on the board", () => {
      expect(pathIsPlayable(game, validStartPosition, { row: 7, col: 8 })).toEqual(false);
    });

    it("rejects an end position that already has a penguin", () => {
      expect(pathIsPlayable(game, validEndPosition, validStartPosition)).toEqual(false);
    });

    it("accepts a playable path", () => {
      expect(pathIsPlayable(game, validStartPosition, validEndPosition)).toEqual(true);
    });
  });

  describe("playerHasUnplacedPenguin", () => {
    const noUnplacedPenguins: Map<Player, number> = new Map([[player1, 0], [player2, 0]]);
    const noUnplacedPenguinsGame: Game = {
      ...game,
      remainingUnplacedPenguins: noUnplacedPenguins,
    };

    it("returns false when player does not have any penguins", () => {
      expect(playerHasUnplacedPenguin(player1, noUnplacedPenguinsGame)).toEqual(false);
      expect(playerHasUnplacedPenguin(player2, noUnplacedPenguinsGame)).toEqual(false);
    });

    it("returns false when given player not in game", () => {
      expect(playerHasUnplacedPenguin(player3, noUnplacedPenguinsGame)).toEqual(false);
      expect(playerHasUnplacedPenguin(player3, game)).toEqual(false);
    });

    it("returns true when player has unplaced penguins", () => {
      expect(playerHasUnplacedPenguin(player1, game)).toEqual(true);
      expect(playerHasUnplacedPenguin(player2, game)).toEqual(true);
    });
  })

  describe("validatePenguinMove", () => {
    it("rejects a start position outside of the board", () => {
      const invalidStartPosition: BoardPosition = { col: 2, row: 2 };
      const expectedError = new IllegalPenguinPositionError(game, player1, invalidStartPosition, validEndPosition);
      expect(validatePenguinMove(game, player1, invalidStartPosition, validEndPosition)).toEqual(expectedError);
    });

    it("rejects an end position outside of the board", () => {
      const invalidEndPosition: BoardPosition = { col: 3, row: 3 };
      const expectedError = new IllegalPenguinPositionError(game, player1, validStartPosition, invalidEndPosition);
      expect(validatePenguinMove(game, player1, validStartPosition, invalidEndPosition)).toEqual(expectedError);
    });

    it("rejects a player with no color mapping to a penguin", () => {
      const expectedError = new InvalidGameStateError(game);
      expect(validatePenguinMove(game, player3, validStartPosition, validEndPosition)).toEqual(expectedError);
    });

    it("rejects a player trying to move from a starting position not containing one of their penguins", () => {
      const invalidStartPosition: BoardPosition = { col: 1, row: 1 };
      const expectedError = new IllegalPenguinPositionError(game, player1, invalidStartPosition, validEndPosition);
      expect(validatePenguinMove(game, player1, invalidStartPosition, validEndPosition)).toEqual(expectedError);
    });

    it("rejects a player trying to move to a position not reachable from the start", () => {
      const invalidEndPosition: BoardPosition = { col: 1, row: 1 };
      const expectedError = new UnreachablePositionError(game, player1, validStartPosition, invalidEndPosition);
      expect(validatePenguinMove(game, player1, validStartPosition, invalidEndPosition)).toEqual(expectedError);
    });

    it("rejects a player trying to move to a hole", () => {
      const expectedError = new IllegalPenguinPositionError(game, player1, validEndPosition, holePosition);
      expect(validatePenguinMove(game, player1, validEndPosition, holePosition)).toEqual(expectedError);
    });

    it("rejects a player trying to move to a position with another penguin present", () => {
      const expectedError = new IllegalPenguinPositionError(game, player1, validStartPosition, validEndPosition);
      expect(validatePenguinMove(gameWithTwoPenguins, player1, validStartPosition, validEndPosition)).toEqual(expectedError);
    });

    it("accepts a valid move", () => {
      expect(validatePenguinMove(game, player1, validStartPosition, validEndPosition)).toEqual(player1Penguin);
    });
  });
});
