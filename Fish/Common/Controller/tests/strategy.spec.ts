import { createGameState } from "../src/gameStateCreation";
import { Game, Player } from "../../state";
import { Board, BoardPosition, PenguinColor } from "../../board";
import { createBlankBoard, createNumberedBoard, setTileToHole } from "../src/boardCreation";
import {
  getNextPenguinPlacementPosition,
  placeAllPenguinsZigZag,
  placeNextPenguin,
  chooseNextAction,
  getMinMaxScore,
  minArray,
  maxArray,
} from "../../../Player/strategy";
import { NoMorePlacementsError } from "../types/errors";
import { inputStateToGameState } from "../src/testHarnessConversion";
import { InputPlayer } from "../src/testHarnessInput";
import { createGameTree } from "../src/gameTreeCreation";
import { GameTree } from "../../game-tree";

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

  const gameWithTwoPiecesPositions: Map<PenguinColor, Array<BoardPosition>> = new Map([
    [player1.color, [{col: 0, row: 0}]],
    [player2.color, [{col: 2, row: 2}]]
  ]);
  const gameWithTwoPiecesBoard: Board = { tiles: [
    [{ numOfFish: 1 }, { numOfFish: 2 }],
    [{ numOfFish: 3 }, { numOfFish: 2 }],
    [{ numOfFish: 1 }, { numOfFish: 2 }],
  ]};
  const gameWithTwoPieces: Game = {
    ...game,
    board: gameWithTwoPiecesBoard,
    penguinPositions: gameWithTwoPiecesPositions,
    scores: scoresAfterPlacement2,
    remainingUnplacedPenguins: remainingUnplacedPenguinsAfterAllPlacement,
  };
  const noMovesGame: Game = {
    ...gameWithTwoPieces,
    penguinPositions: new Map([
      [player1.color, []],
      [player2.color, []],
    ])
  };
  const gameTree: GameTree = createGameTree(gameWithTwoPieces);
  console.log("no moves");
  const gameTreeNoMoves: GameTree = createGameTree(noMovesGame);

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
      console.log(gameAfterPlacement3WithHole.board.tiles);
      console.log(gameAfterPlacement2WithHole.board.tiles);
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

  // describe("chooseNextAction", () => {
  //   const inputBoard = [[1,1,2],[2,1,2],[1,1,1],[1,2,3]];
  //   const inputPlayers: InputPlayer[] = [
  //     {
  //       color: PenguinColor.Black,
  //       score: 8,
  //       places: [[0,0],[1,0],[3,1],[3,2]]
  //     },
  //     {
  //       color: PenguinColor.Brown,
  //       score: 6,
  //       places: [[3,0],[2,1],[0,2],[1,2]]
  //     }
  //   ];
  //   const startingGame = inputStateToGameState({board: inputBoard, players: inputPlayers}) as Game;
  //   const numberedBoard = createNumberedBoard([[1,3,5,4],[3,2,4,1],[2,3,5,1],[4,1,1,2]]) as Board;
  //   const numberedGame = createGameState(players, numberedBoard) as Game;
  //   const gameAfterPlacement = placeAllPenguinsZigZag(numberedGame) as Game;
  //   const numberedBoardWithHoles = createNumberedBoard([[1,0,5],[3,0,4,1],[2,3,5],[0,1,0,2]]) as Board;
  //   const numberedGameWithHoles = createGameState(players, numberedBoardWithHoles) as Game;
  //   const gameAfterPlacementWithHoles = placeAllPenguinsZigZag(numberedGameWithHoles) as Game;
    
  //   it("Returns best movement for game state", () => {
  //     expect(chooseNextAction(startingGame, 2)).toBe(false);
  //     expect(chooseNextAction(gameAfterPlacement, 2)).toBe(false);
  //     expect(chooseNextAction(gameAfterPlacementWithHoles, 2)).toBe(false);
  //   });
  // });
  
  describe("getMinMaxScore", () => {
    it("returns the searching player's score if the depth is 0", () => {
      expect(getMinMaxScore(gameTree, 0, 0)).toEqual(1);
    });

    it("returns the searching player's score if there are no more potential moves", () => {
      expect(getMinMaxScore(gameTreeNoMoves, 0, 1)).toEqual(1);
    });

    it("returns a maximum of the found scores if it's the searching player's turn", () => {
      expect(getMinMaxScore(gameTree, 0, 1)).toEqual(3);
      expect(getMinMaxScore(gameTree, 0, 2)).toEqual(4);
    });

    it("returns a minimum of the found scores if it's not the searching player's turns", () => {
      const opponentTurnGame: Game = {
        ...game,
        curPlayerIndex: 1,
      }
      const opponentTurnGameTree = createGameTree(opponentTurnGame);
      expect(getMinMaxScore(opponentTurnGameTree, 0, 2)).toEqual(1);
    });
  });

  describe("minArray", () => {
    it("finds the minimum elements of an array", () => {
      const arr = [{foo: 1}, {foo: 2}, {foo: 1}, {foo: 3}];
      const fn = (foo: any) => foo.foo;
      expect(minArray(arr, fn)).toEqual([{foo: 1}, {foo: 1}])
    });

    it("returns an empty array when given an empty array", () => {
      expect(minArray([], () => 1)).toEqual([]);
    });
  });

  describe("maxArray", () => {
    it("finds the maximum elements of an array", () => {
      const arr = [{foo: 3}, {foo: 2}, {foo: 1}, {foo: 3}];
      const fn = (foo: any) => foo.foo;
      expect(maxArray(arr, fn)).toEqual([{foo: 3}, {foo: 3}])
    });

    it("returns an empty array when given an empty array", () => {
      expect(maxArray([], () => 1)).toEqual([]);
    });
  });

  describe("tieBreakMovements", () => {
    it("chooses the movement with the lowest starting row", () => {});

    it("chooses the movement with the lowest starting row then column", () => {});

    it("chooses the movement with the lowest starting position then ending row", () => {});

    it("chooses the movement with the lowest starting position then ending position", () => {});
  })
});
