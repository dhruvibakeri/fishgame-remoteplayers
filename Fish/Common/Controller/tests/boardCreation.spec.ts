import { Board, BoardPosition, Tile } from "../../board";
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
import { ok, err } from "true-myth/result";
import { IllegalBoardError, IllegalPositionError } from "../types/errors";

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
  const tiles25: Array<Array<Tile>> = [
    [tile, tile, tile, tile, tile],
    [tile, tile, tile, tile, tile],
    [tile, tile, tile, tile, tile],
    [tile, tile, tile, tile, tile],
    [tile, tile, tile, tile, tile],
  ];
  const board: Board = { tiles };
  const board25: Board = { tiles: tiles25 };
  const hole: Tile = { numOfFish: 0 };
  const hole0Fish: Tile = { numOfFish: 0 };
  const tilesWithHole: Array<Array<Tile>> = [
    [tile, tile],
    [hole, tile],
  ];
  const boardWithHole: Board = { tiles: tilesWithHole };
  const validPosition: BoardPosition = { row: 1, col: 0 };
  const validHolePositions: Array<BoardPosition> = [validPosition];
  const tileArray: number[][] = [
    [1, 5, 1],
    [5, 1, 5],
  ];
  const numberedBoard: Board = {
    tiles: [
      [tile, tile5Fish, tile],
      [tile5Fish, tile, tile5Fish],
    ],
  };
  const tileArrayWithHoles: number[][] = [
    [3, 0, 5],
    [3, 5, 1],
    [1, 0, 1],
  ];
  const numberedBoardWithHoles: Board = {
    tiles: [
      [tile3Fish, hole0Fish, tile5Fish],
      [tile3Fish, tile5Fish, tile],
      [tile, hole0Fish, tile],
    ],
  };
  const jaggedTileArray: number[][] = [
    [3, 0],
    [1, 1, 1, 1],
    [1, 5, 0],
  ];
  const paddedBoard: Board = {
    tiles: [
      [tile3Fish, hole, hole, hole],
      [tile, tile, tile, tile],
      [tile, tile5Fish, hole, hole],
    ],
  };

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

  describe("getTileOnBoard", () => {
    it("rejects an invalid tile position", () => {
      expect(getTileOnBoard(board, invalidPosition)).toEqual(
        err(new IllegalPositionError(board, invalidPosition))
      );
    });

    it("returns the tile at the requested position", () => {
      expect(getTileOnBoard(boardWithHole, validPosition)).toEqual(ok(hole));
    });
  });

  describe("setTileOnBoard", () => {
    it("rejects an invalid tile position", () => {
      expect(setTileOnBoard(board, invalidPosition, 1)).toEqual(
        err(new IllegalPositionError(board, invalidPosition))
      );
    });

    it("changes a tile on the board to not a hole", () => {
      expect(setTileOnBoard(boardWithHole, validPosition, 1)).toEqual(
        ok(board)
      );
    });

    it("changes the number of fish on a tile", () => {
      const newTile: Tile = { numOfFish: 3 };
      const tiles: Array<Array<Tile>> = [
        [tile, tile],
        [newTile, tile],
      ];
      const newBoard: Board = { tiles };
      expect(setTileOnBoard(board, validPosition, 3)).toEqual(ok(newBoard));
    });

    it("changes both a tile's hole state and number of fish", () => {
      const newTile: Tile = { numOfFish: 3 };
      const tiles: Array<Array<Tile>> = [
        [tile, tile],
        [newTile, tile],
      ];
      const newBoard: Board = { tiles };
      expect(setTileOnBoard(board, validPosition, 3)).toEqual(ok(newBoard));
    });
  });

  describe("setTileToHole", () => {
    it("rejects an invalid tile position", () => {
      expect(setTileToHole(board, invalidPosition)).toEqual(
        err(new IllegalPositionError(board, invalidPosition))
      );
    });

    it("sets the tile at the given position on the board to a hole", () => {
      expect(setTileToHole(board, validPosition)).toEqual(
        ok({
          tiles: tilesWithHole,
        })
      );
    });
  });

  describe("addHolesToBoard", () => {
    it("rejects a hole position not on the board", () => {
      expect(addHolesToBoard(board, invalidHolePositions)).toEqual(
        err(new IllegalPositionError(board, invalidHolePositions[0]))
      );
    });

    it("adds holes to a given board", () => {
      expect(addHolesToBoard(board, validHolePositions)).toEqual(
        ok({
          tiles: tilesWithHole,
        })
      );
    });
  });

  describe("createBlankBoard", () => {
    it("rejects invalid dimensions", () => {
      expect(createBlankBoard(0, 0, 1)).toEqual(
        err(new IllegalBoardError(0, 0))
      );
    });

    it("rejects board with more than 25 tiles", () => {
      expect(createBlankBoard(6, 5, 1)).toEqual(
        err(new IllegalBoardError(6, 5))
      );
    });

    it("creates a blank board with valid dimensions", () => {
      expect(createBlankBoard(2, 2, 1)).toEqual(ok(board));
      expect(createBlankBoard(5, 5, 1)).toEqual(ok(board25));
    });
  });

  describe("createHoledOneFishBoard", () => {
    it("rejects invalid dimensions", () => {
      expect(createHoledOneFishBoard(-1, -3, [], 1)).toEqual(
        err(new IllegalBoardError(-1, 0))
      );
    });

    it("rejects invalid hole positions", () => {
      expect(createHoledOneFishBoard(2, 2, invalidHolePositions, 1)).toEqual(
        err(new IllegalPositionError(board, invalidHolePositions[0]))
      );
    });

    it("rejects a number of tiles after adding holes that is lower than the minimum one fish tiles", () => {
      expect(createHoledOneFishBoard(2, 2, validHolePositions, 4)).toEqual(
        err(new IllegalBoardError(2, 2, validHolePositions.length, 4))
      );
    });

    it("rejects a negative number of minimum 1-fish tiles", () => {
      expect(createHoledOneFishBoard(2, 2, validHolePositions, -1)).toEqual(
        err(new IllegalBoardError(2, 2, validHolePositions.length, -1))
      );
    });

    it("creates a holed 1-fish board with valid arguments", () => {
      const expectedBoard: Board = boardWithHole;
      expect(createHoledOneFishBoard(2, 2, validHolePositions, 1)).toEqual(
        ok(expectedBoard)
      );
    });
  });

  describe("createNumberedBoard", () => {
    it("returns a board with specified fish on each tile", () => {
      expect(createNumberedBoard(tileArray)).toEqual(ok(numberedBoard));
    });

    it("rreturns a board with specified fish on each tile, including holes", () => {
      expect(createNumberedBoard(tileArrayWithHoles)).toEqual(
        ok(numberedBoardWithHoles)
      );
    });

    it("pads shorter rows with 0's to the maximum row length", () => {
      expect(createNumberedBoard(jaggedTileArray)).toEqual(ok(paddedBoard));
    });
  });
});
