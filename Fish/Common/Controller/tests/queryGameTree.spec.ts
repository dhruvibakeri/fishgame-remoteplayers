import { createHoledOneFishBoard, setTileToHole } from "../src/boardCreation";
import { createGameState, shiftPlayers } from "../src/gameStateCreation";
import { Board, BoardPosition, PenguinColor } from "../../board";
import { Game, Player } from "../../state";
import {
  checkMovementLegal,
  mapOverReachableStates,
} from "../src/queryGameTree";
import { GameTree, Movement, MovementToResultingTree } from "../../game-tree";
import { IllegalMovementError } from "../types/errors";
import { createGameTree } from "../src/gameTreeCreation";
import { placeAllPenguinsZigZag } from "../src/strategy";
import { Result } from "true-myth";
const { ok, err } = Result;

describe("queryGameTree", () => {
  const player1: Player = { name: "foo", color: PenguinColor.Black };
  const player2: Player = { name: "bar", color: PenguinColor.Brown };
  const players: Array<Player> = [player1, player2];
  const holePosition: BoardPosition = { col: 1, row: 0 };
  const holePositions: Array<BoardPosition> = [holePosition];
  const validStartPosition: BoardPosition = { col: 0, row: 0 };
  const validEndPosition: BoardPosition = { col: 0, row: 1 };
  const board: Board = createHoledOneFishBoard(
    2,
    2,
    holePositions,
    1
  ).unsafelyUnwrap();
  const placeableBoard: Board = createHoledOneFishBoard(
    4,
    4,
    holePositions,
    1
  ).unsafelyUnwrap();
  const penguinPositions: Map<PenguinColor, Array<BoardPosition>> = new Map([
    [player1.color, [validStartPosition]],
  ]);
  const game: Game = {
    ...createGameState(players, board).unsafelyUnwrap(),
    penguinPositions,
  };
  const twoPenguinPositions: Map<PenguinColor, Array<BoardPosition>> = new Map(
    penguinPositions
  );
  twoPenguinPositions.set(PenguinColor.White, [validEndPosition]);
  const scoresAfterMovement = new Map(game.scores);
  scoresAfterMovement.set(player1.color, 1);
  const placeableGame: Game = {
    ...createGameState(players, placeableBoard).unsafelyUnwrap(),
  };
  const allPlacedGame = placeAllPenguinsZigZag(placeableGame).unsafelyUnwrap();
  const allPlacedGameTree = createGameTree(allPlacedGame).unsafelyUnwrap();

  describe("isMovementLegal", () => {
    it("rejects a start position outside of the board", () => {
      const invalidStartPosition: BoardPosition = { col: 4, row: 4 };
      const movement: Movement = {
        startPosition: invalidStartPosition,
        endPosition: validEndPosition,
      };
      expect(checkMovementLegal(allPlacedGameTree, movement)).toEqual(
        err(
          new IllegalMovementError(
            allPlacedGame,
            player1,
            movement.startPosition,
            movement.endPosition,
            "Movement is not specified by the game tree."
          )
        )
      );
    });

    it("rejects an end position outside of the board", () => {
      const invalidEndPosition: BoardPosition = { col: 4, row: 4 };
      const movement: Movement = {
        startPosition: validStartPosition,
        endPosition: invalidEndPosition,
      };
      expect(checkMovementLegal(allPlacedGameTree, movement)).toEqual(
        err(
          new IllegalMovementError(
            allPlacedGame,
            player1,
            movement.startPosition,
            movement.endPosition,
            "Movement is not specified by the game tree."
          )
        )
      );
    });

    it("rejects a player trying to move from a starting position not containing one of their penguins", () => {
      const invalidStartPosition: BoardPosition = { col: 0, row: 1 };
      const movement: Movement = {
        startPosition: invalidStartPosition,
        endPosition: validEndPosition,
      };
      expect(checkMovementLegal(allPlacedGameTree, movement)).toEqual(
        err(
          new IllegalMovementError(
            allPlacedGame,
            player1,
            movement.startPosition,
            movement.endPosition,
            "Movement is not specified by the game tree."
          )
        )
      );
    });

    it("rejects a player trying to move to a position not reachable from the start", () => {
      const invalidEndPosition: BoardPosition = { col: 1, row: 1 };
      const movement: Movement = {
        startPosition: validStartPosition,
        endPosition: invalidEndPosition,
      };
      expect(checkMovementLegal(allPlacedGameTree, movement)).toEqual(
        err(
          new IllegalMovementError(
            allPlacedGame,
            player1,
            movement.startPosition,
            movement.endPosition,
            "Movement is not specified by the game tree."
          )
        )
      );
    });

    it("rejects a player trying to move to a hole", () => {
      const movement: Movement = {
        startPosition: { row: 1, col: 1 },
        endPosition: holePosition,
      };
      expect(checkMovementLegal(allPlacedGameTree, movement)).toEqual(
        err(
          new IllegalMovementError(
            allPlacedGame,
            player1,
            movement.startPosition,
            movement.endPosition,
            "Movement is not specified by the game tree."
          )
        )
      );
    });

    it("rejects a player trying to move to a position with another penguin present", () => {
      const movement: Movement = {
        startPosition: validStartPosition,
        endPosition: validEndPosition,
      };
      expect(checkMovementLegal(allPlacedGameTree, movement)).toEqual(
        err(
          new IllegalMovementError(
            allPlacedGame,
            player1,
            movement.startPosition,
            movement.endPosition,
            "Movement is not specified by the game tree."
          )
        )
      );
    });

    it("accepts a valid move", () => {
      const movement: Movement = {
        startPosition: { row: 0, col: 3 },
        endPosition: { row: 2, col: 3 },
      };
      const penguinsAfterMovement = new Map([
        [
          player1.color,
          [
            { row: 0, col: 0 },
            { row: 1, col: 1 },
            { row: 1, col: 3 },
            { row: 2, col: 3 },
          ],
        ],
        [
          player2.color,
          [
            { row: 0, col: 2 },
            { row: 1, col: 0 },
            { row: 1, col: 2 },
            { row: 2, col: 0 },
          ],
        ],
      ]);
      const scoresAfterMovement = new Map([
        [player1.color, 1],
        [player2.color, 0],
      ]);
      const boardAfterMovement = setTileToHole(placeableBoard, {
        row: 0,
        col: 3,
      }).unsafelyUnwrap();
      const gameAfterMovement = {
        ...allPlacedGame,
        penguinPositions: penguinsAfterMovement,
        scores: scoresAfterMovement,
        board: boardAfterMovement,
        players: shiftPlayers(players),
      };
      expect(checkMovementLegal(allPlacedGameTree, movement)).toEqual(
        ok(gameAfterMovement)
      );
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
    ).unsafelyUnwrap();
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
      ...createGameState(players, board).unsafelyUnwrap(),
      penguinPositions,
    };
    const boardAfterMovement: Board = setTileToHole(
      board,
      player1Position1
    ).unsafelyUnwrap();
    const gameAfterMovement1: Game = {
      ...game,
      players: shiftPlayers(players),
      penguinPositions: penguinPositionsAfterMovement1,
      scores: scoresAfterMovement,
      board: boardAfterMovement,
    };
    const gameAfterMovement2: Game = {
      ...game,
      players: shiftPlayers(players),
      penguinPositions: penguinPositionsAfterMovement2,
      scores: scoresAfterMovement,
      board: boardAfterMovement,
    };
    const gameTree = createGameTree(game);

    it("maps a function over reachable game states", () => {
      const jsonStringifyGame = (game: Game): string =>
        JSON.stringify(game) +
        JSON.stringify(Array.from(game.penguinPositions)) +
        JSON.stringify(Array.from(game.scores));

      const expected: Array<string> = [];
      allPlacedGameTree.potentialMoves.forEach(
        (MovementToResultingTree: MovementToResultingTree) => {
          const curTree = MovementToResultingTree.resultingGameTree();
          const stringified = jsonStringifyGame(curTree.gameState);
          expected.push(stringified);
        }
      );
      expect(
        mapOverReachableStates(allPlacedGameTree, jsonStringifyGame)
      ).toEqual(expected);
    });
  });
});
