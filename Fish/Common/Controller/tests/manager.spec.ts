import {
  DisqualifyMe,
  GameDebrief,
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

  const makePlayers = (numOfPlayers: number): Array<TournamentPlayer> =>
    [...Array(numOfPlayers).keys()]
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
      expect(assignParties(makePlayers(1).slice(0, 1))).toEqual([]);
    });

    it("assigns a pool of <= the maximum game size to a single game", () => {
      const fourPool = makePlayers(4);
      const threePool = makePlayers(3);
      const twoPool = makePlayers(2);
      expect(assignParties(fourPool)).toEqual([fourPool]);
      expect(assignParties(threePool)).toEqual([threePool]);
      expect(assignParties(twoPool)).toEqual([twoPool]);
    });

    it("assigns a pool divisible by the maximal size to equal sized games", () => {
      const players = makePlayers(8);
      expect(assignParties(players)).toEqual([
        players.slice(0, 4),
        players.slice(4, 8),
      ]);
    });

    it("assigns pools with a remainder of 1", () => {
      const players = makePlayers(13);
      const actual = assignParties(players);
      expect(assignParties(players)).toEqual([
        players.slice(0, 4), // 4 players
        players.slice(4, 8), // 4 players
        players.slice(8, 11), // 3 players
        players.slice(11, 13), // 2 players
      ]);
    });

    it("assigns pools with a remainder of 2", () => {
      const players = makePlayers(14);
      const actual = assignParties(players);
      expect(assignParties(players)).toEqual([
        players.slice(0, 4), // 4 players
        players.slice(4, 8), // 4 players
        players.slice(8, 11), // 3 players
        players.slice(11, 14), // 3 players
      ]);
    });

    it("assigns pools with a remainder of 3", () => {
      const players = makePlayers(15);
      const actual = assignParties(players);
      expect(assignParties(players)).toEqual([
        players.slice(0, 4), // 4 players
        players.slice(4, 8), // 4 players
        players.slice(8, 11), // 3 players
        players.slice(11, 13), // 2 players
        players.slice(13, 15), // 2 players
      ]);
    });
  });

  describe("asssignAndRunGames", () => {
    it("returns an empty array given an empty pool", () => {
      expect(assignAndRunGames([], boardParameters)).toEqual([]);
    });

    it("assigns games and then runs each game", () => {
      const players = makePlayers(7);
      const expectedGameDebrief1: GameDebrief = {
        activePlayers: [
          { name: players[0].name, score: 3 },
          { name: players[1].name, score: 2 },
          { name: players[2].name, score: 2 },
        ],
        kickedPlayers: [],
      };
      const expectedGameDebrief2: GameDebrief = {
        activePlayers: [
          { name: players[3].name, score: 4 },
          { name: players[4].name, score: 4 },
        ],
        kickedPlayers: [],
      };
      const expectedGameDebrief3: GameDebrief = {
        activePlayers: [
          { name: players[5].name, score: 4 },
          { name: players[6].name, score: 4 },
        ],
        kickedPlayers: [],
      };
      const actual = assignAndRunGames(players, boardParameters);
      expect(actual[0]).resolves.toEqual(expectedGameDebrief1);
      expect(actual[1]).resolves.toEqual(expectedGameDebrief2);
      expect(actual[2]).resolves.toEqual(expectedGameDebrief3);
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

      const results = await runTournamentRound(players, boardParams);
      expect(results).toStrictEqual([]);
    });

    it("should produce both winners if two players tied in a game", async () => {
      const tiedMovement = makeMovementFunction(0, 4, 1, 4);
      const playerA = makeMockPlayer("a", 1, {
        makeMovement: jest.fn(tiedMovement),
      });
      const playerB = makeMockPlayer("b", 1, {});
      const results = await runTournamentRound([playerA, playerB], boardParams);
      expect(results).toStrictEqual([playerA, playerB]);
    });

    it("should combine winners of two separate games", async () => {
      const playerA = makeMockPlayer("a", 1, {});
      const playerB = makeMockPlayer("b", 1, {});
      const playerC = makeMockPlayer("c", 1, {});
      const playerD = makeMockPlayer("d", 1, {});
      const playerE = makeMockPlayer("e", 1, {});

      const players = [playerA, playerB, playerC, playerD, playerE];

      const results = await runTournamentRound(players, boardParams);
      expect(results).toStrictEqual([playerB, playerD]);
    });

    it("should produce winners in the order given", async () => {
      const playerA = makeMockPlayer("a", 1, {});
      const playerB = makeMockPlayer("b", 1, {});
      const playerC = makeMockPlayer("c", 1, {});
      const playerD = makeMockPlayer("d", 1, {});

      const players = [playerA, playerB, playerC, playerD];

      const boardParams: BoardParameters = {
        rows: 3,
        cols: 5,
        holes: [{ row: 2, col: 4 }],
      };
      const results = await runTournamentRound(players, boardParams);
      expect(results).toStrictEqual([playerA, playerD]);
    });
  });
});
