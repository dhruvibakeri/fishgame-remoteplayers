import { Board, BoardPosition } from "../types/board";
import { createBlankBoard } from "../src/boardCreation";
import {
  getNextPosDownLeft,
  getNextPosDownNeutral,
  getNextPosDownRight,
  getNextPosUpLeft,
  getNextPosUpNeutral,
  getNextPosUpRight,
  getReachablePositions,
  VerticalDirection,
  HorizontalDirection,
  getNextPosition,
} from "../src/movement";

describe("movement", () => {
  const board: Board = createBlankBoard(4, 3, 1) as Board;
  const center: BoardPosition = { row: 2, col: 1 };
  const up: BoardPosition = { row: 0, col: 1 };
  const upRight: BoardPosition = { row: 1, col: 1 };
  const upRight2: BoardPosition = { row: 0, col: 2 };
  const upLeft: BoardPosition = { row: 1, col: 0 };
  const upLeft2: BoardPosition = { row: 0, col: 0 };
  const down: BoardPosition = { row: 4, col: 1 };
  const downRight: BoardPosition = { row: 3, col: 1 };
  const downLeft: BoardPosition = { row: 3, col: 0 };

  describe("getReachablePositions", () => {
    it("gets reachable positions in all directions", () => {
      const expectedReachablePositions: Set<BoardPosition> = new Set([
        upLeft2,
        upLeft,
        downLeft,
        up,
        upRight,
        upRight2,
        downRight,
      ]);
      /*
      expect(new Set(getReachablePositions(board, center))).toEqual(
        expectedReachablePositions
      );
      */
    });
  });

  describe("getReachablePositionsInDirection", () => {});

  describe("getNextPosition", () => {
    it("increments in the up direction", () => {
      expect(
        getNextPosition(
          center,
          VerticalDirection.Up,
          HorizontalDirection.Neutral
        )
      ).toEqual(up);
    });

    it("increments in the up right", () => {
      expect(
        getNextPosition(center, VerticalDirection.Up, HorizontalDirection.Right)
      ).toEqual(upRight);
    });

    it("increments in the up left", () => {
      expect(
        getNextPosition(center, VerticalDirection.Up, HorizontalDirection.Left)
      ).toEqual(upLeft);
    });

    it("increments in the down direction", () => {
      expect(
        getNextPosition(
          center,
          VerticalDirection.Down,
          HorizontalDirection.Neutral
        )
      ).toEqual(down);
    });

    it("increments in the down right direction", () => {
      expect(
        getNextPosition(
          center,
          VerticalDirection.Down,
          HorizontalDirection.Right
        )
      ).toEqual(downRight);
    });

    it("increments in the down left direction", () => {
      expect(
        getNextPosition(
          center,
          VerticalDirection.Down,
          HorizontalDirection.Left
        )
      ).toEqual(downLeft);
    });
  });

  describe("getNextPosUpNeutral", () => {
    it("increments in the up direction", () => {
      expect(getNextPosUpNeutral(center)).toEqual(up);
    });
  });

  describe("getNextPosUpRight", () => {
    it("increments in the up right direction", () => {
      expect(getNextPosUpRight(center)).toEqual(upRight);
    });
  });

  describe("getNextPosUpLeft", () => {
    it("increments in the up left direction", () => {
      expect(getNextPosUpLeft(center)).toEqual(upLeft);
    });
  });

  describe("getNextPosDownNeutral", () => {
    it("increments in the down direction", () => {
      expect(getNextPosDownNeutral(center)).toEqual(down);
    });
  });

  describe("getNextPosDownRight", () => {
    it("increments in the down right direction", () => {
      expect(getNextPosDownRight(center)).toEqual(downRight);
    });
  });

  describe("getNextPosDownLeft", () => {
    it("increments in the down left direction", () => {
      expect(getNextPosDownLeft(center)).toEqual(downLeft);
    });
  });
});
