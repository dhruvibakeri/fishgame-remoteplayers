import {
  GameDebrief,
  TournamentPlayer,
} from "../../player-interface";
import {
  runTournamentRound,
  informWinnersAndLosers,
  continueTournament,
  assignParties,
  assignAndRunGames,
  runTournament,
} from "../src/manager";
import { createSamplePlayer } from "../../../Player/player";
import { InputDepth } from "../src/testHarnessInput";
import { Movement } from "../../game-tree";
import { BoardParameters } from "../src/referee";
import { IllegalBoardError, IllegalTournamentError } from "../types/errors";
import { Result } from "true-myth";

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

  const makePlayersWithProperties = (listOfProperties: Array<Record<string, any>>): Array<TournamentPlayer> => {
    return listOfProperties.map((properties, index) => {
      return makeMockPlayer(index.toString(), 1, { ...properties });
    })
  }

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
      expect(assignParties(players)).toEqual([
        players.slice(0, 4), // 4 players
        players.slice(4, 8), // 4 players
        players.slice(8, 11), // 3 players
        players.slice(11, 13), // 2 players
      ]);
    });

    it("assigns pools with a remainder of 2", () => {
      const players = makePlayers(14);
      expect(assignParties(players)).toEqual([
        players.slice(0, 4), // 4 players
        players.slice(4, 8), // 4 players
        players.slice(8, 12), // 4 players
        players.slice(12, 14), // 2 players
      ]);
    });

    it("assigns pools with a remainder of 3", () => {
      const players = makePlayers(15);
      expect(assignParties(players)).toEqual([
        players.slice(0, 4), // 4 players
        players.slice(4, 8), // 4 players
        players.slice(8, 12), // 4 players
        players.slice(12, 15), // 3 players
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
          { name: players[0].name, score: 2 },
          { name: players[1].name, score: 2 },
          { name: players[2].name, score: 2 },
          { name: players[3].name, score: 2 },
        ],
        kickedPlayers: [],
      };
      const expectedGameDebrief2: GameDebrief = {
        activePlayers: [
          { name: players[4].name, score: 3 },
          { name: players[5].name, score: 2 },
          { name: players[6].name, score: 2 },
        ],
        kickedPlayers: [],
      };
      const actual = assignAndRunGames(players, boardParameters);
      expect(actual[0]).resolves.toEqual(expectedGameDebrief1);
      expect(actual[1]).resolves.toEqual(expectedGameDebrief2);
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
      const winners = [playerA];
      const losers = [playerB];

      const results = await informWinnersAndLosers(winners, losers);
      expect(results).toStrictEqual([playerA]);
      expect(playerA.wonTournament).toHaveBeenCalledWith(true);
      expect(playerB.wonTournament).toHaveBeenCalledWith(false);
    });

    it("should turn winners into losers if they reject the results", async () => {
      const playerC = makeMockPlayer("c", 1, {
        wonTournament: jest.fn(() => false),
      });
      const winners = [playerA, playerC];
      const losers = [playerB];

      const results = await informWinnersAndLosers(winners, losers);
      expect(results).toStrictEqual([playerA]);
      expect(playerA.wonTournament).toHaveBeenCalledWith(true);
      expect(playerB.wonTournament).toHaveBeenCalledWith(false);
      expect(playerC.wonTournament).toHaveBeenCalledWith(true);
    });

    it("should turn winners into losers if they don't accept in time", async () => {
      jest.setTimeout(15000);
      const resolveTrueAfterDelay = () =>
        new Promise((resolve) => setTimeout(() => resolve(true), 20000));
      const playerC = makeMockPlayer("c", 1, {
        wonTournament: jest.fn(resolveTrueAfterDelay),
      });
      const winners = [playerA, playerC];
      const losers = [playerB];

      const results = await informWinnersAndLosers(winners, losers);
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
      const badMovement = { makeMovement: jest.fn(makeMovementFunction(0, 0, 0, 0)) };
      const players = makePlayersWithProperties([badMovement, badMovement, badMovement, badMovement])

      const results = await runTournamentRound(players, boardParams);
      expect(results).toStrictEqual({
        cheaters: players,
        winners: [],
        losers: [],
      });
    });

    it("should produce both winners if two players tied in a game", async () => {
      const tiedMovement = makeMovementFunction(0, 4, 1, 4);
      const playerA = makeMockPlayer("a", 1, {
        makeMovement: jest.fn(tiedMovement),
      });
      const playerB = makeMockPlayer("b", 1, {});
      const results = await runTournamentRound([playerA, playerB], boardParams);
      expect(results).toStrictEqual({
        winners: [playerA, playerB],
        losers: [],
        cheaters: [],
      });
    });

    it("should combine winners of two separate games", async () => {
      const playerA = makeMockPlayer("a", 1, {});
      const playerB = makeMockPlayer("b", 1, {});
      const playerC = makeMockPlayer("c", 1, {});
      const playerD = makeMockPlayer("d", 1, {});
      const playerE = makeMockPlayer("e", 1, {});

      const players = [playerA, playerB, playerC, playerD, playerE];

      const results = await runTournamentRound(players, boardParams);
      expect(results).toStrictEqual({
        winners: [playerB, playerD],
        losers: [playerA, playerC, playerE],
        cheaters: [],
      });
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
      expect(results).toStrictEqual({
        winners: [playerA, playerD],
        losers: [playerB, playerC],
        cheaters: [],
      });
    });
  });

  describe("runTournament", () => {
    let boardParams: BoardParameters;
    beforeEach(() => {
      boardParams = {
        rows: 5,
        cols: 2,
      };
    })

    it("rejects a specified board with less than 9 tiles", () => {
      const invalidBoardParameters: BoardParameters = {
        rows: 2,
        cols: 2,
      };
      expect(runTournament(invalidBoardParameters, makePlayers(4))).toEqual(
        new Result.Err(new IllegalBoardError(2, 2))
      );
    });

    it("rejects a single tournament player", () => {
      const players = makePlayers(1);
      expect(runTournament(boardParameters, players)).toEqual(
        new Result.Err(new IllegalTournamentError(boardParameters, players))
      );
    });

    it("rejects no tournament players", () => {
      expect(runTournament(boardParameters, [])).toEqual(
        new Result.Err(new IllegalTournamentError(boardParameters, []))
      );
    });

    it("produces a winner from one final game", async () => {
      const players = makePlayers(7);
      const results = await runTournament(boardParameters, players).unsafelyUnwrap();
      expect(results).toStrictEqual({ cheatingOrFailingPlayers: [], winners: [players[0].name] });
    });

    it("recognizes a single winner from a game if all other games produce no winners", async () => {
      const badMovement = { makeMovement: jest.fn(makeMovementFunction(0, 0, 0, 0)) };
      const defaultProperties = {};
      const players = makePlayersWithProperties([defaultProperties, defaultProperties, defaultProperties, badMovement, badMovement]);
      const results = await runTournament(boardParams, players).unsafelyUnwrap();
      expect(results).toStrictEqual({ winners: [players[0].name], cheatingOrFailingPlayers: [players[3].name, players[4].name]});
    });

    it("produces an empty result if there are no winners", async () => {
      const badMovement = { makeMovement: jest.fn(makeMovementFunction(0, 0, 0, 0)) };
      const players = makePlayersWithProperties([badMovement, badMovement, badMovement, badMovement, badMovement, badMovement, badMovement, badMovement]);
      const results = await runTournament(boardParams, players).unsafelyUnwrap();
      expect(results).toStrictEqual({ winners: [], cheatingOrFailingPlayers: players.map(player => player.name) })
    });

    it("produces winners if two rounds in a row produce the same exact winners", async () => {
      const players = makePlayers(4);
      const boardParams: BoardParameters = {
        rows: 4,
        cols: 4,
      };
      const results = await runTournament(boardParams, players).unsafelyUnwrap();
      expect(results).toStrictEqual({ winners: players.map(p => p.name), cheatingOrFailingPlayers: [] });
    });

    it("should run multiple tournament rounds if there is enough players for another round", async () => {
      const players = makePlayers(15);
      const results = await runTournament(boardParams, players).unsafelyUnwrap();
      expect(results).toStrictEqual({ winners: [players[0].name], cheatingOrFailingPlayers: [] });
    });
  });
});
