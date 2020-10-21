import { Board, BoardPosition, Penguin, PenguinColor } from "../../board";
import { Player, Game, getCurrentPlayer } from "../../state";
import {
  IllegalPenguinPositionError,
  InvalidGameStateError,
} from "../types/errors";
import {
  movePenguinInPenguinPositions,
  movePenguin,
  placePenguin,
  getFishNumberFromPosition,
  updatePlayerScore,
} from "../src/penguinPlacement";

import { createHoledOneFishBoard, setTileToHole } from "../src/boardCreation";
import { createGameState } from "../src/gameStateCreation";

describe("penguinMovement", () => {
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
    [player2.color, []],
  ]);
  const game: Game = {
    ...(createGameState(players, board) as Game),
    penguinPositions,
  };

  describe("getFishNumberFromPosition", () => {
    it("returns number of fish at given tile position", () => {
      expect(getFishNumberFromPosition(game.board, { col: 0, row: 0 })).toEqual(
        1
      );
    });

    it("returns number of fish (0) at given hole position", () => {
      expect(getFishNumberFromPosition(game.board, { col: 1, row: 0 })).toEqual(
        0
      );
    });
  });

  describe("updatePlayerScore", () => {
    it("returns scores with updated score from given tile", () => {
      const expectedScores: Map<PenguinColor, number> = new Map(game.scores);
      expectedScores.set(player1.color, 1);
      expect(updatePlayerScore(game, { col: 0, row: 0 })).toEqual(
        expectedScores
      );
    });

    it("returns player with same score if given hole position (hole tiles have 0 fish)", () => {
      expect(updatePlayerScore(game, { col: 1, row: 0 })).toEqual(game.scores);
    });
  });

  describe("movePenguinInPenguinPosition", () => {
    it("removes the start position from the positions and maps the end position to the penguin", () => {
      const startPosition: BoardPosition = { col: 0, row: 0 };
      const endPosition: BoardPosition = { col: 0, row: 1 };
      const initialPenguinPositions: Map<
        PenguinColor,
        Array<BoardPosition>
      > = new Map([
        [player1.color, [startPosition]],
        [player2.color, []],
      ]);
      const initialGame: Game = {
        ...game,
        penguinPositions: initialPenguinPositions,
      };
      const expectedPenguinPositions: Map<
        PenguinColor,
        Array<BoardPosition>
      > = new Map([
        [player1.color, [endPosition]],
        [player2.color, []],
      ]);
      expect(
        movePenguinInPenguinPositions(
          initialGame,
          player1.color,
          endPosition,
          startPosition
        )
      ).toEqual(expectedPenguinPositions);
    });

    it("maps the end position to the penguin when only given end position", () => {
      const startPosition: BoardPosition = { col: 0, row: 0 };
      const endPosition: BoardPosition = { col: 0, row: 1 };
      const initialPenguinPositions: Map<
        PenguinColor,
        Array<BoardPosition>
      > = new Map([
        [player1.color, [startPosition]],
        [player2.color, []],
      ]);
      const initialGame: Game = {
        ...game,
        penguinPositions: initialPenguinPositions,
      };
      const expectedPenguinPositions: Map<
        PenguinColor,
        Array<BoardPosition>
      > = new Map([
        [player1.color, [startPosition]],
        [player2.color, [endPosition]],
      ]);
      expect(
        movePenguinInPenguinPositions(initialGame, player2.color, endPosition)
      ).toEqual(expectedPenguinPositions);
    });
  });

  describe("placePenguin", () => {
    const placePosition: BoardPosition = { col: 0, row: 1 };
    const expectedPenguinPositions: Map<
      PenguinColor,
      Array<BoardPosition>
    > = new Map(game.penguinPositions);
    expectedPenguinPositions.set(player1.color, [
      ...expectedPenguinPositions.get(player1.color),
      placePosition,
    ]);
    const expectedRemainingUnplacedPenguins: Map<
      PenguinColor,
      number
    > = new Map(game.remainingUnplacedPenguins);
    expectedRemainingUnplacedPenguins.set(
      player1.color,
      game.remainingUnplacedPenguins.get(player1.color) - 1
    );
    const expectedScores: Map<PenguinColor, number> = new Map(game.scores);
    expectedScores.set(player1.color, 1);
    const expectedGameState: Game = {
      ...game,
      curPlayerIndex: 1,
      penguinPositions: expectedPenguinPositions,
      remainingUnplacedPenguins: expectedRemainingUnplacedPenguins,
      scores: expectedScores,
    };
    const outOfBoundsPosition: BoardPosition = { col: 6, row: 8 };

    it("rejects placement position that is not on board", () => {
      expect(placePenguin(player1, game, outOfBoundsPosition)).toEqual(
        new IllegalPenguinPositionError(game, player1, outOfBoundsPosition)
      );
    });

    it("rejects placement position that is a hole", () => {
      expect(placePenguin(player1, game, holePosition)).toEqual(
        new IllegalPenguinPositionError(game, player1, holePosition)
      );
    });

    it("rejects placement position that already has a penguin", () => {
      expect(placePenguin(player1, game, validStartPosition)).toEqual(
        new IllegalPenguinPositionError(game, player1, validStartPosition)
      );
    });

    it("rejects placement if player does not have penguin remaining", () => {
      const noUnplacedPenguins: Map<PenguinColor, number> = new Map([
        [player1.color, 0],
        [player2.color, 0],
      ]);
      const noUnplacedPenguinsGame: Game = {
        ...game,
        remainingUnplacedPenguins: noUnplacedPenguins,
      };
      expect(
        placePenguin(player1, noUnplacedPenguinsGame, placePosition)
      ).toEqual(
        new InvalidGameStateError(
          noUnplacedPenguinsGame,
          "Player does not have any remaining unplaced penguins"
        )
      );
    });

    it("places a penguin when player has unplaced penguins and the placement locaiton is valid", () => {
      expect(placePenguin(player1, game, placePosition)).toEqual(
        expectedGameState
      );
    });
  });

  describe("movePenguin", () => {
    it("rejects a start position not on the board", () => {
      const invalidStartPosition: BoardPosition = { col: 2, row: 2 };
      const expectedError = new IllegalPenguinPositionError(
        game,
        player1,
        invalidStartPosition,
        validEndPosition
      );
      expect(
        movePenguin(game, player1, invalidStartPosition, validEndPosition)
      ).toEqual(expectedError);
    });

    it("rejects an end position not on the board", () => {
      const invalidEndPosition: BoardPosition = { col: 3, row: 3 };
      const expectedError = new IllegalPenguinPositionError(
        game,
        player1,
        validStartPosition,
        invalidEndPosition
      );
      expect(
        movePenguin(game, player1, validStartPosition, invalidEndPosition)
      ).toEqual(expectedError);
    });

    it("rejects a player trying to move from from a starting position not containing one of their penguins", () => {
      const invalidStartPosition: BoardPosition = { col: 1, row: 1 };
      const expectedError = new IllegalPenguinPositionError(
        game,
        player1,
        invalidStartPosition,
        validEndPosition
      );
      expect(
        movePenguin(game, player1, invalidStartPosition, validEndPosition)
      ).toEqual(expectedError);
    });

    it("rejects a player trying to move to a position not reachable from the start", () => {
      const invalidEndPosition: BoardPosition = { col: 1, row: 1 };
      const expectedError = new IllegalPenguinPositionError(
        game,
        player1,
        validStartPosition,
        invalidEndPosition
      );
      expect(
        movePenguin(game, player1, validStartPosition, invalidEndPosition)
      ).toEqual(expectedError);
    });

    it("rejects a player trying to move to a hole", () => {
      const expectedError = new IllegalPenguinPositionError(
        game,
        player1,
        validEndPosition,
        holePosition
      );
      expect(
        movePenguin(game, player1, validEndPosition, holePosition)
      ).toEqual(expectedError);
    });

    it("rejects a player trying to move to a position with another penguin present", () => {
      const twoPenguinPositions: Map<
        PenguinColor,
        Array<BoardPosition>
      > = new Map(penguinPositions);
      twoPenguinPositions.set(PenguinColor.White, [validEndPosition]);
      const gameWithTwoPenguins: Game = {
        ...game,
        penguinPositions: twoPenguinPositions,
      };
      const expectedError = new IllegalPenguinPositionError(
        game,
        player1,
        validStartPosition,
        validEndPosition
      );
      expect(
        movePenguin(
          gameWithTwoPenguins,
          player1,
          validStartPosition,
          validEndPosition
        )
      ).toEqual(expectedError);
    });

    it("accepts a valid move, updating and returning the game state", () => {
      const expectedPenguinPositions: Map<
        PenguinColor,
        Array<BoardPosition>
      > = new Map([
        [player1.color, [validEndPosition]],
        [player2.color, []],
      ]);
      const newBoard = setTileToHole(game.board, validStartPosition) as Board;
      const expectedScores: Map<PenguinColor, number> = new Map(game.scores);
      expectedScores.set(player1.color, 1);
      const expectedGameState: Game = {
        ...game,
        curPlayerIndex: 1,
        penguinPositions: expectedPenguinPositions,
        board: newBoard,
        scores: expectedScores,
      };
      expect(
        movePenguin(game, player1, validStartPosition, validEndPosition)
      ).toEqual(expectedGameState);
    });
  });
});
