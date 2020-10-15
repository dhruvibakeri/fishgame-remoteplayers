import { Board, PenguinColor } from "../types/board";
import { Player, Game } from "../types/state";
import {
  InvalidNumberOfPlayersError,
} from "../types/errors";
import { sortPlayersByAge, createGameState, buildUnplacedPenguinMap, createTestGameState } from "../src/gameStateCreation";

import { createBlankBoard } from "../src/boardCreation"

describe("stateModification", () => {
  const player1: Player = { name: "foo", age: 20 };
  const player2: Player = { name: "bar", age: 30 };
  const player3: Player = { name: "baz", age: 45 };
  const player4: Player = { name: "bat", age: 65 };
  const board: Board = createBlankBoard(2, 2, 1) as Board;

  describe("sortPlayersByAge", () => {
    it("maintains sorted (ascending age) order of already sorted players", () => {
      expect(sortPlayersByAge([player1, player2, player3])).toEqual(
        [player1, player2, player3]
      );
    });

    it("sorts players based on age in ascending order, given unordered list", () => {
        expect(sortPlayersByAge([player3, player1, player2])).toEqual(
          [player1, player2, player3]
        );
    });

    it("sorts players based on age in ascending order, given descending order", () => {
        expect(sortPlayersByAge([player3, player2, player1])).toEqual(
          [player1, player2, player3]
        );
    });
  });

  describe("buildUnplacedPenguinMap", () => {
    it("builds map of player to number, with each player assigned 4 penguins", () => {
      const players: Array<Player> = [player1, player2];
      const unplacedPenguins = new Map([[player1, 4], [player2, 4]]);
      expect(buildUnplacedPenguinMap(players)).toEqual(unplacedPenguins);
    });

    it("builds map of player to number, with each player assigned 2 penguins", () => {
      const players: Array<Player> = [player1, player2, player3, player4];
      const unplacedPenguins = new Map([[player1, 2], [player2, 2], [player3, 2], [player4, 2]]);
      expect(buildUnplacedPenguinMap(players)).toEqual(unplacedPenguins);
    });
  });

  describe("createGameState", () => {
    const playerToColorMapping3Players: Map<Player, PenguinColor> = new Map([
      [player1, PenguinColor.Black], 
      [player2, PenguinColor.Brown], 
      [player3, PenguinColor.Red],
    ]);
    const unplacedPenguins3Players = new Map([
      [player1, 3],
      [player2, 3],
      [player3, 3],
    ]);
    const playerToColorMapping4Players: Map<Player, PenguinColor> = new Map([
      [player1, PenguinColor.Black], 
      [player2, PenguinColor.Brown], 
      [player3, PenguinColor.Red],
      [player4, PenguinColor.White],
    ]);
    const unplacedPenguins4Players = new Map([
      [player1, 2],
      [player2, 2],
      [player3, 2],
      [player4, 2],
    ]);

    it("rejects an empty list of players", () => {
      const players: Array<Player> = []
      expect(createGameState(players, playerToColorMapping3Players, board)).toEqual(new InvalidNumberOfPlayersError(players.length));
    });

    it("rejects a single player", () => {
      const players: Array<Player> = [player1];
      expect(createGameState(players, playerToColorMapping3Players, board)).toEqual(
        new InvalidNumberOfPlayersError(players.length)
      );
    })

    it("rejects a number of players greater than the maximum", () => {
      const players: Array<Player> = [player1, player2, player3, player4, player3];
      expect(createGameState(players, playerToColorMapping3Players, board)).toEqual(new InvalidNumberOfPlayersError(players.length));
    });

    it("successfully creates a Game state with a number of players equal to the maximum", () => {
      const players: Array<Player> = [player1, player2, player3, player4];
      const expectedGameState: Game = {
        players: players,
        board,
        curPlayer: player1,
        remainingUnplacedPenguins: unplacedPenguins4Players,
        penguinPositions: new Map(),
        playerToColorMapping: playerToColorMapping4Players,
      };

      expect(createGameState(players, playerToColorMapping4Players, board)).toEqual(expectedGameState);
    });

    it("successfully creates a Game state with a number of players less than the maximum", () => {
      const players: Array<Player> = [player1, player2, player3];
      const expectedGameState: Game = {
        players: players,
        board, 
        curPlayer: player1,
        remainingUnplacedPenguins: unplacedPenguins3Players,
        penguinPositions: new Map(), 
        playerToColorMapping: playerToColorMapping3Players,
      }

      expect(createGameState(players, playerToColorMapping3Players, board)).toEqual(expectedGameState);
    });
  });

  describe("createTestGameState", () => {
    const samplePlayer1: Player = { name: "foo", age: 21 };
    const samplePlayer2: Player = { name: "bar", age: 20 };
    const samplePlayers: Array<Player> = [samplePlayer1, samplePlayer2];
    const samplePlayerToColorMapping: Map<Player, PenguinColor> = new Map([
      [samplePlayer1, PenguinColor.Black],
      [samplePlayer2, PenguinColor.Brown],
    ]);
    const expectedGameState: Game | InvalidNumberOfPlayersError = createGameState(samplePlayers, samplePlayerToColorMapping, board);

    it("creates test game state", () => {
      expect(createTestGameState(board)).toEqual(expectedGameState);
    });
  });
});
