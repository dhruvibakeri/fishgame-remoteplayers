import {
  DisqualifyMe,
  GameHasEnded,
  GameIsStarting,
  MakeMovement,
  MakePlacement,
  TournamentPlayer,
  TournamentPlayerWithAge,
} from "../../player-interface";
import {
  runTournamentRound,
  informWinnersAndLosers,
  makeTournamentPlayerMapping,
  continueTournament,
  assignParties,
  assignAndRunGames,
} from "../src/manager";
import { createSamplePlayer } from "../../../Player/player";
import { InputDepth } from "../src/testHarnessInput";
import { Movement } from "../../game-tree";
import { BoardParameters } from "../src/referee";

describe("manager tests", () => {
  const makeMockPlayer = (
    name: string,
    depth: InputDepth,
    properties: Record<string, any>
  ): TournamentPlayer => {
    return {
      ...createSamplePlayer(name, depth),
      ...properties,
    };
  };

  const makeMovementFunction = (
    srcRow: number,
    srcCol: number,
    destRow: number,
    destCol: number
  ) => (): Movement => ({
    startPosition: { row: srcRow, col: srcCol },
    endPosition: { row: destRow, col: destCol },
  });

  const players = [1, 2, 3, 4, 5, 6, 7, 8]
    .map((num) => num.toString())
    .map((name) => makeMockPlayer(name, 1, {}));

  const boardParameters: BoardParameters = {
    rows: 4,
    cols: 4,
  };

  describe("continueTournament", () => {
    it("returns false if the previous and current pool are the same length", () => {
      expect(continueTournament(4, 4)).toEqual(false);
    });

    it("returns false if the current pool has too few players for a single game", () => {
      expect(continueTournament(1, 4)).toEqual(false);
    });

    it("returns false if there are no players in the current pool", () => {
      expect(continueTournament(0, 4)).toEqual(false);
    });

    it("returns true if there are enough players for a single final game", () => {
      expect(continueTournament(4, 8)).toEqual(true);
      expect(continueTournament(3, 8)).toEqual(true);
      expect(continueTournament(2, 8)).toEqual(true);
    });

    it("returns true if there are enough players for more than one game", () => {
      expect(continueTournament(10, 20)).toEqual(true);
    });
  });

  describe("assignParties", () => {
    it("returns an empty array given an empty pool", () => {
      expect(assignParties([])).toEqual([]);
    });

    it("returns an empty array given a pool of length 1", () => {
      expect(assignParties(players.slice(0, 1))).toEqual([]);
    });

    it("returns an empty array given a maximal size of 0", () => {
      expect(assignParties(players, 0)).toEqual([]);
    });

    it("assigns a pool of <= the maximum game size to a single game", () => {
      const fourPool = players.slice(0, 4);
      const threePool = players.slice(0, 3);
      const twoPool = players.slice(0, 2);
      expect(assignParties(fourPool)).toEqual([fourPool]);
      expect(assignParties(threePool)).toEqual([threePool]);
      expect(assignParties(twoPool)).toEqual([twoPool]);
    });

    it("assigns a pool divisible by the maximal size to equal sized games", () => {
      expect(assignParties(players, 2)).toEqual([
        players.slice(0, 2),
        players.slice(2, 4),
        players.slice(4, 6),
        players.slice(6, 8),
      ]);
    });

    it("assigns a pool that is not divisible by the maximal game size", () => {
      expect(assignParties(players, 3)).toEqual([
        players.slice(0, 3),
        players.slice(3, 6),
        players.slice(6, 8),
      ]);
    });
  });

  describe("asssignAndRunGames", () => {
    it("returns an empty array given an empty pool", () => {
      expect(assignAndRunGames([], boardParameters)).toEqual([]);
    });

    it("assigns games and then runs each game", () => {
      expect(assignAndRunGames(players, boardParameters)).toEqual([]);
    });
  });

  describe("informWinnersAndLosers", () => {
    let playerA: TournamentPlayer;
    let playerB: TournamentPlayer;

    beforeEach(() => {
      playerA = makeMockPlayer("a", 1, { wonTournament: jest.fn(() => true) });
      playerB = makeMockPlayer("b", 1, { wonTournament: jest.fn(() => true) });
    });

    it("should inform winners that they won and losers they lost", async () => {
      const players = [playerA, playerB];
      const winners = [playerA];

      const results = await informWinnersAndLosers(players, winners);
      expect(results).toStrictEqual([playerA]);
      expect(playerA.wonTournament).toHaveBeenCalledWith(true);
      expect(playerB.wonTournament).toHaveBeenCalledWith(false);
    });

    it("should turn winners into losers if they reject the results", async () => {
      const playerC = makeMockPlayer("c", 1, {
        wonTournament: jest.fn(() => false),
      });
      const players = [playerA, playerB, playerC];
      const winners = [playerA, playerC];

      const results = await informWinnersAndLosers(players, winners);
      expect(results).toStrictEqual([playerA]);
      expect(playerA.wonTournament).toHaveBeenCalledWith(true);
      expect(playerB.wonTournament).toHaveBeenCalledWith(false);
      expect(playerC.wonTournament).toHaveBeenCalledWith(true);
    });

    it("should turn winners into losers if they don't accept in time", async () => {
      const resolveTrueAfterDelay = () =>
        new Promise((resolve) => setTimeout(() => resolve(true), 10000));
      const playerC = makeMockPlayer("c", 1, {
        wonTournament: jest.fn(resolveTrueAfterDelay),
      });
      const players = [playerA, playerB, playerC];
      const winners = [playerA, playerC];

      const results = await informWinnersAndLosers(players, winners);
      expect(results).toStrictEqual([playerA]);
      expect(playerA.wonTournament).toHaveBeenCalledWith(true);
      expect(playerB.wonTournament).toHaveBeenCalledWith(false);
      expect(playerC.wonTournament).toHaveBeenCalledWith(true);
    });
  });

  describe("runTournamentRound", () => {
    let boardParams: BoardParameters;
    beforeEach(() => {
      boardParams = {
        rows: 2,
        cols: 5,
        numFish: 3,
      };
    });

    it("should produce empty results if everyone cheats", async () => {
      const badMovement = makeMovementFunction(0, 0, 0, 0);
      const playerA = makeMockPlayer("a", 1, {
        makeMovement: jest.fn(badMovement),
      });
      const playerB = makeMockPlayer("b", 1, {
        makeMovement: jest.fn(badMovement),
      });
      const playerC = makeMockPlayer("c", 1, {
        makeMovement: jest.fn(badMovement),
      });
      const playerD = makeMockPlayer("d", 1, {
        makeMovement: jest.fn(badMovement),
      });
      const players = [playerA, playerB, playerC, playerD];
      const mapping = makeTournamentPlayerMapping(players);

      const results = await runTournamentRound(players, boardParams);
      expect(results).toStrictEqual([]);
    });

    it("should produce both winners if two players tied in a game", async () => {
      const tiedMovement = makeMovementFunction(0, 5, 1, 5);
      const playerA = makeMockPlayer("a", 1, {
        makeMovement: jest.fn(tiedMovement),
      });
      const playerB = makeMockPlayer("b", 1, {});
    });
  });
});
