import { Board, BoardPosition, PenguinColor } from "../../board";
import { Game, MovementGame, Player } from "../../state";
import {
  createGameTree,
  createGameTreeFromMovementGame,
  createLazyGameTree,
  gameIsMovementGame,
  generatePotentialMoveMapping,
} from "../src/gameTreeCreation";
import { GameTree, Movement, MovementToResultingTree } from "../../game-tree";
import { IllegalGameTreeError } from "../types/errors";
import { Result } from "true-myth";
import { shiftPlayers } from "../src/gameStateCreation";
const { err } = Result;

describe("gameTreeCreation", () => {
  const player1: Player = { name: "foo", color: PenguinColor.Black };
  const player2: Player = { name: "bar", color: PenguinColor.Brown };
  const player1Position1: BoardPosition = { col: 0, row: 0 };
  const player1Position2: BoardPosition = { col: 2, row: 2 };
  const player1Position3: BoardPosition = { col: 0, row: 1 };
  const player1Position4: BoardPosition = { col: 0, row: 2 };
  const player1Position5: BoardPosition = { col: 2, row: 1 };
  const player2Position1: BoardPosition = { col: 1, row: 2 };
  const movement1: Movement = {
    startPosition: player1Position1,
    endPosition: { col: 0, row: 1 },
  };
  const movement2: Movement = {
    startPosition: player1Position1,
    endPosition: { col: 0, row: 2 },
  };
  const movement3: Movement = {
    startPosition: player1Position2,
    endPosition: player1Position5,
  };
  const players: Array<Player> = [player1, player2];
  const boardBeforeMovement: Board = {
    tiles: [
      [{ numOfFish: 1 }, { numOfFish: 0 }, { numOfFish: 0 }],
      [{ numOfFish: 1 }, { numOfFish: 0 }, { numOfFish: 1 }],
      [{ numOfFish: 1 }, { numOfFish: 1 }, { numOfFish: 1 }],
    ],
  };
  const boardAfterMovement1Or2: Board = {
    tiles: [
      [{ numOfFish: 0 }, { numOfFish: 0 }, { numOfFish: 0 }],
      [{ numOfFish: 1 }, { numOfFish: 0 }, { numOfFish: 1 }],
      [{ numOfFish: 1 }, { numOfFish: 1 }, { numOfFish: 1 }],
    ],
  };
  const boardAfterMovement3: Board = {
    tiles: [
      [{ numOfFish: 1 }, { numOfFish: 0 }, { numOfFish: 0 }],
      [{ numOfFish: 1 }, { numOfFish: 0 }, { numOfFish: 1 }],
      [{ numOfFish: 1 }, { numOfFish: 1 }, { numOfFish: 0 }],
    ],
  };
  const scoresBeforeMovement: Map<PenguinColor, number> = new Map([
    [player1.color, 0],
    [player2.color, 0],
  ]);
  const scoresAfterMovement: Map<PenguinColor, number> = new Map([
    [player1.color, 1],
    [player2.color, 0],
  ]);
  const unplacedPenguins: Map<PenguinColor, number> = new Map([
    [player1.color, 1],
    [player2.color, 0],
  ]);
  const remainingUnplacedPenguins: Map<PenguinColor, 0> = new Map([
    [player1.color, 0],
    [player2.color, 0],
  ]);
  const penguinPositions: Map<PenguinColor, Array<BoardPosition>> = new Map([
    [player1.color, [player1Position1, player1Position2]],
    [player2.color, [player2Position1]],
  ]);
  const penguinPositionsAfterMovement1: Map<
    PenguinColor,
    Array<BoardPosition>
  > = new Map([
    [player1.color, [player1Position2, player1Position3]],
    [player2.color, [player2Position1]],
  ]);
  const penguinPositionsAfterMovement2: Map<
    PenguinColor,
    Array<BoardPosition>
  > = new Map([
    [player1.color, [player1Position2, player1Position4]],
    [player2.color, [player2Position1]],
  ]);
  const penguinPositionsAfterMovement3: Map<
    PenguinColor,
    Array<BoardPosition>
  > = new Map([
    [player1.color, [player1Position1, player1Position5]],
    [player2.color, [player2Position1]],
  ]);

  const game: MovementGame = {
    players,
    board: boardBeforeMovement,
    penguinPositions,
    remainingUnplacedPenguins,
    scores: scoresBeforeMovement,
  };

  const gameAfterMovement1: Game = {
    players,
    board: boardAfterMovement1Or2,
    penguinPositions: penguinPositionsAfterMovement1,
    remainingUnplacedPenguins,
    scores: scoresAfterMovement,
  };

  const gameAfterMovement2: Game = {
    players: shiftPlayers(players),
    board: boardAfterMovement1Or2,
    penguinPositions: penguinPositionsAfterMovement2,
    remainingUnplacedPenguins,
    scores: scoresAfterMovement,
  };

  const gameAfterMovement3: Game = {
    players: shiftPlayers(players),
    board: boardAfterMovement3,
    penguinPositions: penguinPositionsAfterMovement3,
    remainingUnplacedPenguins,
    scores: scoresAfterMovement,
  };
  const expectedGameStates = [
    { movement: movement1, game: gameAfterMovement1 },
    { movement: movement2, game: gameAfterMovement2 },
    { movement: movement3, game: gameAfterMovement3 },
  ];
  const expectedPotentialMoveLengths = [
    { movement: movement1, length: 2 },
    { movement: movement2, length: 1 },
    { movement: movement3, length: 1 },
  ];
  const gameWithUnlacedPenguins: Game = {
    ...game,
    remainingUnplacedPenguins: unplacedPenguins,
  };

  describe("createGameTree", () => {
    const actual = createGameTree(game).unsafelyUnwrap();
    const actualPotentialStates = actual.potentialMoves.map(
      (movementToResultingTree: MovementToResultingTree) => {
        return {
          movement: movementToResultingTree.movement,
          game: movementToResultingTree.resultingGameTree().gameState,
        };
      }
    );
    const actualPotentialLengths = actual.potentialMoves.map(
      (movementToResultingTree: MovementToResultingTree) => {
        return {
          movement: movementToResultingTree.movement,
          length: movementToResultingTree.resultingGameTree().potentialMoves
            .length,
        };
      }
    );

    it("creates a game tree for a given game with the correct state", () => {
      expect(actual.gameState).toEqual(game);
    });

    it("creates a game tree for a given game with the correct potential states", () => {
      expect(actualPotentialStates).toEqual(expectedGameStates);
    });

    it("creates a game tree for a given game with the correct potential move lengths for its potential moves", () => {
      expect(actualPotentialLengths).toEqual(expectedPotentialMoveLengths);
    });

    it("rejects a non MovementGame", () => {
      expect(createGameTree(gameWithUnlacedPenguins)).toEqual(
        err(
          new IllegalGameTreeError(
            gameWithUnlacedPenguins,
            "Invalid game for tree generation. Not all penguins have been placed"
          )
        )
      );
    });
  });

  describe("createGameTreeFromMovementGame", () => {
    const actual = createGameTreeFromMovementGame(game) as GameTree;
    const actualPotentialStates = actual.potentialMoves.map(
      (movementToResultingTree: MovementToResultingTree) => {
        return {
          movement: movementToResultingTree.movement,
          game: movementToResultingTree.resultingGameTree().gameState,
        };
      }
    );
    const actualPotentialLengths = actual.potentialMoves.map(
      (movementToResultingTree: MovementToResultingTree) => {
        return {
          movement: movementToResultingTree.movement,
          length: movementToResultingTree.resultingGameTree().potentialMoves
            .length,
        };
      }
    );

    it("creates a game tree for a given game with the correct state", () => {
      expect(actual.gameState).toEqual(game);
    });

    it("creates a game tree for a given game with the correct potential states", () => {
      expect(actualPotentialStates).toEqual(expectedGameStates);
    });

    it("creates a game tree for a given game with the correct potential move lengths for its potential moves", () => {
      expect(actualPotentialLengths).toEqual(expectedPotentialMoveLengths);
    });
  });

  describe("gameIsMovementGame", () => {
    it("rejects a Game with unplaced penguins", () => {
      expect(gameIsMovementGame(gameWithUnlacedPenguins)).toEqual(false);
    });

    it("accepts a Game with no unplaced penguins", () => {
      expect(gameIsMovementGame(game)).toEqual(true);
    });
  });

  describe("generatePotentialMoveMapping", () => {
    const actual = generatePotentialMoveMapping(game);
    const actualGameStates = actual.map(
      (movementToResultingTree: MovementToResultingTree) => {
        return {
          movement: movementToResultingTree.movement,
          game: movementToResultingTree.resultingGameTree().gameState,
        };
      }
    );
    const actualPotentialMoveLengths = actual.map(
      (movementToResultingTree: MovementToResultingTree) => {
        return {
          movement: movementToResultingTree.movement,
          length: movementToResultingTree.resultingGameTree().potentialMoves
            .length,
        };
      }
    );

    it("generates the correct potential game states", () => {
      expect(actualGameStates).toEqual(expectedGameStates);
    });

    it("generates the correct amount of potential moves from each potential move", () => {
      expect(actualPotentialMoveLengths).toEqual(expectedPotentialMoveLengths);
    });
  });

  // describe("createLazyGameTree", () => {
  //   it("creates a LazyGameTree from a game state and movement", () => {
  //     const actual: GameTree = createLazyGameTree(game, movement1)();
  //     expect(actual.gameState).toEqual(gameAfterMovement1);
  //     expect(Array.from(actual.potentialMoves).length).toEqual(2);
  //   });
  // });
});
