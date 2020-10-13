import { Board, PenguinColor } from "../types/board";
import { Player, Game } from "../types/state";
import {
  InvalidNumberOfPlayersError
} from "../types/errors";
import { sortPlayersByAge, createState } from "../src/stateModification";
import { createBlankBoard } from "../src/boardCreation"

describe("stateModification", () => {
  const player1: Player = { name: "foo", age: 20 };
  const player2: Player = { name: "bar", age: 30 };
  const player3: Player = { name: "baz", age: 45 };

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

  describe("createState", () => {
    const board: Board = createBlankBoard(2, 2, 1) as Board;
    const playerToColorMapping: Map<Player, PenguinColor> = new Map([
      [player1, PenguinColor.Black], 
      [player2, PenguinColor.Brown], 
      [player3, PenguinColor.Red]
    ]);

    it("rejects an empty list of players", () => {
      const players: Array<Player> = []
      expect(createState(players, playerToColorMapping, board)).toEqual(new InvalidNumberOfPlayersError(players.length));
    });

    it("rejects a single player", () => {
      const players: Array<Player> = [player1];
      expect(createState(players, playerToColorMapping, board)).toEqual(
        new InvalidNumberOfPlayersError(players.length)
      );
    })

    it("rejects a number of players greater than the maximum", () => {
      const players: Array<Player> = [player1, player2, player3, player3, player3];
      expect(createState(players, playerToColorMapping, board)).toEqual(new InvalidNumberOfPlayersError(players.length));
    });

    it("successfully creates a Game state with a number of players equal to the maximum", () => {
      const players: Array<Player> = [player2, player3, player3, player1];
      const expectedPlayerOrdering: Array<Player> = [player1, player2, player3, player3];
      const expectedGameState: Game = {
        players: expectedPlayerOrdering,
        board,
        curPlayer: player1,
        penguinPositions: new Map(),
        playerToColorMapping
      };

      expect(createState(players, playerToColorMapping, board)).toEqual(expectedGameState);
    });

    it("successfully creates a Game state with a number of players less than the maximum", () => {
      const players: Array<Player> = [player3, player2, player1];
      const expectedPlayerOrdering: Array<Player> = [player1, player2, player3];
      const expectedGameState: Game = {
        players: expectedPlayerOrdering,
        board, 
        curPlayer: player1,
        penguinPositions: new Map(), 
        playerToColorMapping
      }

      expect(createState(players, playerToColorMapping, board)).toEqual(expectedGameState);
    });
  })
});