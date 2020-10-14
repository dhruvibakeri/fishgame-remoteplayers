import { Board, BoardPosition, Penguin, PenguinColor } from "../types/board";
import { Player, Game } from "../types/state";
import {
  IllegalPenguinPositionError,
  InvalidGameStateError,
  InvalidPositionError
} from "../types/errors";
import { movePenguinInPenguinPositions, movePenguin, placePenguin } from "../src/penguinPlacement";

import { createHoledOneFishBoard } from "../src/boardCreation"
import { createState } from "../src/stateCreation";

describe("penguinMovement", () => {
  const player1: Player = { name: "foo", age: 20 };
  const player2: Player = { name: "bar", age: 30 };
  const player3: Player = { name: "baz", age: 45 };
  const players: Array<Player> = [player1, player2];
    const playerToColorMapping: Map<Player, PenguinColor> = new Map([
      [player1, PenguinColor.Black], 
      [player2, PenguinColor.Brown]
    ]);
    const holePosition: BoardPosition = { col: 1, row: 0 };
    const holePositions: Array<BoardPosition> = [holePosition];
    const validStartPosition: BoardPosition = { col: 0, row: 0 };
    const validEndPosition: BoardPosition = { col: 0, row: 1 };
    const board: Board = createHoledOneFishBoard(2, 2, holePositions, 1) as Board;
    const player1Penguin: Penguin = { color: PenguinColor.Black };
    const penguinPositions: Map<BoardPosition, Penguin> = new Map([[validStartPosition, player1Penguin]]);
    const game: Game = {
      ...createState(players, playerToColorMapping, board) as Game,
      penguinPositions
    };

  describe("movePenguinInPenguinPosition", () => {
    it("removes the start position from the positions and maps the end position to the penguin", () => {
      const startPosition: BoardPosition = { col: 0, row: 0 };
      const endPosition: BoardPosition = { col: 0, row: 1 };
      const penguin: Penguin = { color: PenguinColor.Red };
      const initialPenguinPositions: Map<BoardPosition, Penguin> = new Map([[startPosition, penguin]]);
      const expectedPenguinPositions: Map<BoardPosition, Penguin> = new Map([[endPosition, penguin]]);
      expect(movePenguinInPenguinPositions(initialPenguinPositions, penguin, endPosition, startPosition)).toEqual(expectedPenguinPositions);
    });
  });

  describe("movePenguin", () => {

    it("rejects a start position not on the board", () => {
      const invalidStartPosition: BoardPosition = { col: 2, row: 2 };
      const expectedError = new InvalidPositionError(board, invalidStartPosition);
      expect(movePenguin(game, player1, invalidStartPosition, validEndPosition)).toEqual(expectedError);
    });

    it("rejects an end position not on the board", () => {
      const invalidEndPosition: BoardPosition = { col: 3, row: 3 };
      const expectedError = new InvalidPositionError(board, invalidEndPosition);
      expect(movePenguin(game, player1, validStartPosition, invalidEndPosition)).toEqual(expectedError);
    });

    it("rejects a player without a penguin color mapping", () => {
      const expectedError = new InvalidGameStateError(game);
      expect(movePenguin(game, player3, validStartPosition, validEndPosition)).toEqual(expectedError);
    });

    it("rejects a player trying to move from from a starting position not containing one of their penguins", () => {
      const invalidStartPosition: BoardPosition = { col: 1, row: 1 };
      const expectedError = new IllegalPenguinPositionError(game, player1, invalidStartPosition, validEndPosition);
      expect(movePenguin(game, player1, invalidStartPosition, validEndPosition)).toEqual(expectedError);
    });

    it("rejects a player trying to move to a position not reachable from the start", () => {
      const invalidEndPosition: BoardPosition = { col: 1, row: 1 };
      const expectedError = new IllegalPenguinPositionError(game, player1, validStartPosition, invalidEndPosition);
      expect(movePenguin(game, player1, validStartPosition, invalidEndPosition)).toEqual(expectedError);
    });

    it("rejects a player trying to move to a hole", () => {
      const expectedError = new IllegalPenguinPositionError(game, player1, validEndPosition, holePosition);
      expect(movePenguin(game, player1, validEndPosition, holePosition)).toEqual(expectedError);
    });

    it("rejects a player trying to move to a position with another penguin present", () => {
      const twoPenguinPositions: Map<BoardPosition, Penguin> = new Map(penguinPositions);
      twoPenguinPositions.set(validEndPosition, { color: PenguinColor.White });
      const gameWithTwoPenguins: Game = {
        ...game,
        penguinPositions: twoPenguinPositions
      };
      const expectedError = new IllegalPenguinPositionError(game, player1, validStartPosition, validEndPosition);
      expect(movePenguin(gameWithTwoPenguins, player1, validStartPosition, validEndPosition)).toEqual(expectedError);
    });

    it("accepts a valid move, updating and returning the game state", () => {
      const expectedPenguinPositions: Map<BoardPosition, Penguin> = new Map([[validEndPosition, player1Penguin]]);
      const expectedGameState: Game = {
        ...game,
        penguinPositions: expectedPenguinPositions
      };
      expect(movePenguin(game, player1, validStartPosition, validEndPosition)).toEqual(expectedGameState);
    });
  });

  describe("placePenguin", () => {
    it("places a penguin when player has unplaced penguins and the placement locaiton is valid", () => {
        const placePosition: BoardPosition = { col: 0, row: 1 };
        const expectedPenguinPositions: Map<BoardPosition, Penguin> = new Map(game.penguinPositions);
        expectedPenguinPositions.set(placePosition, { color: game.playerToColorMapping.get(player1)});
        const expectedRemainingUnplacedPenguins: Map<Player, number> = new Map(game.remainingUnplacedPenguins);
        expectedRemainingUnplacedPenguins.set(player1, game.remainingUnplacedPenguins.get(player1) - 1);
        const expectedGameState: Game = {
            ...game,
            penguinPositions: expectedPenguinPositions,
            remainingUnplacedPenguins: expectedRemainingUnplacedPenguins
        }
      expect(placePenguin(player1, game, placePosition)).toEqual(expectedGameState);
    });
  });
});
