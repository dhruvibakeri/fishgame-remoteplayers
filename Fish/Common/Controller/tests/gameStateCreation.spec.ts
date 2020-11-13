import { Board, BoardPosition, PenguinColor } from "../../board";
import { Player, Game, MovementGame } from "../../state";
import { IllegalGameStateError } from "../types/errors";
import {
  buildUnplacedPenguinMap,
  createEmptyPenguinPositions,
  createEmptyScoreSheet,
  createGameState,
  createTestGameState,
  isValidNumberOfPlayers,
  numOfPenguinsPerPlayer,
  shiftPlayers,
  skipToNextActivePlayer,
} from "../src/gameStateCreation";

import {
  createBlankBoard,
  createHoledOneFishBoard,
} from "../src/boardCreation";
import { placeAllPenguinsZigZag } from "../src/strategy";
import { Result } from "true-myth";
const { ok, err } = Result;

describe("gameStateCreation", () => {
  const player1: Player = { name: "foo", color: PenguinColor.Black };
  const player2: Player = { name: "bar", color: PenguinColor.Brown };
  const player3: Player = { name: "baz", color: PenguinColor.Red };
  const player4: Player = { name: "bat", color: PenguinColor.White };
  const samplePlayers: Array<Player> = [player1, player2, player3, player4];

  const board: Board = createBlankBoard(2, 2, 1).unsafelyUnwrap();

  describe("shiftPlayers", () => {
    it("shifts an array of length 1", () => {
      expect(shiftPlayers([player1])).toEqual([player1]);
    });

    it("shifts an array of length 2", () => {
      expect(shiftPlayers([player1, player2])).toEqual([player2, player1]);
    });

    it("shifts an array of length 4", () => {
      expect(shiftPlayers([player1, player2, player3, player4])).toEqual([
        player2,
        player3,
        player4,
        player1,
      ]);
    });

    it("handles multiple shifts", () => {
      expect(
        shiftPlayers(shiftPlayers([player1, player2, player3, player4]))
      ).toEqual([player3, player4, player1, player2]);
    });
  });

  describe("skipToNextActivePlayer", () => {
    const board: Board = createBlankBoard(4, 4, 1).unsafelyUnwrap();
    const boardNoMoves: Board = createHoledOneFishBoard(
      4,
      4,
      [
        { col: 0, row: 2 },
        { col: 1, row: 2 },
        { col: 2, row: 2 },
        { col: 3, row: 2 },
        { col: 0, row: 3 },
        { col: 1, row: 3 },
        { col: 2, row: 3 },
        { col: 3, row: 3 },
      ],
      1
    ).unsafelyUnwrap();
    const game: Game = createGameState(
      [player1, player2],
      board
    ).unsafelyUnwrap();
    const movementGame: MovementGame = placeAllPenguinsZigZag(
      game
    ).unsafelyUnwrap();
    const penguinPositionsSkipPlayer: Map<
      PenguinColor,
      Array<BoardPosition>
    > = new Map([
      [
        player1.color,
        [
          { col: 0, row: 0 },
          { col: 0, row: 1 },
          { col: 0, row: 2 },
          { col: 1, row: 0 },
        ],
      ],
      [
        player2.color,
        [
          { col: 2, row: 0 },
          { col: 1, row: 1 },
          { col: 1, row: 2 },
          { col: 0, row: 3 },
        ],
      ],
    ]);
    const movementGameSkipPlayer: MovementGame = {
      ...movementGame,
      penguinPositions: penguinPositionsSkipPlayer,
    };
    const movementGameNoMoves: MovementGame = {
      ...movementGame,
      board: boardNoMoves,
    };
    it("keeps the current player if they can move", () => {
      expect(skipToNextActivePlayer(movementGame)).toEqual(movementGame);
    });

    it("skips to the next player that can move", () => {
      const expectedGame: MovementGame = {
        ...movementGameSkipPlayer,
        players: shiftPlayers(movementGameSkipPlayer.players),
      };
      expect(skipToNextActivePlayer(movementGameSkipPlayer)).toEqual(
        expectedGame
      );
    });

    it("returns the original state if no players can move", () => {
      expect(skipToNextActivePlayer(movementGameNoMoves)).toEqual(
        movementGameNoMoves
      );
    });
  });

  describe("numOfPenguinsPerPlayer", () => {
    it("gives the right amount for 2 players", () => {
      expect(numOfPenguinsPerPlayer(2)).toEqual(4);
    });

    it("gives the right amount for 3 players", () => {
      expect(numOfPenguinsPerPlayer(3)).toEqual(3);
    });

    it("gives the right amount for 4 players", () => {
      expect(numOfPenguinsPerPlayer(4)).toEqual(2);
    });
  });

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
        err(
          new IllegalGameStateError(
            players,
            board,
            "Invalid number of players specified for game: 0"
          )
        )
      );
    });

    it("rejects a single player", () => {
      const players: Array<Player> = [player1];
      expect(createGameState(players, board)).toEqual(
        err(
          new IllegalGameStateError(
            players,
            board,
            "Invalid number of players specified for game: 1"
          )
        )
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
        err(
          new IllegalGameStateError(
            players,
            board,
            "Invalid number of players specified for game: 5"
          )
        )
      );
    });

    it("rejects an array of players with non-unique colors", () => {
      const players: Array<Player> = [player1, player2, player4, player2];
      expect(createGameState(players, board)).toEqual(
        err(
          new IllegalGameStateError(
            players,
            board,
            "Not all player colors are unique"
          )
        )
      );
    });

    it("successfully creates a Game state with a number of players equal to the maximum", () => {
      const players: Array<Player> = [player1, player2, player3, player4];
      const expectedGameState: Game = {
        players: players,
        board,
        remainingUnplacedPenguins: unplacedPenguins4Players,
        penguinPositions: createEmptyPenguinPositions(players),
        scores: createEmptyScoreSheet(players),
      };

      expect(createGameState(players, board)).toEqual(ok(expectedGameState));
    });

    it("successfully creates a Game state with a number of players less than the maximum", () => {
      const players: Array<Player> = [player1, player2, player3];
      const expectedGameState: Game = {
        players: players,
        board,
        remainingUnplacedPenguins: unplacedPenguins3Players,
        penguinPositions: createEmptyPenguinPositions(players),
        scores: createEmptyScoreSheet(players),
      };

      expect(createGameState(players, board)).toEqual(ok(expectedGameState));
    });
  });

  describe("createEmptyScoreSheet", () => {
    it("creates a score sheet for a given list of players", () => {
      const expectedScoreSheet: Map<PenguinColor, number> = new Map([
        [player1.color, 0],
        [player2.color, 0],
        [player3.color, 0],
        [player4.color, 0],
      ]);

      expect(createEmptyScoreSheet(samplePlayers)).toEqual(expectedScoreSheet);
    });

    it("creates an empty map for an empty array of players", () => {
      expect(createEmptyScoreSheet([])).toEqual(new Map());
    });
  });

  describe("isValidNumberOfPlayers", () => {
    it("rejects under the minimum", () => {
      expect(isValidNumberOfPlayers(1)).toEqual(false);
    });

    it("accepts the minimum", () => {
      expect(isValidNumberOfPlayers(2)).toEqual(true);
    });

    it("accepts within the bounds", () => {
      expect(isValidNumberOfPlayers(3)).toEqual(true);
    });

    it("accepts the maximum", () => {
      expect(isValidNumberOfPlayers(4)).toEqual(true);
    });

    it("rejects above the maximum", () => {
      expect(isValidNumberOfPlayers(5)).toEqual(false);
    });
  });

  describe("createEmptyPenguinPositions", () => {
    it("creates an empty penguin position mapping for each player", () => {
      const expectedPenguinPositions: Map<
        PenguinColor,
        Array<BoardPosition>
      > = new Map([
        [player1.color, []],
        [player2.color, []],
        [player3.color, []],
        [player4.color, []],
      ]);

      expect(createEmptyPenguinPositions(samplePlayers)).toEqual(
        expectedPenguinPositions
      );
    });

    it("creates an empty map for an empty array of players", () => {
      expect(createEmptyPenguinPositions([])).toEqual(new Map());
    });
  });

  describe("createTestGameState", () => {
    const samplePlayer1: Player = { name: "foo", color: PenguinColor.Black };
    const samplePlayer2: Player = { name: "bar", color: PenguinColor.Brown };
    const samplePlayers: Array<Player> = [samplePlayer1, samplePlayer2];
    const expectedGameState = createGameState(samplePlayers, board);

    it("creates test game state", () => {
      expect(createTestGameState(board)).toEqual(expectedGameState);
    });
  });
});
