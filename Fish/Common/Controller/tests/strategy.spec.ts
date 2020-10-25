import { createGameState } from "../src/gameStateCreation";
import { Game, Player } from "../../state";
import { Board, BoardPosition, PenguinColor } from "../../board";
import { createBlankBoard, setTileToHole } from "../src/boardCreation";
import {
  getNextPenguinPlacementPosition,
  placeAllPenguinsZigZag,
  placeNextPenguin,
  chooseNextAction,
} from "../../../Player/strategy";
import { NoMorePlacementsError } from "../types/errors";

describe("strategy", () => {
  const player1: Player = {
    name: "foo",
    color: PenguinColor.Black,
  };
  const player2: Player = {
    name: "bar",
    color: PenguinColor.Brown,
  };
  const players: Array<Player> = [player1, player2];
  const holePosition: BoardPosition = { col: 1, row: 0 };
  const board: Board = createBlankBoard(3, 3, 1) as Board;
  const smallBoard: Board = createBlankBoard(2, 3, 1) as Board;
  const boardWithHole: Board = setTileToHole(board, holePosition) as Board;
  const game: Game = createGameState(players, board) as Game;
  const gameWithHole: Game = createGameState(players, boardWithHole) as Game;
  const smallGame: Game = createGameState(players, smallBoard) as Game;

  const placement1Position: BoardPosition = { col: 0, row: 0 };
  const penguinPositionsAfterPlacement1: Map<
    PenguinColor,
    Array<BoardPosition>
  > = new Map([
    [player1.color, [placement1Position]],
    [player2.color, []],
  ]);
  const remainingUnplacedPenguinsAfterPlacement1: Map<
    PenguinColor,
    number
  > = new Map([
    [player1.color, 3],
    [player2.color, 4],
  ]);
  const scoresAfterPlacement1: Map<PenguinColor, number> = new Map([
    [player1.color, 1],
    [player2.color, 0],
  ]);
  const gameAfterPlacement1 = {
    ...game,
    curPlayerIndex: 1,
    penguinPositions: penguinPositionsAfterPlacement1,
    remainingUnplacedPenguins: remainingUnplacedPenguinsAfterPlacement1,
    scores: scoresAfterPlacement1,
  };

  const placement2Position: BoardPosition = { col: 1, row: 0 };
  const penguinPositionsAfterPlacement2: Map<
    PenguinColor,
    Array<BoardPosition>
  > = new Map([
    [player1.color, [placement1Position]],
    [player2.color, [placement2Position]],
  ]);
  const remainingUnplacedPenguinsAfterPlacement2: Map<
    PenguinColor,
    number
  > = new Map([
    [player1.color, 3],
    [player2.color, 3],
  ]);
  const scoresAfterPlacement2: Map<PenguinColor, number> = new Map([
    [player1.color, 1],
    [player2.color, 1],
  ]);
  const gameAfterPlacement2: Game = {
    ...gameAfterPlacement1,
    curPlayerIndex: 0,
    penguinPositions: penguinPositionsAfterPlacement2,
    remainingUnplacedPenguins: remainingUnplacedPenguinsAfterPlacement2,
    scores: scoresAfterPlacement2,
  };

  const gameAfterPlacement1WithHole: Game = {
    ...gameWithHole,
    curPlayerIndex: 1,
    penguinPositions: penguinPositionsAfterPlacement1,
    remainingUnplacedPenguins: remainingUnplacedPenguinsAfterPlacement1,
    scores: scoresAfterPlacement1,
  };

  const placement2PositionWithHole: BoardPosition = { col: 2, row: 0 };
  const penguinPositionsAfterPlacement2WithHole: Map<
    PenguinColor,
    Array<BoardPosition>
  > = new Map([
    [player1.color, [placement1Position]],
    [player2.color, [placement2PositionWithHole]],
  ]);
  const gameAfterPlacement2WithHole: Game = {
    ...gameAfterPlacement1WithHole,
    curPlayerIndex: 0,
    penguinPositions: penguinPositionsAfterPlacement2WithHole,
    remainingUnplacedPenguins: remainingUnplacedPenguinsAfterPlacement2,
    scores: scoresAfterPlacement2,
  };

  const placement3PositionWithHole: BoardPosition = { col: 0, row: 1 };
  const penguinPositionsAfterPlacement3WithHole: Map<
    PenguinColor,
    Array<BoardPosition>
  > = new Map([
    [player1.color, [placement1Position, placement3PositionWithHole]],
    [player2.color, [placement2Position]],
  ]);
  const remainingUnplacedPenguinsAfterPlacement3WithHole: Map<
    PenguinColor,
    number
  > = new Map([
    [player1.color, 2],
    [player2.color, 3],
  ]);
  const scoresAfterPlacement3WithHole: Map<PenguinColor, number> = new Map([
    [player1.color, 2],
    [player2.color, 1],
  ]);
  const gameAfterPlacement3WithHole: Game = {
    ...gameAfterPlacement1,
    curPlayerIndex: 1,
    penguinPositions: penguinPositionsAfterPlacement3WithHole,
    remainingUnplacedPenguins: remainingUnplacedPenguinsAfterPlacement3WithHole,
    scores: scoresAfterPlacement3WithHole,
  };
  const penguinPositionsAfterAllPlacement: Map<
    PenguinColor,
    Array<BoardPosition>
  > = new Map([
    [
      player1.color,
      [
        { row: 0, col: 0 },
        { row: 0, col: 2 },
        { row: 1, col: 1 },
        { row: 2, col: 0 },
      ],
    ],
    [
      player2.color,
      [
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 2 },
        { row: 2, col: 1 },
      ],
    ],
  ]);
  const remainingUnplacedPenguinsAfterAllPlacement: Map<
    PenguinColor,
    number
  > = new Map([
    [player1.color, 0],
    [player2.color, 0],
  ]);
  const scoresAfterAllPlacement: Map<PenguinColor, number> = new Map([
    [player1.color, 4],
    [player2.color, 4],
  ]);
  const gameAfterAllPlacement: Game = {
    ...game,
    curPlayerIndex: 0,
    penguinPositions: penguinPositionsAfterAllPlacement,
    remainingUnplacedPenguins: remainingUnplacedPenguinsAfterAllPlacement,
    scores: scoresAfterAllPlacement,
  };

  describe("getNextPenguinPlacementPosition", () => {
    it("returns next open position in the zig zag ordering", () => {
      expect(getNextPenguinPlacementPosition(game)).toEqual(placement1Position);
      expect(getNextPenguinPlacementPosition(gameAfterPlacement1)).toEqual(
        placement2Position
      );
    });

    it("skips over holes", () => {
      expect(
        getNextPenguinPlacementPosition(gameAfterPlacement1WithHole)
      ).toEqual(placement2PositionWithHole);
    });

    it("zig zags back to the first position of the next row", () => {
      expect(
        getNextPenguinPlacementPosition(gameAfterPlacement2WithHole)
      ).toEqual(placement3PositionWithHole);
    });
  });

  describe("placeNextPenguin", () => {
    it("places at the next open position in the zig zag ordering", () => {
      expect(placeNextPenguin(game)).toEqual(gameAfterPlacement1);
      expect(placeNextPenguin(gameAfterPlacement1)).toEqual(
        gameAfterPlacement2
      );
    });

    it("skips over holes", () => {
      expect(placeNextPenguin(gameAfterPlacement1WithHole)).toEqual(
        gameAfterPlacement2WithHole
      );
    });

    it("zig zags back to the first position of the next row", () => {
      expect(placeNextPenguin(gameAfterPlacement2WithHole)).toEqual(
        gameAfterPlacement3WithHole
      );
    });

    it("returns an error if the current player has no more penguins to place", () => {
      const noMorePenguinsRemaining: Map<PenguinColor, number> = new Map([
        [player1.color, 0],
        [player2.color, 0],
      ]);
      const gameWithNoMorePenguinsRemaining: Game = {
        ...game,
        remainingUnplacedPenguins: noMorePenguinsRemaining,
      };
      expect(placeNextPenguin(gameWithNoMorePenguinsRemaining)).toEqual(
        new NoMorePlacementsError(gameWithNoMorePenguinsRemaining)
      );
    });
  });

  describe("placeAllPenguinsZigZag", () => {
    it("returns error if there aren't enough spaces to place penguins", () => {
      expect(placeAllPenguinsZigZag(smallGame)).toEqual(
        new NoMorePlacementsError(smallGame)
      );
    });

    it("places all penguins in the zig zag pattern", () => {
      expect(placeAllPenguinsZigZag(game)).toEqual(gameAfterAllPlacement);
    });
  });

  describe("chooseNextAction", () => {
    it("", () => {});
  });
});
