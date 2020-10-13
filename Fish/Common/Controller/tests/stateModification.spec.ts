import { Board, BoardPosition, Penguin, PenguinColor } from "../types/board";
import { Player, Game } from "../types/state";
import {
  IllegalPenguinPositionError,
  InvalidGameStateError,
  InvalidNumberOfPlayersError, InvalidPositionError
} from "../types/errors";
import { sortPlayersByAge, createState, movePenguinInPenguinPositions, movePenguin } from "../src/stateModification";
import { createBlankBoard, createHoledOneFishBoard } from "../src/boardCreation"

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
  });

  describe("movePenguinInPenguinPosition", () => {
    it("removes the start position from the positions and maps the end position to the penguin", () => {
      const startPosition: BoardPosition = { col: 0, row: 0 };
      const endPosition: BoardPosition = { col: 0, row: 1 };
      const penguin: Penguin = { color: PenguinColor.Red };
      const initialPenguinPositions: Map<BoardPosition, Penguin> = new Map([[startPosition, penguin]]);
      const expectedPenguinPositions: Map<BoardPosition, Penguin> = new Map([[endPosition, penguin]]);
      expect(movePenguinInPenguinPositions(initialPenguinPositions, penguin, startPosition, endPosition)).toEqual(expectedPenguinPositions);
    });
  });

  describe("movePenguin", () => {
    const player1: Player = { name: "foo", age: 20 };
    const player2: Player = { name: "bar", age: 30 };
    const player3: Player = { name: "baz", age: 42 };
    const players: Array<Player> = [player1, player2];
    const playerToColorMapping: Map<Player, PenguinColor> = new Map([
      [player1, PenguinColor.Black], 
      [player2, PenguinColor.Brown]
    ]);
    const holePosition: BoardPosition = { col: 1, row: 0 };
    const holePositions: Array<BoardPosition> = [holePosition];
    const validStartPosition: BoardPosition = { col: 0, row: 0 };
    const validEndPosition: BoardPosition = { col: 0, row: 1 };
    const board: Board = createHoledOneFishBoard(2, 2, holePositions, 1) as Board;
    const player1Penguin: Penguin = { color: PenguinColor.Black };
    const penguinPositions: Map<BoardPosition, Penguin> = new Map([[validStartPosition, player1Penguin]]);
    const game: Game = {
      ...createState(players, playerToColorMapping, board) as Game,
      penguinPositions
    };

    it("rejects a start position not on the board", () => {
      const invalidStartPosition: BoardPosition = { col: 2, row: 2 };
      const expectedError = new InvalidPositionError(board, invalidStartPosition);
      expect(movePenguin(game, player1, invalidStartPosition, validEndPosition)).toEqual(expectedError);
    });

    it("rejects an end position not on the board", () => {
      const invalidEndPosition: BoardPosition = { col: 3, row: 3 };
      const expectedError = new InvalidPositionError(board, invalidEndPosition);
      expect(movePenguin(game, player1, validStartPosition, invalidEndPosition)).toEqual(expectedError);
    });

    it("rejects a player without a penguin color mapping", () => {
      const expectedError = new InvalidGameStateError(game);
      expect(movePenguin(game, player3, validStartPosition, validEndPosition)).toEqual(expectedError);
    });

    it("rejects a player trying to move from from a starting position not containing one of their penguins", () => {
      const invalidStartPosition: BoardPosition = { col: 1, row: 1 };
      const expectedError = new IllegalPenguinPositionError(game, player1, invalidStartPosition, validEndPosition);
      expect(movePenguin(game, player1, invalidStartPosition, validEndPosition)).toEqual(expectedError);
    });

    it("rejects a player trying to move to a position not reachable from the start", () => {
      const invalidEndPosition: BoardPosition = { col: 1, row: 1 };
      const expectedError = new IllegalPenguinPositionError(game, player1, validStartPosition, invalidEndPosition);
      expect(movePenguin(game, player1, validStartPosition, invalidEndPosition)).toEqual(expectedError);
    });

    it("rejects a player trying to move to a hole", () => {
      const expectedError = new IllegalPenguinPositionError(game, player1, validEndPosition, holePosition);
      expect(movePenguin(game, player1, validEndPosition, holePosition)).toEqual(expectedError);
    });

    it("rejects a player trying to move to a position with another penguin present", () => {
      const twoPenguinPositions: Map<BoardPosition, Penguin> = new Map(penguinPositions);
      twoPenguinPositions.set(validEndPosition, { color: PenguinColor.White });
      const gameWithTwoPenguins: Game = {
        ...game,
        penguinPositions: twoPenguinPositions
      };
      const expectedError = new IllegalPenguinPositionError(game, player1, validStartPosition, validEndPosition);
      expect(movePenguin(gameWithTwoPenguins, player1, validStartPosition, validEndPosition)).toEqual(expectedError);
    });

    it("accepts a valid move, updating and returning the game state", () => {
      const expectedPenguinPositions: Map<BoardPosition, Penguin> = new Map([[validEndPosition, player1Penguin]]);
      const expectedGameState: Game = {
        ...game,
        penguinPositions: expectedPenguinPositions
      };
      expect(movePenguin(game, player1, validStartPosition, validEndPosition)).toEqual(expectedGameState);
    });
  });
});