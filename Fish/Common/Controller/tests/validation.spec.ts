import {
  positionIsOnBoard,
  positionIsPlayable,
  isTile,
  isBoard,
  isValidBoardSize,
  isValidMinimumOneFishTiles,
} from "../src/validation";
import { createBlankBoard, setTileToHole } from "../src/boardCreation";
import { Board, BoardPosition, Tile } from "../types/board";

describe("validation", () => {
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
      const board: Board = createBlankBoard(3, 3, 1) as Board;
      expect(positionIsPlayable(board, position)).toEqual(false);
    });

    it("rejects a position that is a hole", () => {
      const position: BoardPosition = { row: 1, col: 1 };
      const board: Board = setTileToHole(
        createBlankBoard(3, 3, 1) as Board,
        position
      ) as Board;
      expect(positionIsPlayable(board, position)).toEqual(false);
    });

    it("accepts a position that is on the board and is not a hole", () => {
      const position: BoardPosition = { row: 2, col: 2 };
      const board: Board = createBlankBoard(3, 3, 1) as Board;
      expect(positionIsPlayable(board, position)).toEqual(true);
    });
  });

  describe("isTile", () => {
    it("rejects an Error", () => {
      const error: Error = new Error();
      expect(isTile(error)).toEqual(false);
    });

    it("accepts a Tile", () => {
      const tile: Tile = { numOfFish: 1 };
      expect(isTile(tile)).toEqual(true);
    });
  });

  describe("isBoard", () => {
    it("rejects an Error", () => {
      const error: Error = new Error();
      expect(isBoard(error)).toEqual(false);
    });

    it("accepts a Board", () => {
      const board: Board = createBlankBoard(3, 3, 1) as Board;
      expect(isBoard(board)).toEqual(true);
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

    it("accepts positve board sizez", () => {
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
});
