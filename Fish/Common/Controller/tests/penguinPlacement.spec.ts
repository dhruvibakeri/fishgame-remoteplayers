import { Board, BoardPosition, PenguinColor } from "../../board";
import { Player, Game, MovementGame, getCurrentPlayer } from "../../state";
import { IllegalMovementError, IllegalPlacementError } from "../types/errors";
import {
  movePenguinInPenguinPositions,
  movePenguin,
  placePenguin,
  getFishNumberFromPosition,
  updatePlayerScore,
  positionsAreEqual,
} from "../src/penguinPlacement";

import { createHoledOneFishBoard, setTileToHole } from "../src/boardCreation";
import { createGameState, shiftPlayers } from "../src/gameStateCreation";
import { Result } from "true-myth";
const { ok, err } = Result;

describe("penguinMovement", () => {
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
  const penguinPositions: Map<PenguinColor, Array<BoardPosition>> = new Map([
    [player1.color, [validStartPosition]],
    [player2.color, []],
  ]);
  const remainingUnplacedPenguins: Map<PenguinColor, 0> = new Map([
    [player1.color, 0],
    [player2.color, 0],
  ]);
  const game: Game = {
    ...createGameState(players, board).unsafelyUnwrap(),
    penguinPositions,
  };

  const movementGame: MovementGame = {
    ...createGameState(players, board).unsafelyUnwrap(),
    penguinPositions,
    remainingUnplacedPenguins,
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
    const expectedGameState: Game = {
      ...game,
      players: shiftPlayers(players),
      penguinPositions: expectedPenguinPositions,
      remainingUnplacedPenguins: expectedRemainingUnplacedPenguins,
    };
    const outOfBoundsPosition: BoardPosition = { col: 6, row: 8 };

    it("rejects placement position that is not on board", () => {
      expect(placePenguin(player1, game, outOfBoundsPosition)).toEqual(
        err(
          new IllegalPlacementError(
            game,
            player1,
            outOfBoundsPosition,
            "Placement position is not playable."
          )
        )
      );
    });

    it("rejects placement position that is a hole", () => {
      expect(placePenguin(player1, game, holePosition)).toEqual(
        err(
          new IllegalPlacementError(
            game,
            player1,
            holePosition,
            "Placement position is not playable."
          )
        )
      );
    });

    it("rejects placement position that already has a penguin", () => {
      expect(placePenguin(player1, game, validStartPosition)).toEqual(
        err(
          new IllegalPlacementError(
            game,
            player1,
            validStartPosition,
            "Placement position is not playable."
          )
        )
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
          err(new IllegalPlacementError(
            noUnplacedPenguinsGame,
            getCurrentPlayer(noUnplacedPenguinsGame),
            placePosition,
            "Player has no more penguins to place."
          ))
      );
    });

    it("places a penguin when player has unplaced penguins and the placement locaiton is valid", () => {
      expect(placePenguin(player1, game, placePosition)).toEqual(
        ok(expectedGameState)
      );
    });
  });

  describe("movePenguin", () => {
    it("rejects a start position not on the board", () => {
      const invalidStartPosition: BoardPosition = { col: 2, row: 2 };
      const expectedError = new IllegalMovementError(
        game,
        player1,
        invalidStartPosition,
        validEndPosition,
        "Start and end positions do not form a straight, uninterrupted path."
      );
      expect(
        movePenguin(
          movementGame,
          player1,
          invalidStartPosition,
          validEndPosition
        )
      ).toEqual(err(expectedError));
    });

    it("rejects an end position not on the board", () => {
      const invalidEndPosition: BoardPosition = { col: 3, row: 3 };
      const expectedError = new IllegalMovementError(
        game,
        player1,
        validStartPosition,
        invalidEndPosition,
        "Start and end positions do not form a straight, uninterrupted path."
      );
      expect(
        movePenguin(
          movementGame,
          player1,
          validStartPosition,
          invalidEndPosition
        )
      ).toEqual(err(expectedError));
    });

    it("rejects a player trying to move from from a starting position not containing one of their penguins", () => {
      const invalidStartPosition: BoardPosition = { col: 1, row: 1 };
      const expectedError = new IllegalMovementError(
        game,
        player1,
        invalidStartPosition,
        validEndPosition,
        "Start and end positions do not form a straight, uninterrupted path."
      );
      expect(
        movePenguin(
          movementGame,
          player1,
          invalidStartPosition,
          validEndPosition
        )
      ).toEqual(err(expectedError));
    });

    it("rejects a player trying to move to a position not reachable from the start", () => {
      const invalidEndPosition: BoardPosition = { col: 1, row: 1 };
      const expectedError = new IllegalMovementError(
        game,
        player1,
        validStartPosition,
        invalidEndPosition,
        "Start and end positions do not form a straight, uninterrupted path."
      );
      expect(
        movePenguin(
          movementGame,
          player1,
          validStartPosition,
          invalidEndPosition
        )
      ).toEqual(err(expectedError));
    });

    it("rejects a player trying to move to a hole", () => {
      const expectedError = new IllegalMovementError(
        game,
        player1,
        validEndPosition,
        holePosition,
        "Start and end positions do not form a straight, uninterrupted path."
      );
      expect(
        movePenguin(movementGame, player1, validEndPosition, holePosition)
      ).toEqual(err(expectedError));
    });

    it("rejects a player trying to move to a position with another penguin present", () => {
      const twoPenguinPositions: Map<
        PenguinColor,
        Array<BoardPosition>
      > = new Map(penguinPositions);
      twoPenguinPositions.set(PenguinColor.White, [validEndPosition]);
      const gameWithTwoPenguins: MovementGame = {
        ...movementGame,
        penguinPositions: twoPenguinPositions,
      };
      const expectedError = new IllegalMovementError(
        game,
        player1,
        validStartPosition,
        validEndPosition,
        "Start and end positions do not form a straight, uninterrupted path."
      );
      expect(
        movePenguin(
          gameWithTwoPenguins,
          player1,
          validStartPosition,
          validEndPosition
        )
      ).toEqual(err(expectedError));
    });

    it("accepts a valid move, updating and returning the game state", () => {
      const expectedPenguinPositions: Map<
        PenguinColor,
        Array<BoardPosition>
      > = new Map([
        [player1.color, [validEndPosition]],
        [player2.color, []],
      ]);
      const newBoard = setTileToHole(
        game.board,
        validStartPosition
      ).unsafelyUnwrap();
      const expectedScores: Map<PenguinColor, number> = new Map(game.scores);
      expectedScores.set(player1.color, 1);
      const expectedGameState: Game = {
        ...movementGame,
        players: shiftPlayers(players),
        penguinPositions: expectedPenguinPositions,
        board: newBoard,
        scores: expectedScores,
      };
      expect(
        movePenguin(movementGame, player1, validStartPosition, validEndPosition)
      ).toEqual(ok(expectedGameState));
    });
  });

  describe("positionsAreEqual", () => {
    const position1: BoardPosition = { col: 1, row: 1 };
    const position2: BoardPosition = { col: 1, row: 1 };
    const position3: BoardPosition = { col: 0, row: 1 };
    const position4: BoardPosition = { col: 1, row: 0 };
    it("recognizes the same position", () => {
      expect(positionsAreEqual(position1, position1)).toEqual(true);
    });

    it("recognizes logically equivalent positions with different references", () => {
      expect(positionsAreEqual(position1, position2)).toEqual(true);
    });

    it("recognizes the difference in two position's rows", () => {
      expect(positionsAreEqual(position1, position4)).toEqual(false);
    });

    it("recognizes the difference in two position's columns", () => {
      expect(positionsAreEqual(position3, position1)).toEqual(false);
    });
  });
});
