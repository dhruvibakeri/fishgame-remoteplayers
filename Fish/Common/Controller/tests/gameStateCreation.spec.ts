import { Board, PenguinColor } from "../../board";
import { Player, Game } from "../../state";
import { InvalidNumberOfPlayersError } from "../types/errors";
import {
  buildUnplacedPenguinMap,
  createEmptyPenguinPositions,
  createEmptyScoreSheet,
  createGameState,
  createTestGameState,
} from "../src/gameStateCreation";

import { createBlankBoard } from "../src/boardCreation";

describe("stateModification", () => {
  const player1: Player = { name: "foo", color: PenguinColor.Black };
  const player2: Player = { name: "bar", color: PenguinColor.Brown };
  const player3: Player = { name: "baz", color: PenguinColor.Red };
  const player4: Player = { name: "bat", color: PenguinColor.White };
  const board: Board = createBlankBoard(2, 2, 1) as Board;

  describe("buildUnplacedPenguinMap", () => {
    it("builds map of player to number, with each player assigned 4 penguins", () => {
      const players: Array<Player> = [player1, player2];
      const unplacedPenguins: Map<PenguinColor, number> = new Map([
        [player1.color, 4],
        [player2.color, 4],
      ]);
      expect(buildUnplacedPenguinMap(players)).toEqual(unplacedPenguins);
    });

    it("builds map of player to number, with each player assigned 2 penguins", () => {
      const players: Array<Player> = [player1, player2, player3, player4];
      const unplacedPenguins: Map<PenguinColor, number> = new Map([
        [player1.color, 2],
        [player2.color, 2],
        [player3.color, 2],
        [player4.color, 2],
      ]);
      expect(buildUnplacedPenguinMap(players)).toEqual(unplacedPenguins);
    });
  });

  describe("createGameState", () => {
    const unplacedPenguins3Players = new Map([
      [player1.color, 3],
      [player2.color, 3],
      [player3.color, 3],
    ]);
    const unplacedPenguins4Players = new Map([
      [player1.color, 2],
      [player2.color, 2],
      [player3.color, 2],
      [player4.color, 2],
    ]);

    it("rejects an empty list of players", () => {
      const players: Array<Player> = [];
      expect(createGameState(players, board)).toEqual(
        new InvalidNumberOfPlayersError(players.length)
      );
    });

    it("rejects a single player", () => {
      const players: Array<Player> = [player1];
      expect(createGameState(players, board)).toEqual(
        new InvalidNumberOfPlayersError(players.length)
      );
    });

    it("rejects a number of players greater than the maximum", () => {
      const players: Array<Player> = [
        player1,
        player2,
        player3,
        player4,
        player3,
      ];
      expect(createGameState(players, board)).toEqual(
        new InvalidNumberOfPlayersError(players.length)
      );
    });

    it("successfully creates a Game state with a number of players equal to the maximum", () => {
      const players: Array<Player> = [player1, player2, player3, player4];
      const expectedGameState: Game = {
        players: players,
        board,
        curPlayerIndex: 0,
        remainingUnplacedPenguins: unplacedPenguins4Players,
        penguinPositions: createEmptyPenguinPositions(players),
        scores: createEmptyScoreSheet(players),
      };

      expect(createGameState(players, board)).toEqual(expectedGameState);
    });

    it("successfully creates a Game state with a number of players less than the maximum", () => {
      const players: Array<Player> = [player1, player2, player3];
      const expectedGameState: Game = {
        players: players,
        board,
        curPlayerIndex: 0,
        remainingUnplacedPenguins: unplacedPenguins3Players,
        penguinPositions: createEmptyPenguinPositions(players),
        scores: createEmptyScoreSheet(players),
      };

      expect(createGameState(players, board)).toEqual(expectedGameState);
    });
  });

  describe("createTestGameState", () => {
    const samplePlayer1: Player = { name: "foo", color: PenguinColor.Black };
    const samplePlayer2: Player = { name: "bar", color: PenguinColor.Brown };
    const samplePlayers: Array<Player> = [samplePlayer1, samplePlayer2];
    const expectedGameState:
      | Game
      | InvalidNumberOfPlayersError = createGameState(samplePlayers, board);

    it("creates test game state", () => {
      expect(createTestGameState(board)).toEqual(expectedGameState);
    });
  });
});
