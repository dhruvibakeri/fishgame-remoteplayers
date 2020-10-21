import { createTestGameState } from "../src/gameStateCreation";
import { Board, Penguin, PenguinColor } from "../../board";
import { Game, Player } from "../../state";
import {
  createLazyGameTree,
  generatePotentialMoveMapping,
  movementToLazyGameTree,
} from "../src/gameTreeCreation";
import { GameTree, LazyGameTree, Movement } from "../../game-tree";

describe("gameTreeCreation", () => {
  const boardBeforeMovement: Board = {
    tiles: [
      [{ numOfFish: 1 }, { numOfFish: 1 }, { numOfFish: 0 }],
      [{ numOfFish: 1 }, { numOfFish: 0 }, { numOfFish: 1 }],
      [{ numOfFish: 1 }, { numOfFish: 1 }, { numOfFish: 1 }],
    ],
  };
  const boardAfterMovement1Or2: Board = {
    tiles: [
      [{ numOfFish: 0 }, { numOfFish: 1 }, { numOfFish: 0 }],
      [{ numOfFish: 1 }, { numOfFish: 0 }, { numOfFish: 1 }],
      [{ numOfFish: 1 }, { numOfFish: 1 }, { numOfFish: 1 }],
    ],
  };
  const boardAfterMovement3: Board = {
    tiles: [
      [{ numOfFish: 1 }, { numOfFish: 1 }, { numOfFish: 0 }],
      [{ numOfFish: 1 }, { numOfFish: 0 }, { numOfFish: 1 }],
      [{ numOfFish: 1 }, { numOfFish: 1 }, { numOfFish: 0 }],
    ],
  };
  const movement1: Movement = {
    startPosition: { col: 0, row: 0 },
    endPosition: { col: 0, row: 1 },
  };
  const movement2: Movement = {
    startPosition: { col: 0, row: 0 },
    endPosition: { col: 0, row: 2 },
  };
  const movement3: Movement = {
    startPosition: { col: 2, row: 2 },
    endPosition: { col: 2, row: 1 },
  };

  describe("createGameTree", () => {});

  describe("generatePotentialMoveMapping", () => {
    it("generates the potential move mapping for a given game", () => {
      const actual: Array<[string, GameTree]> = Array.from(
        generatePotentialMoveMapping(gameBeforeMovement)
      ).map(([movementKey, lazyGameTree]: [string, LazyGameTree]) => [
        movementKey,
        lazyGameTree(),
      ]);
      const actualMovesToGameState: Array<[
        string,
        Game
      ]> = actual.map(([movementKey, gameTree]: [string, GameTree]) => [
        movementKey,
        gameTree.gameState,
      ]);
      const actualMovesToPotentialMovesLengths: Array<[
        string,
        number
      ]> = actual.map(([movementKey, gameTree]: [string, GameTree]) => [
        movementKey,
        Array.from(gameTree.potentialMoves).length,
      ]);
      const expectedPotentialMove1 = "0,0,0,1";
      const expectedPotentialMove2 = "0,0,0,2";
      const expectedPotentialMove3 = "2,2,2,1";
      const expectedMovesToGameState: Array<[string, Game]> = [
        [expectedPotentialMove1, gameAfterMovement1],
        [expectedPotentialMove2, gameAfterMovement2],
        [expectedPotentialMove3, gameAfterMovement3],
      ];
      const expectedMovesToPotentialMovesLengths: Array<[string, number]> = [
        [expectedPotentialMove1, 2],
        [expectedPotentialMove2, 2],
        [expectedPotentialMove3, 0],
      ];
      expect(new Set(actualMovesToGameState)).toEqual(
        new Set(expectedMovesToGameState)
      );
      expect(new Set(actualMovesToPotentialMovesLengths)).toEqual(
        new Set(expectedMovesToPotentialMovesLengths)
      );
    });
  });

  describe("movementToLazyGameTree", () => {
    it("creates a tuple from a hashed movement to its lazy game tree", () => {
      const actual: [string, LazyGameTree] = movementToLazyGameTree(
        gameBeforeMovement,
        movement1
      );
      expect(actual[0]).toEqual("0,0,0,1");
      expect(actual[1]().gameState).toEqual(gameAfterMovement1);
      expect(Array.from(actual[1]().potentialMoves).length).toEqual(2);
    });
  });

  describe("createLazyGameTree", () => {
    it("creates a LazyGameTree from a game state and movement", () => {
      const actual = createLazyGameTree(gameBeforeMovement, movement1)();
      expect(actual.gameState).toEqual(gameAfterMovement1);
      expect(Array.from(actual.potentialMoves).length).toEqual(2);
    });
  });

  describe("getPlayerPenguinPosition", () => {
    it("fetches a player's penguin positions from a game state", () => {
      const expectedPositions = [
        { col: 0, row: 0 },
        { col: 2, row: 2 },
      ];
      expect(
        getPlayerPenguinPositions(gameBeforeMovement, player1BeforeMovement)
      ).toEqual(expectedPositions);
    });
  });
});
