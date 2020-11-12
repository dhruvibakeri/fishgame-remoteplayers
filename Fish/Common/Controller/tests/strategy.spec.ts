import { createGameState, shiftPlayers } from "../src/gameStateCreation";
import { Game, MovementGame, Player } from "../../state";
import { Board, BoardPosition, PenguinColor } from "../../board";
import {
  createBlankBoard,
  createNumberedBoard,
  setTileToHole,
} from "../src/boardCreation";
import {
  getNextPenguinPlacementPosition,
  placeAllPenguinsZigZag,
  placeNextPenguin,
  chooseNextAction,
  getMinMaxScore,
  minArray,
  maxArray,
  tieBreakMovements,
} from "../src/strategy";
import { IllegalPlacementError } from "../types/errors";
import { inputStateToGameState } from "../src/testHarnessConversion";
import { InputPlayer } from "../src/testHarnessInput";
import { createGameTree } from "../src/gameTreeCreation";
import { GameTree, Movement } from "../../game-tree";
import { movePenguin } from "../src/penguinPlacement";
import { Result, Maybe } from "true-myth";
const { ok, err } = Result;
const { just } = Maybe;

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
  const board: Board = createBlankBoard(3, 3, 1).unsafelyUnwrap();
  const smallBoard: Board = createBlankBoard(2, 3, 1).unsafelyUnwrap();
  const boardWithHole: Board = setTileToHole(
    board,
    holePosition
  ).unsafelyUnwrap();
  const game: Game = createGameState(players, board).unsafelyUnwrap();
  const gameWithHole: Game = createGameState(
    players,
    boardWithHole
  ).unsafelyUnwrap();
  const smallGame: Game = createGameState(players, smallBoard).unsafelyUnwrap();

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
    [player1.color, 0],
    [player2.color, 0],
  ]);
  const gameAfterPlacement1 = {
    ...game,
    players: shiftPlayers(players),
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
    [player1.color, 0],
    [player2.color, 0],
  ]);
  const gameAfterPlacement2: Game = {
    ...gameAfterPlacement1,
    players,
    penguinPositions: penguinPositionsAfterPlacement2,
    remainingUnplacedPenguins: remainingUnplacedPenguinsAfterPlacement2,
    scores: scoresAfterPlacement2,
  };

  const gameAfterPlacement1WithHole: Game = {
    ...gameWithHole,
    players: shiftPlayers(players),
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
    players,
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
    [player2.color, [placement2PositionWithHole]],
  ]);
  const remainingUnplacedPenguinsAfterPlacement3WithHole: Map<
    PenguinColor,
    number
  > = new Map([
    [player1.color, 2],
    [player2.color, 3],
  ]);
  const scoresAfterPlacement3WithHole: Map<PenguinColor, number> = new Map([
    [player1.color, 0],
    [player2.color, 0],
  ]);
  const gameAfterPlacement3WithHole: Game = {
    ...gameAfterPlacement2WithHole,
    players: shiftPlayers(players),
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
    0
  > = new Map([
    [player1.color, 0],
    [player2.color, 0],
  ]);
  const scoresAfterAllPlacement: Map<PenguinColor, number> = new Map([
    [player1.color, 0],
    [player2.color, 0],
  ]);
  const gameAfterAllPlacement: MovementGame = {
    ...game,
    penguinPositions: penguinPositionsAfterAllPlacement,
    remainingUnplacedPenguins: remainingUnplacedPenguinsAfterAllPlacement,
    scores: scoresAfterAllPlacement,
  };
  const gameNoMoves: MovementGame = movePenguin(
    gameAfterAllPlacement,
    player1,
    { row: 1, col: 1 },
    { row: 2, col: 2 }
  ).unsafelyUnwrap();
  const gameTreeNoMoves: GameTree = createGameTree(
    gameNoMoves
  ).unsafelyUnwrap();
  const gameTree: GameTree = createGameTree(
    gameAfterAllPlacement
  ).unsafelyUnwrap();

  describe("getNextPenguinPlacementPosition", () => {
    it("returns next open position in the zig zag ordering", () => {
      expect(getNextPenguinPlacementPosition(game)).toEqual(
        just(placement1Position)
      );
      expect(getNextPenguinPlacementPosition(gameAfterPlacement1)).toEqual(
        just(placement2Position)
      );
    });

    it("skips over holes", () => {
      expect(
        getNextPenguinPlacementPosition(gameAfterPlacement1WithHole)
      ).toEqual(just(placement2PositionWithHole));
    });

    it("zig zags back to the first position of the next row", () => {
      expect(
        getNextPenguinPlacementPosition(gameAfterPlacement2WithHole)
      ).toEqual(just(placement3PositionWithHole));
    });
  });

  describe("placeNextPenguin", () => {
    it("places at the next open position in the zig zag ordering", () => {
      expect(placeNextPenguin(game)).toEqual(ok(gameAfterPlacement1));
      expect(placeNextPenguin(gameAfterPlacement1)).toEqual(
        ok(gameAfterPlacement2)
      );
    });

    it("skips over holes", () => {
      expect(placeNextPenguin(gameAfterPlacement1WithHole)).toEqual(
        ok(gameAfterPlacement2WithHole)
      );
    });

    it("zig zags back to the first position of the next row", () => {
      expect(placeNextPenguin(gameAfterPlacement2WithHole)).toEqual(
        ok(gameAfterPlacement3WithHole)
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
        err(
          new IllegalPlacementError(
            gameWithNoMorePenguinsRemaining,
            player1,
            placement1Position,
            "Player has no more penguins to place."
          )
        )
      );
    });
  });

  describe("placeAllPenguinsZigZag", () => {
    it("returns error if there aren't enough spaces to place penguins", () => {
      expect(placeAllPenguinsZigZag(smallGame)).toEqual(
        err(
          new IllegalPlacementError(
            smallGame,
            player1,
            null,
            "No more placements available"
          )
        )
      );
    });

    it("places all penguins in the zig zag pattern", () => {
      expect(placeAllPenguinsZigZag(game)).toEqual(ok(gameAfterAllPlacement));
    });
  });

  describe("chooseNextAction", () => {
    const inputBoard = [
      [1, 1, 2],
      [2, 1, 2],
      [1, 1, 1],
      [1, 2, 3],
    ];
    const inputPlayers: InputPlayer[] = [
      {
        color: PenguinColor.Black,
        score: 8,
        places: [
          [0, 0],
          [1, 0],
          [3, 0],
          [3, 2],
        ],
      },
      {
        color: PenguinColor.Brown,
        score: 6,
        places: [
          [0, 1],
          [2, 1],
          [0, 2],
          [1, 2],
        ],
      },
    ];
    const startingGame = inputStateToGameState({
      board: inputBoard,
      players: inputPlayers,
    }).unsafelyUnwrap() as MovementGame;
    const numberedBoard = createNumberedBoard([
      [1, 3, 5, 4],
      [3, 2, 4, 1],
      [2, 3, 5, 1],
      [4, 1, 1, 2],
    ]).unsafelyUnwrap();
    const numberedGame = createGameState(
      players,
      numberedBoard
    ).unsafelyUnwrap();
    const gameAfterPlacement = placeAllPenguinsZigZag(
      numberedGame
    ).unsafelyUnwrap();
    const numberedBoardWithHoles = createNumberedBoard([
      [1, 0, 5],
      [3, 0, 4, 1],
      [2, 3, 5],
      [0, 1, 0, 2],
    ]).unsafelyUnwrap();
    const numberedGameWithHoles = createGameState(
      players,
      numberedBoardWithHoles
    ).unsafelyUnwrap();
    const gameAfterPlacementWithHoles = placeAllPenguinsZigZag(
      numberedGameWithHoles
    ).unsafelyUnwrap();

    it("Returns best movement for game state", () => {
      const expectedMove1: Movement = {
        startPosition: { col: 2, row: 3 },
        endPosition: { col: 1, row: 1 },
      };
      const expectedMove2: Movement = {
        startPosition: { col: 2, row: 0 },
        endPosition: { col: 2, row: 2 },
      };
      expect(chooseNextAction(startingGame, 2).unsafelyUnwrap()).toEqual(
        expectedMove1
      );
      expect(chooseNextAction(gameAfterPlacement, 1).unsafelyUnwrap()).toEqual(
        expectedMove2
      );
    });

    it("rejects a placement for a player with no more available moves", () => {
      expect(chooseNextAction(gameNoMoves, 1).isNothing()).toEqual(true);
    });
  });

  describe("getMinMaxScore", () => {
    it("returns the searching player's score if the depth is 0", () => {
      expect(getMinMaxScore(gameTree, player1.color, 1)).toEqual(0);
    });

    it("returns the searching player's score if there are no more potential moves", () => {
      expect(getMinMaxScore(gameTreeNoMoves, player1.color, 1)).toEqual(1);
    });

    it("returns a maximum of the found scores if it's the searching player's turn", () => {
      expect(getMinMaxScore(gameTree, player1.color, 2)).toEqual(1);
    });

    it("returns a minimum of the found scores if it's not the searching player's turns", () => {
      const opponentTurnGame: Game = {
        ...gameAfterAllPlacement,
        players: shiftPlayers(players),
      };
      const opponentTurnGameTree = createGameTree(
        opponentTurnGame
      ).unsafelyUnwrap();
      expect(getMinMaxScore(opponentTurnGameTree, player1.color, 0)).toEqual(0);
      expect(getMinMaxScore(opponentTurnGameTree, player1.color, 1)).toEqual(0);
      expect(getMinMaxScore(opponentTurnGameTree, player1.color, 2)).toEqual(0);
    });
  });

  describe("minArray", () => {
    it("finds the minimum elements of an array", () => {
      const arr = [{ foo: 1 }, { foo: 2 }, { foo: 1 }, { foo: 3 }];
      const fn = (foo: any) => foo.foo;
      expect(minArray(arr, fn)).toEqual([{ foo: 1 }, { foo: 1 }]);
    });

    it("returns an empty array when given an empty array", () => {
      expect(minArray([], () => 1)).toEqual([]);
    });
  });

  describe("maxArray", () => {
    it("finds the maximum elements of an array", () => {
      const arr = [{ foo: 3 }, { foo: 2 }, { foo: 1 }, { foo: 3 }];
      const fn = (foo: any) => foo.foo;
      expect(maxArray(arr, fn)).toEqual([{ foo: 3 }, { foo: 3 }]);
    });

    it("returns an empty array when given an empty array", () => {
      expect(maxArray([], () => 1)).toEqual([]);
    });
  });

  describe("tieBreakMovements", () => {
    const startPosition1: BoardPosition = { col: 0, row: 0 };
    const endPosition1: BoardPosition = { col: 0, row: 1 };
    const movement1: Movement = {
      startPosition: startPosition1,
      endPosition: endPosition1,
    };

    const startPosition2: BoardPosition = { col: 1, row: 1 };
    const endPosition2: BoardPosition = { col: 1, row: 2 };
    const movement2: Movement = {
      startPosition: startPosition2,
      endPosition: endPosition2,
    };

    const startPosition3: BoardPosition = { col: 2, row: 1 };
    const endPosition3: BoardPosition = { col: 2, row: 2 };
    const movement3: Movement = {
      startPosition: startPosition3,
      endPosition: endPosition3,
    };

    const startPosition4: BoardPosition = { col: 2, row: 0 };
    const endPosition4: BoardPosition = { col: 2, row: 1 };
    const movement4: Movement = {
      startPosition: startPosition4,
      endPosition: endPosition4,
    };

    const endPosition5: BoardPosition = { col: 2, row: 2 };
    const movement5: Movement = {
      startPosition: startPosition1,
      endPosition: endPosition5,
    };

    const endPosition6: BoardPosition = { col: 2, row: 1 };
    const movement6: Movement = {
      startPosition: startPosition1,
      endPosition: endPosition6,
    };

    it("chooses the movement with the lowest starting row", () => {
      expect(tieBreakMovements([movement2, movement1, movement3])).toEqual(
        movement1
      );
    });

    it("chooses the movement with the lowest starting row then column", () => {
      expect(
        tieBreakMovements([movement4, movement2, movement1, movement3])
      ).toEqual(movement1);
    });

    it("chooses the movement with the lowest starting position then ending row", () => {
      expect(
        tieBreakMovements([
          movement3,
          movement5,
          movement2,
          movement1,
          movement4,
        ])
      ).toEqual(movement1);
    });

    it("chooses the movement with the lowest starting position then ending position", () => {
      expect(
        tieBreakMovements([
          movement2,
          movement1,
          movement4,
          movement6,
          movement5,
          movement3,
        ])
      ).toEqual(movement1);
    });
  });
});
