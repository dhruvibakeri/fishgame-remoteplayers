import { createTestGameState } from "../src/gameStateCreation";
import {
  Game,
  getCurrentPlayer,
  getCurrentPlayerColor,
  getCurrentPlayerScore,
  Player,
} from "../../state";
import { createBlankBoard } from "../src/boardCreation";
import { Board, PenguinColor } from "../../board";

describe("state.ts", () => {
  const board: Board = createBlankBoard(3, 3, 1) as Board;
  const scores: Map<PenguinColor, number> = new Map([
    [PenguinColor.Black, 1],
    [PenguinColor.Brown, 0],
  ]);
  const game: Game = {
    ...(createTestGameState(board) as Game),
    scores,
  };
  const gameSecondTurn = { ...game, curPlayerIndex: 1 };
  const samplePlayer1: Player = { name: "foo", color: PenguinColor.Black };
  const samplePlayer2: Player = { name: "bar", color: PenguinColor.Brown };

  describe("getCurrentPlayerScore", () => {
    it("retrieves the score of the first player in the beginning state", () => {
      expect(getCurrentPlayerScore(game)).toEqual(1);
    });

    it("retrieves a non first player", () => {
      expect(getCurrentPlayerScore(gameSecondTurn)).toEqual(0);
    });
  });

  describe("getCurrentPlayerColor", () => {
    it("retrieves the color of the first player in the beginning state", () => {
      expect(getCurrentPlayerColor(game)).toEqual(PenguinColor.Black);
    });

    it("retrieves the color of a non first player", () => {
      expect(getCurrentPlayerColor(gameSecondTurn)).toEqual(PenguinColor.Brown);
    });
  });

  describe("getCurrentPlayer", () => {
    it("retrieves the first player in the beginning state", () => {
      expect(getCurrentPlayer(game)).toEqual(samplePlayer1);
    });

    it("retrieves a non first player", () => {
      expect(getCurrentPlayer(gameSecondTurn)).toEqual(samplePlayer2);
    });
  });
});
