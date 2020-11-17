import {
  DisqualifyMe,
  GameHasEnded,
  GameIsStarting,
  MakeMovement,
  MakePlacement,
  TournamentPlayer, TournamentPlayerWithAge,
} from "../../player-interface";
import { runTournamentRound, informWinnersAndLosers, makeTournamentPlayerMapping } from "../src/manager";
import {createSamplePlayer} from "../../../Player/player";
import {InputDepth} from "../src/testHarnessInput";
import {Movement} from "../../game-tree";
import {BoardParameters} from "../src/referee";

describe('manager tests', () => {
  const makeMockPlayer = (name: string, depth: InputDepth, properties: Record<string, any>): TournamentPlayer => {
    return {
      ...createSamplePlayer(name, depth),
      ...properties,
    }
  }

  const makeMovementFunction = (srcRow: number, srcCol: number, destRow: number, destCol: number) =>
      ():Movement => ({ startPosition: { row: srcRow, col: srcCol }, endPosition: { row: destRow, col: destCol } });

  describe('informWinnersAndLosers', () => {
    let playerA: TournamentPlayer;
    let playerB: TournamentPlayer;

    beforeEach(() => {
      playerA = makeMockPlayer("a", 1, { wonTournament: jest.fn(() => true) });
      playerB = makeMockPlayer("b", 1, { wonTournament: jest.fn(() => true) });
    })

    it('should inform winners that they won and losers they lost', async () => {
      const players = [playerA, playerB];
      const winners = [playerA];

      const results = await informWinnersAndLosers(players, winners);
      expect(results).toStrictEqual([playerA]);
      expect(playerA.wonTournament).toHaveBeenCalledWith(true);
      expect(playerB.wonTournament).toHaveBeenCalledWith(false);
    });

    it('should turn winners into losers if they reject the results', async () => {
      const playerC = makeMockPlayer("c", 1, { wonTournament: jest.fn(() => false) });
      const players = [playerA, playerB, playerC];
      const winners = [playerA, playerC];

      const results = await informWinnersAndLosers(players, winners);
      expect(results).toStrictEqual([playerA]);
      expect(playerA.wonTournament).toHaveBeenCalledWith(true);
      expect(playerB.wonTournament).toHaveBeenCalledWith(false);
      expect(playerC.wonTournament).toHaveBeenCalledWith(true);
    });

    it('should turn winners into losers if they don\'t accept in time', async () => {
      const resolveTrueAfterDelay = () => new Promise((resolve) => setTimeout(() => resolve(true), 10000));
      const playerC = makeMockPlayer("c", 1, { wonTournament: jest.fn(resolveTrueAfterDelay)});
      const players = [playerA, playerB, playerC];
      const winners = [playerA, playerC];

      const results = await informWinnersAndLosers(players, winners);
      expect(results).toStrictEqual([playerA]);
      expect(playerA.wonTournament).toHaveBeenCalledWith(true);
      expect(playerB.wonTournament).toHaveBeenCalledWith(false);
      expect(playerC.wonTournament).toHaveBeenCalledWith(true);
    });
  });

  describe('runTournamentRound', () => {
    let boardParams: BoardParameters;
    beforeEach(() => {
      boardParams = {
        rows: 2,
        cols: 5,
        numFish: 3,
      }
    })

    it('should produce empty results if everyone cheats', async () => {
      const badMovement = makeMovementFunction(0, 0, 0, 0);
      const playerA = makeMockPlayer("a", 1, { makeMovement: jest.fn(badMovement) });
      const playerB = makeMockPlayer("b", 1, { makeMovement: jest.fn(badMovement) });
      const playerC = makeMockPlayer("c", 1, { makeMovement: jest.fn(badMovement) });
      const playerD = makeMockPlayer("d", 1, { makeMovement: jest.fn(badMovement) });
      const players = [playerA, playerB, playerC, playerD];
      const mapping = makeTournamentPlayerMapping(players);

      const results = await runTournamentRound(players, boardParams, mapping);
      expect(results).toStrictEqual([]);
    });

    it('should produce both winners if two players tied in a game', async () => {
      const tiedMovement = makeMovementFunction(0, 5, 1, 5);
      const playerA = makeMockPlayer("a", 1, { makeMovement: jest.fn(tiedMovement)});
      const playerB = makeMockPlayer("b", 1, {});

    })

  });
});