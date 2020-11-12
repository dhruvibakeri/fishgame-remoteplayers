import {
  Board,
  BoardPosition,
  HorizontalDirection,
  VerticalDirection,
  PenguinColor,
} from "../../board";
import {
  createBlankBoard,
  createNumberedBoard,
  setTileToHole,
} from "../src/boardCreation";
import { Game, Player } from "../../state";
import {
  getNextPosDownLeft,
  getNextPosDownNeutral,
  getNextPosDownRight,
  getNextPosUpLeft,
  getNextPosUpNeutral,
  getNextPosUpRight,
  getReachablePositions,
  getNextPosition,
  getReachablePositionsInDirection,
  playerCanMove,
  anyPlayersCanMove,
} from "../src/movementChecking";
import { createGameState, shiftPlayers } from "../src/gameStateCreation";
import { placePenguin } from "../src/penguinPlacement";

describe("movementChecking", () => {
  const board: Board = createBlankBoard(4, 3, 1).unsafelyUnwrap();
  const center: BoardPosition = { row: 2, col: 1 };
  const up: BoardPosition = { row: 0, col: 1 };
  const upRight: BoardPosition = { row: 1, col: 1 };
  const upRight2: BoardPosition = { row: 0, col: 2 };
  const upLeft: BoardPosition = { row: 1, col: 0 };
  const upLeft2: BoardPosition = { row: 0, col: 0 };
  const down: BoardPosition = { row: 4, col: 1 };
  const downRight: BoardPosition = { row: 3, col: 1 };
  const downLeft: BoardPosition = { row: 3, col: 0 };
  const player1: Player = { name: "foo", color: PenguinColor.Black };
  const player2: Player = { name: "bar", color: PenguinColor.Brown };
  const player3: Player = { name: "baz", color: PenguinColor.Red };
  const players: Array<Player> = [player3, player2, player1];
  const game: Game = createGameState(players, board).unsafelyUnwrap();
  const player1TurnGame: Game = {
    ...game,
    players: shiftPlayers(shiftPlayers(players)),
  };

  describe("getNextPosDownLeft", () => {
    it("increments in the down left direction", () => {
      expect(getNextPosDownLeft(center)).toEqual(downLeft);
    });
  });

  describe("getNextPosDownRight", () => {
    it("increments in the down right direction", () => {
      expect(getNextPosDownRight(center)).toEqual(downRight);
    });
  });

  describe("getNextPosDownNeutral", () => {
    it("increments in the down direction", () => {
      expect(getNextPosDownNeutral(center)).toEqual(down);
    });
  });

  describe("getNextPosUpLeft", () => {
    it("increments in the up left direction", () => {
      expect(getNextPosUpLeft(center)).toEqual(upLeft);
    });
  });

  describe("getNextPosUpLeft", () => {
    it("increments in the up left direction", () => {
      expect(getNextPosUpLeft(center)).toEqual(upLeft);
    });
  });

  describe("getNextPosUpRight", () => {
    it("increments in the up right direction", () => {
      expect(getNextPosUpRight(center)).toEqual(upRight);
    });
  });

  describe("getNextPosUpNeutral", () => {
    it("increments in the up direction", () => {
      expect(getNextPosUpNeutral(center)).toEqual(up);
    });
  });

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

  describe("getReachablePositionsInDirection", () => {
    const start: BoardPosition = { row: 3, col: 0 };

    it("gets reachable positions in a direction until hitting the board boundaries", () => {
      const expectedReachablePositions: Set<BoardPosition> = new Set([
        center,
        upRight,
        upRight2,
      ]);

      expect(
        new Set(
          getReachablePositionsInDirection(
            game,
            start,
            VerticalDirection.Up,
            HorizontalDirection.Right
          )
        )
      ).toEqual(expectedReachablePositions);
    });

    it("gets reachable positions in a direction until hitting a hole", () => {
      const boardWithHole: Board = setTileToHole(board, {
        row: 1,
        col: 1,
      }).unsafelyUnwrap();
      const expectedReachablePositions: Array<BoardPosition> = [center];
      const gameWithHole = createGameState(
        players,
        boardWithHole
      ).unsafelyUnwrap();
      expect(
        getReachablePositionsInDirection(
          gameWithHole,
          start,
          VerticalDirection.Up,
          HorizontalDirection.Right
        )
      ).toEqual(expectedReachablePositions);
    });
  });

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

      expect(new Set(getReachablePositions(game, center))).toEqual(
        expectedReachablePositions
      );
    });
  });

  describe("playerCanMove", () => {
    it("returns false if no players have placed penguins", () => {
      expect(playerCanMove(player1, game)).toEqual(false);
    });

    it("returns false if player has not placed any penguins", () => {
      const gameWithPenguinPlaced = placePenguin(
        player1,
        player1TurnGame,
        center
      ).unsafelyUnwrap();
      expect(playerCanMove(player2, gameWithPenguinPlaced)).toEqual(false);
    });

    it("returns false if penguin is surrounded by holes", () => {
      const holeBoard: Board = createNumberedBoard([
        [0, 0, 0],
        [0, 0, 5],
        [0, 0, 0],
      ]).unsafelyUnwrap();
      const holeGame: Game = {
        ...game,
        players: shiftPlayers(shiftPlayers(players)),
        board: holeBoard,
      };
      const holeGameWithPenguinPlaced = placePenguin(player1, holeGame, {
        col: 2,
        row: 1,
      }).unsafelyUnwrap();
      expect(playerCanMove(player1, holeGameWithPenguinPlaced)).toEqual(false);
    });

    it("returns false if penguin is surrounded by holes and penguins", () => {
      const holeBoard: Board = createNumberedBoard([
        [0, 0, 1],
        [0, 0, 5],
        [0, 0, 0],
      ]).unsafelyUnwrap();
      const holeGame: Game = {
        ...game,
        players: shiftPlayers(shiftPlayers(players)),
        board: holeBoard,
      };
      const holeGameWithPenguinPlaced = {
        ...placePenguin(player1, holeGame, {
          col: 2,
          row: 1,
        }).unsafelyUnwrap(),
        curPlayerIndex: 1,
      };
      const holeGameWithPenguinsPlaced = placePenguin(
        player2,
        holeGameWithPenguinPlaced,
        { col: 2, row: 0 }
      ).unsafelyUnwrap();
      expect(playerCanMove(player1, holeGameWithPenguinsPlaced)).toEqual(false);
    });

    it("returns true if player has penguin placed and penguin has at least one possible move", () => {
      const gameWithPenguinPlaced = placePenguin(
        player1,
        player1TurnGame,
        center
      ).unsafelyUnwrap();
      expect(playerCanMove(player1, gameWithPenguinPlaced)).toEqual(true);
    });
  });

  describe("anyPlayersCanMove", () => {
    it("returns false if no players have placed penguins", () => {
      expect(anyPlayersCanMove(game)).toEqual(false);
    });

    it("returns false if penguin surrounded by holes", () => {
      const holeBoard: Board = createNumberedBoard([
        [0, 0, 0],
        [0, 0, 5],
        [0, 0, 0],
      ]).unsafelyUnwrap();
      const holeGame: Game = {
        ...game,
        players: shiftPlayers(players),
        board: holeBoard,
      };
      const holeGameWithPenguinPlaced = {
        ...placePenguin(player2, holeGame, {
          col: 2,
          row: 1,
        }).unsafelyUnwrap(),
        curPlayerIndex: 1,
      };
      expect(anyPlayersCanMove(holeGameWithPenguinPlaced)).toEqual(false);
    });

    it("returns false if penguin is surrounded by holes and penguins", () => {
      const holeBoard: Board = createNumberedBoard([
        [0, 0, 1],
        [0, 0, 5],
        [0, 0, 0],
      ]).unsafelyUnwrap();
      const holeGame: Game = {
        ...game,
        players: shiftPlayers(shiftPlayers(players)),
        board: holeBoard,
      };
      const holeGameWithPenguinPlaced = {
        ...placePenguin(player1, holeGame, {
          col: 2,
          row: 1,
        }).unsafelyUnwrap(),
        players: shiftPlayers(players),
      };
      const holeGameWithPenguinsPlaced = placePenguin(
        player2,
        holeGameWithPenguinPlaced,
        { col: 2, row: 0 }
      ).unsafelyUnwrap();
      expect(anyPlayersCanMove(holeGameWithPenguinsPlaced)).toEqual(false);
    });

    it("returns true if at least one player has penguin placed and penguin has at least one possible move", () => {
      const gameWithPenguinPlaced = placePenguin(
        player1,
        player1TurnGame,
        center
      ).unsafelyUnwrap();
      expect(anyPlayersCanMove(gameWithPenguinPlaced)).toEqual(true);
    });
  });
});
