import { Board, BoardPosition, PenguinColor } from "../../board";
import { Player, Game, MovementGame } from "../../state";
import {
  InvalidGameStateError,
  InvalidNumberOfPlayersError,
} from "../types/errors";
import {
  buildUnplacedPenguinMap,
  createEmptyPenguinPositions,
  createEmptyScoreSheet,
  createGameState,
  createTestGameState,
  getNextPlayerIndex,
  skipToNextActivePlayer,
} from "../src/gameStateCreation";

import {
  createBlankBoard,
  createHoledOneFishBoard,
} from "../src/boardCreation";
import { placeAllPenguinsZigZag } from "../../../Player/strategy";

describe("gameStateCreation", () => {
  const player1: Player = { name: "foo", color: PenguinColor.Black };
  const player2: Player = { name: "bar", color: PenguinColor.Brown };
  const player3: Player = { name: "baz", color: PenguinColor.Red };
  const player4: Player = { name: "bat", color: PenguinColor.White };
  const players: Array<Player> = [player1, player2, player3, player4];

  const board: Board = createBlankBoard(2, 2, 1) as Board;

  describe("getNextPlayerIndex", () => {
    const board: Board = createBlankBoard(3, 3, 1) as Board;
    const game: Game = createTestGameState(board) as Game;

    it("gets the next player index", () => {
      expect(getNextPlayerIndex(game)).toEqual(1);
    });

    it("wraps to the start after the last player", () => {
      const lastPlayerTurnGame: Game = {
        ...game,
        curPlayerIndex: game.players.length - 1,
      };
      expect(getNextPlayerIndex(lastPlayerTurnGame)).toEqual(0);
    });
  });

  describe("skipToNextActivePlayer", () => {
    const board: Board = createBlankBoard(4, 4, 1) as Board;
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
    ) as Board;
    const game: Game = createGameState([player1, player2], board) as Game;
    const movementGame: MovementGame = placeAllPenguinsZigZag(
      game
    ) as MovementGame;
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
        curPlayerIndex: 1,
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

    it("rejects an array of players with non-unique colors", () => {
      const players: Array<Player> = [player1, player2, player4, player2];
      expect(createGameState(players, board)).toEqual(
        new InvalidGameStateError()
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

  describe("createEmptyScoreSheet", () => {
    it("creates a score sheet for a given list of players", () => {
      const expectedScoreSheet: Map<PenguinColor, number> = new Map([
        [player1.color, 0],
        [player2.color, 0],
        [player3.color, 0],
        [player4.color, 0],
      ]);

      expect(createEmptyScoreSheet(players)).toEqual(expectedScoreSheet);
    });

    it("creates an empty map for an empty array of players", () => {
      expect(createEmptyScoreSheet([])).toEqual(new Map());
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

      expect(createEmptyPenguinPositions(players)).toEqual(
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
