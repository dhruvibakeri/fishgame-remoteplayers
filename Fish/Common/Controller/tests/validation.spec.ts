import {
  positionIsOnBoard,
  positionIsPlayable,
  isTile,
  isBoard,
} from "../src/validation";
import { createBlankBoard, setTileToHole } from "../src/boardCreation";
import { Board, BoardPosition, Tile } from "../types/board";

describe("positionIsOnBoard", () => {
  const testPositionIsOnBoard = (
    numRows: number,
    numCols: number,
    rowPos: number,
    colPos: number
  ): boolean => {
    const position: BoardPosition = { row: rowPos, col: colPos };
    const board: Board = createBlankBoard(numRows, numCols, 1);
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
      createBlankBoard(3, 3, 1),
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
    const board: Board = createBlankBoard(3, 3, 1);
    expect(positionIsPlayable(board, position)).toEqual(false);
  });

  it("rejects a position that is a hole", () => {
    const position: BoardPosition = { row: 1, col: 1 };
    const board: Board = setTileToHole(
      createBlankBoard(3, 3, 1),
      position
    ) as Board;
    expect(positionIsPlayable(board, position)).toEqual(false);
  });

  it("accepts a position that is on the board and is not a hole", () => {
    const position: BoardPosition = { row: 2, col: 2 };
    const board: Board = createBlankBoard(3, 3, 1);
    expect(positionIsPlayable(board, position)).toEqual(true);
  });
});

describe("isTile", () => {
  it("rejects an Error", () => {
    const error: Error = new Error();
    expect(isTile(error)).toEqual(false);
  });

  it("accepts a Tile", () => {
    const tile: Tile = { isHole: false, numOfFish: 1 };
    expect(isTile(tile)).toEqual(true);
  });
});

describe("isBoard", () => {
  it("rejects an Error", () => {
    const error: Error = new Error();
    expect(isBoard(error)).toEqual(false);
  });

  it("accepts a Board", () => {
    const board: Board = createBlankBoard(3, 3, 1);
    expect(isBoard(board)).toEqual(true);
  });
});
