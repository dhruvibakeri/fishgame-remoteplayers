import { Board, BoardPosition, Tile } from "../types/board";
import {
  addHolesToBoard,
  createBlankBoard,
  createHoledOneFishBoard,
  createNumberedBoard,
  createTile,
  getTileOnBoard,
  setTileOnBoard,
  setTileToHole,
} from "../src/boardCreation";
import {
  InvalidBoardConstraintsError,
  InvalidPositionError,
} from "../types/errors";

describe("boardCreation", () => {
  const invalidPosition: BoardPosition = { row: 2, col: 2 };
  const invalidHolePositions: Array<BoardPosition> = [invalidPosition];
  const tile: Tile = { numOfFish: 1 };
  const tile3Fish: Tile = { numOfFish: 3 };
  const tile5Fish: Tile = { numOfFish: 5 };
  const tiles: Array<Array<Tile>> = [
    [tile, tile],
    [tile, tile],
  ];
  const board: Board = { tiles };
  const hole: Tile = { numOfFish: 0 };
  const hole0Fish: Tile = { numOfFish: 0 };
  const tilesWithHole: Array<Array<Tile>> = [
    [tile, tile],
    [hole, tile],
  ];
  const boardWithHole: Board = { tiles: tilesWithHole };
  const validPosition: BoardPosition = { row: 1, col: 0 };
  const validHolePositions: Array<BoardPosition> = [validPosition];
  const tileArray: number[][] = [[1,5,1],[5,1,5]];
  const numberedBoard: Board = { tiles: [[tile, tile5Fish, tile],[tile5Fish, tile, tile5Fish]]};
  const tileArrayWithHoles: number[][] = [[3,0,5],[3,5,1],[1,0,1]];
  const numberedBoardWithHoles: Board = { tiles: [[tile3Fish, hole0Fish, tile5Fish],[tile3Fish, tile5Fish, tile], [tile, hole0Fish, tile]]};

  describe("createHoledOneFishBoard", () => {
    it("rejects invalid dimensions", () => {
      expect(createHoledOneFishBoard(-1, -3, [], 1)).toEqual(
        new InvalidBoardConstraintsError(-1, 0)
      );
    });

    it("rejects invalid hole positions", () => {
      expect(createHoledOneFishBoard(2, 2, invalidHolePositions, 1)).toEqual(
        new InvalidPositionError(board, invalidHolePositions[0])
      );
    });

    it("rejects a number of tiles after adding holes that is lower than the minimum one fish tiles", () => {
      expect(createHoledOneFishBoard(2, 2, validHolePositions, 4)).toEqual(
        new InvalidBoardConstraintsError(2, 2, validHolePositions.length, 4)
      );
    });

    it("rejects a negative number of minimum 1-fish tiles", () => {
      expect(createHoledOneFishBoard(2, 2, validHolePositions, -1)).toEqual(
        new InvalidBoardConstraintsError(2, 2, validHolePositions.length, -1)
      );
    });

    it("creates a holed 1-fish board with valid arguments", () => {
      const expectedBoard: Board = boardWithHole;
      expect(createHoledOneFishBoard(2, 2, validHolePositions, 1)).toEqual(
        expectedBoard
      );
    });
  });

  describe("createBlankBoard", () => {
    it("rejects invalid dimensions", () => {
      expect(createBlankBoard(0, 0, 1)).toEqual(
        new InvalidBoardConstraintsError(0, 0)
      );
    });

    it("creates a blank board with valid dimensions", () => {
      expect(createBlankBoard(2, 2, 1)).toEqual(board);
    });
  });

  describe("createTile", () => {
    it("creates a tile without a hole", () => {
      expect(createTile(1)).toEqual(tile);
    });

    it("creates a tile with a hole", () => {
      expect(createTile(0)).toEqual({ numOfFish: 0 });
    });

    it("defaults to creating a tile without a hole", () => {
      expect(createTile(1)).toEqual(tile);
    });
  });

  describe("addHolesToBoard", () => {
    it("rejects a hole position not on the board", () => {
      expect(addHolesToBoard(board, invalidHolePositions)).toEqual(
        new InvalidPositionError(board, invalidHolePositions[0])
      );
    });

    it("adds holes to a given board", () => {
      expect(addHolesToBoard(board, validHolePositions)).toEqual({
        tiles: tilesWithHole,
      });
    });
  });

  describe("setTileToHole", () => {
    it("rejects an invalid tile position", () => {
      expect(setTileToHole(board, invalidPosition)).toEqual(
        new InvalidPositionError(board, invalidPosition)
      );
    });

    it("sets the tile at the given position on the board to a hole", () => {
      expect(setTileToHole(board, validPosition)).toEqual({
        tiles: tilesWithHole,
      });
    });
  });

  describe("setTileOnBoard", () => {
    it("rejects an invalid tile position", () => {
      expect(setTileOnBoard(board, invalidPosition, 1)).toEqual(
        new InvalidPositionError(board, invalidPosition)
      );
    });

    it("changes a tile on the board to not a hole", () => {
      expect(setTileOnBoard(boardWithHole, validPosition, 1)).toEqual(
        board
      );
    });

    it("changes the number of fish on a tile", () => {
      const newTile: Tile = { numOfFish: 3 };
      const tiles: Array<Array<Tile>> = [
        [tile, tile],
        [newTile, tile],
      ];
      const newBoard: Board = { tiles };
      expect(setTileOnBoard(board, validPosition, 3)).toEqual(
        newBoard
      );
    });

    it("changes both a tile's hole state and number of fish", () => {
      const newTile: Tile = { numOfFish: 3 };
      const tiles: Array<Array<Tile>> = [
        [tile, tile],
        [newTile, tile],
      ];
      const newBoard: Board = { tiles };
      expect(setTileOnBoard(board, validPosition, 3)).toEqual(newBoard);
    });
  });

  describe("getTileOnBoard", () => {
    it("rejects an invalid tile position", () => {
      expect(getTileOnBoard(board, invalidPosition)).toEqual(
        new InvalidPositionError(board, invalidPosition)
      );
    });

    it("returns the tile at the requested position", () => {
      expect(getTileOnBoard(boardWithHole, validPosition)).toEqual(hole);
    });
  });

  describe("createNumberedBoard", () => {
    it("returns a board with specified fish on each tile", () => {
      expect(createNumberedBoard(tileArray)).toEqual(numberedBoard);
    });

    it("returns the tile at the requested position", () => {
      expect(createNumberedBoard(tileArrayWithHoles)).toEqual(numberedBoardWithHoles);
    });
  });
});