import { Board, BoardPosition, Penguin, PenguinColor } from "../../board";
import { Player, Game, getPositionKey } from "../../state";
import {
  IllegalPenguinPositionError,
  InvalidGameStateError,
} from "../types/errors";
import {
  movePenguinInPenguinPositions,
  movePenguin,
  placePenguin,
  getCurPlayerIndex,
  getNextPlayer,
  getFishNumberFromPosition,
  updatePlayerScore,
} from "../src/penguinPlacement";

import { createHoledOneFishBoard, setTileToHole } from "../src/boardCreation";
import { createGameState } from "../src/gameStateCreation";

describe("penguinMovement", () => {
  const player1: Player = { name: "foo", age: 20, score: 0 };
  const player2: Player = { name: "bar", age: 30, score: 0 };
  const player3: Player = { name: "baz", age: 45, score: 0 };
  const players: Array<Player> = [player1, player2];
  const playerToColorMapping: Map<string, PenguinColor> = new Map([
    [player1.name, PenguinColor.Black],
    [player2.name, PenguinColor.Brown],
  ]);
  const holePosition: BoardPosition = { col: 1, row: 0 };
  const holePositions: Array<BoardPosition> = [holePosition];
  const validStartPosition: BoardPosition = { col: 0, row: 0 };
  const validEndPosition: BoardPosition = { col: 0, row: 1 };
  const board: Board = createHoledOneFishBoard(2, 2, holePositions, 1) as Board;
  const player1Penguin: Penguin = { color: PenguinColor.Black };
  const penguinPositions: Map<string, Penguin> = new Map([
    [getPositionKey(validStartPosition), player1Penguin],
  ]);
  const game: Game = {
    ...(createGameState(players, playerToColorMapping, board) as Game),
    penguinPositions,
  };
  const placedPenguinGameState: Game = placePenguin(game.curPlayer, game, {
    col: 0,
    row: 0,
  }) as Game;

  describe("getCurPlayerIndex", () => {
    it("returns index of current player", () => {
      expect(getCurPlayerIndex(game)).toEqual(0);
    });

    it("returns index of current player after player makes a move", () => {
      expect(getCurPlayerIndex(placedPenguinGameState)).toEqual(1);
    });
  });

  describe("getNextPlayer", () => {
    it("returns next current player", () => {
      expect(getNextPlayer(game)).toEqual(player2);
    });

    it("returns next player after player makes a move", () => {
      expect(getNextPlayer(placedPenguinGameState)).toEqual(player3);
    });
  });

  describe("getFishNumberFromPosition", () => {
    it("returns number of fish at given tile position", () => {
      expect(getFishNumberFromPosition(game, { col: 0, row: 0 })).toEqual(1);
    });

    it("returns number of fish (0) at given hole position", () => {
      expect(getFishNumberFromPosition(game, { col: 1, row: 0 })).toEqual(0);
    });
  });

  describe("updatePlayerScore", () => {
    it("returns player with updated score from given tile", () => {
      expect(updatePlayerScore(game, { col: 0, row: 0 })).toEqual({
        ...player1,
        score: 1,
      });
    });

    it("returns player with same score if given hole position (hole tiles have 0 fish)", () => {
      expect(updatePlayerScore(game, { col: 1, row: 0 })).toEqual(player1);
    });
  });

  describe("movePenguinInPenguinPosition", () => {
    it("removes the start position from the positions and maps the end position to the penguin", () => {
      const startPosition: BoardPosition = { col: 0, row: 0 };
      const endPosition: BoardPosition = { col: 0, row: 1 };
      const penguin: Penguin = { color: PenguinColor.Red };
      const initialPenguinPositions: Map<string, Penguin> = new Map([
        [getPositionKey(startPosition), penguin],
      ]);
      const initialGame: Game = {
        ...game,
        penguinPositions: initialPenguinPositions,
      };
      const expectedPenguinPositions: Map<string, Penguin> = new Map([
        [getPositionKey(endPosition), penguin],
      ]);
      expect(
        movePenguinInPenguinPositions(
          initialGame,
          penguin,
          endPosition,
          startPosition
        )
      ).toEqual(expectedPenguinPositions);
    });

    it("maps the end position to the penguin when only given end position", () => {
      const startPosition: BoardPosition = { col: 0, row: 0 };
      const endPosition: BoardPosition = { col: 0, row: 1 };
      const penguin: Penguin = { color: PenguinColor.Red };
      const initialPenguinPositions: Map<string, Penguin> = new Map([
        [getPositionKey(startPosition), penguin],
      ]);
      const initialGame: Game = {
        ...game,
        penguinPositions: initialPenguinPositions,
      };
      const expectedPenguinPositions: Map<string, Penguin> = new Map([
        [getPositionKey(startPosition), penguin],
        [getPositionKey(endPosition), penguin],
      ]);
      expect(
        movePenguinInPenguinPositions(initialGame, penguin, endPosition)
      ).toEqual(expectedPenguinPositions);
    });
  });

  describe("placePenguin", () => {
    const placePosition: BoardPosition = { col: 0, row: 1 };
    const expectedPenguinPositions: Map<string, Penguin> = new Map(
      game.penguinPositions
    );
    expectedPenguinPositions.set(getPositionKey(placePosition), {
      color: game.playerToColorMapping.get(player1.name),
    });
    const expectedRemainingUnplacedPenguins: Map<string, number> = new Map(
      game.remainingUnplacedPenguins
    );
    expectedRemainingUnplacedPenguins.set(
      player1.name,
      game.remainingUnplacedPenguins.get(player1.name) - 1
    );
    const newPlayers = [...game.players];
    newPlayers[0] = { ...player1, score: 1 };
    const expectedGameState: Game = {
      ...game,
      players: newPlayers,
      curPlayer: player2,
      penguinPositions: expectedPenguinPositions,
      remainingUnplacedPenguins: expectedRemainingUnplacedPenguins,
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
      const noUnplacedPenguins: Map<string, number> = new Map([
        [player1.name, 0],
        [player2.name, 0],
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

    it("rejects a player without a penguin color mapping", () => {
      const expectedError = new InvalidGameStateError(game);
      expect(
        movePenguin(game, player3, validStartPosition, validEndPosition)
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
      const twoPenguinPositions: Map<string, Penguin> = new Map(
        penguinPositions
      );
      twoPenguinPositions.set(getPositionKey(validEndPosition), {
        color: PenguinColor.White,
      });
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
      const expectedPenguinPositions: Map<string, Penguin> = new Map([
        [getPositionKey(validEndPosition), player1Penguin],
      ]);
      const newPlayers = [...game.players];
      newPlayers[0] = { ...player1, score: 1 };
      const newBoard = setTileToHole(game.board, validStartPosition) as Board;
      const expectedGameState: Game = {
        ...game,
        players: newPlayers,
        curPlayer: player2,
        penguinPositions: expectedPenguinPositions,
        board: newBoard,
      };
      expect(
        movePenguin(game, player1, validStartPosition, validEndPosition)
      ).toEqual(expectedGameState);
    });
  });
});
