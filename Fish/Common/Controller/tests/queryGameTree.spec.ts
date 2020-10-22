import { createHoledOneFishBoard, setTileToHole } from "../src/boardCreation";
import { createGameState } from "../src/gameStateCreation";
import { Board, BoardPosition, PenguinColor } from "../../board";
import { Game, Player } from "../../state";
import { isMovementLegal, mapOverReachableStates } from "../src/queryGameTree";
import { Movement } from "../../game-tree";
import { IllegalMovementError } from "../types/errors";

describe("queryGameTree", () => {
  const player1: Player = { name: "foo", color: PenguinColor.Black };
  const player2: Player = { name: "bar", color: PenguinColor.Brown };
  const players: Array<Player> = [player1, player2];
  const holePosition: BoardPosition = { col: 1, row: 0 };
  const holePositions: Array<BoardPosition> = [holePosition];
  const validStartPosition: BoardPosition = { col: 0, row: 0 };
  const validEndPosition: BoardPosition = { col: 0, row: 1 };
  const board: Board = createHoledOneFishBoard(2, 2, holePositions, 1) as Board;
  const penguinPositions: Map<PenguinColor, Array<BoardPosition>> = new Map([
    [player1.color, [validStartPosition]],
  ]);
  const game: Game = {
    ...(createGameState(players, board) as Game),
    penguinPositions,
  };
  const twoPenguinPositions: Map<PenguinColor, Array<BoardPosition>> = new Map(
    penguinPositions
  );
  twoPenguinPositions.set(PenguinColor.White, [validEndPosition]);
  const gameWithTwoPenguins: Game = {
    ...game,
    penguinPositions: twoPenguinPositions,
  };
  const movement: Movement = {
    startPosition: validStartPosition,
    endPosition: validEndPosition,
  };
  const penguinPositionsAfterMovement = new Map(penguinPositions);
  penguinPositionsAfterMovement.set(player1.color, [validEndPosition]);
  const scoresAfterMovement = new Map(game.scores);
  scoresAfterMovement.set(player1.color, 1);
  const boardAfterMovement = setTileToHole(board, validStartPosition) as Board;
  const gameAfterMovement: Game = {
    ...game,
    curPlayerIndex: 1,
    board: boardAfterMovement,
    scores: scoresAfterMovement,
    penguinPositions: penguinPositionsAfterMovement,
  };

  describe("isMovementLegal", () => {
    it("rejects a start position outside of the board", () => {
      const invalidStartPosition: BoardPosition = { col: 2, row: 2 };
      const movement: Movement = {
        startPosition: invalidStartPosition,
        endPosition: validEndPosition,
      };
      expect(isMovementLegal(game, movement)).toEqual(
        new IllegalMovementError(game, movement)
      );
    });

    it("rejects an end position outside of the board", () => {
      const invalidEndPosition: BoardPosition = { col: 3, row: 3 };
      const movement: Movement = {
        startPosition: validStartPosition,
        endPosition: invalidEndPosition,
      };
      expect(isMovementLegal(game, movement)).toEqual(
        new IllegalMovementError(game, movement)
      );
    });

    it("rejects a player trying to move from a starting position not containing one of their penguins", () => {
      const invalidStartPosition: BoardPosition = { col: 1, row: 1 };
      const movement: Movement = {
        startPosition: invalidStartPosition,
        endPosition: validEndPosition,
      };
      expect(isMovementLegal(game, movement)).toEqual(
        new IllegalMovementError(game, movement)
      );
    });

    it("rejects a player trying to move to a position not reachable from the start", () => {
      const invalidEndPosition: BoardPosition = { col: 1, row: 1 };
      const movement: Movement = {
        startPosition: validStartPosition,
        endPosition: invalidEndPosition,
      };
      expect(isMovementLegal(game, movement)).toEqual(
        new IllegalMovementError(game, movement)
      );
    });

    it("rejects a player trying to move to a hole", () => {
      const movement: Movement = {
        startPosition: validEndPosition,
        endPosition: holePosition,
      };
      expect(isMovementLegal(game, movement)).toEqual(
        new IllegalMovementError(game, movement)
      );
    });

    it("rejects a player trying to move to a position with another penguin present", () => {
      const movement: Movement = {
        startPosition: validStartPosition,
        endPosition: validEndPosition,
      };
      expect(isMovementLegal(gameWithTwoPenguins, movement)).toEqual(
        new IllegalMovementError(game, movement)
      );
    });

    it("accepts a valid move", () => {
      expect(isMovementLegal(game, movement)).toEqual(gameAfterMovement);
    });
  });

  describe("mapOverReachableStates", () => {
    const player1Position1: BoardPosition = { col: 1, row: 2 };
    const player2Position1: BoardPosition = { col: 0, row: 1 };
    const holePosition: BoardPosition = { col: 2, row: 0 };
    const board: Board = createHoledOneFishBoard(
      3,
      3,
      [holePosition],
      1
    ) as Board;
    const penguinPositions = new Map([
      [player1.color, [player1Position1]],
      [player2.color, [player2Position1]],
    ]);
    const penguinPositionsAfterMovement1 = new Map([
      [player1.color, [{ col: 1, row: 1 }]],
      [player2.color, [player2Position1]],
    ]);
    const penguinPositionsAfterMovement2 = new Map([
      [player1.color, [{ col: 1, row: 0 }]],
      [player2.color, [player2Position1]],
    ]);
    const game: Game = {
      ...(createGameState(players, board) as Game),
      penguinPositions,
    };
    const boardAfterMovement: Board = setTileToHole(
      board,
      player1Position1
    ) as Board;
    const gameAfterMovement1: Game = {
      ...game,
      curPlayerIndex: 1,
      penguinPositions: penguinPositionsAfterMovement1,
      scores: scoresAfterMovement,
      board: boardAfterMovement,
    };
    const gameAfterMovement2: Game = {
      ...game,
      curPlayerIndex: 1,
      penguinPositions: penguinPositionsAfterMovement2,
      scores: scoresAfterMovement,
      board: boardAfterMovement,
    };

    it("maps a function over reachable game states", () => {
      const jsonStringifyGame = (game: Game): string =>
        JSON.stringify(game) +
        JSON.stringify(Array.from(game.penguinPositions)) +
        JSON.stringify(Array.from(game.scores));

      const expected: Array<string> = [
        jsonStringifyGame(gameAfterMovement1),
        jsonStringifyGame(gameAfterMovement2),
      ];
      expect(mapOverReachableStates(game, jsonStringifyGame)).toEqual(expected);
    });
  });
});
