import {
  boardIsBigEnough,
  createGameDebrief,
  createInitialGameState,
  gameIsFinished,
  notifyPlayersGameStarting,
  notifyPlayersOfOutcome,
  RefereeState,
  RefereeStateWithMovementGame,
  disqualifyCurrentCheatingPlayer,
  disqualifyCurrentFailingPlayer,
  disqualifyCurrentPlayer,
  removeDisqualifiedPlayerFromGame,
  runMovementTurn,
  runPlacementRounds,
  runPlacementTurn,
  tournamentPlayersToGamePlayers,
  runMovementRounds,
  addScoresOfPlacedPenguins,
  numberOfPenguinPlacements,
  runGame,
} from "../src/referee";
import { GameDebrief, TournamentPlayer } from "../../player-interface";
import { createSamplePlayer } from "../../../Player/player";
import { Game, MovementGame, Player } from "../../state";
import { Board, BoardPosition, PenguinColor } from "../../board";
import {
  createHoledOneFishBoard,
  createNumberedBoard,
} from "../src/boardCreation";
import { createGameState, shiftPlayers } from "../src/gameStateCreation";
import { Movement } from "../../game-tree";
import { IllegalBoardError, IllegalGameStateError } from "../types/errors";
import { Result } from "true-myth";
import {GameObserver} from "../src/gameObserver-interface";
const { ok, err } = Result;

interface IteratorResponse<T> {
  readonly value?: T;
  readonly done: boolean;
}

const delay = async <T>(ret: T, timeout: number): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, timeout));
  return ret;
};

const actionIterator = <T>(actions: Array<T>) => {
  let nextIndex = 0;

  const iterator = {
    next: (): IteratorResponse<T> => {
      let result: IteratorResponse<T>;
      if (nextIndex < actions.length) {
        result = { value: actions[nextIndex], done: false };
        nextIndex++;
        return result;
      } else {
        return { done: true };
      }
    },
  };

  return iterator;
};

afterAll((done) => {
  done();
});

const createDummyPlayer = (
  name: string,
  placements: Array<BoardPosition>,
  moves: Array<Movement>,
  timeout = 0
): TournamentPlayer => {
  const placementIterator = actionIterator<BoardPosition>(placements);
  const movesIterator = actionIterator<Movement>(moves);

  return {
    name,
    gameIsStarting: jest.fn(),
    makePlacement: () => delay(placementIterator.next().value, timeout),
    makeMovement: () => delay(movesIterator.next().value, timeout),
    gameHasEnded: jest.fn(),
    disqualifyMe: jest.fn(),
    wonTournament: jest.fn(),
    assignColor: jest.fn(),
    playingAgainst: jest.fn(),
    tournamentIsStarting: jest.fn(),
  };
};

describe("referee", () => {
  const player1Name = "1";
  const player2Name = "2";
  const player3Name = "3";
  const player4Name = "4";
  const tournamentPlayer1: TournamentPlayer = createSamplePlayer(player1Name);
  const tournamentPlayer2: TournamentPlayer = createSamplePlayer(player2Name);
  const tournamentPlayer3: TournamentPlayer = createSamplePlayer(player3Name);
  const tournamentPlayer4: TournamentPlayer = createSamplePlayer(player4Name);
  const player1: Player = {
    name: player1Name,
    color: PenguinColor.Red,
  };
  const player2: Player = {
    name: player2Name,
    color: PenguinColor.White,
  };
  const player3: Player = {
    name: player3Name,
    color: PenguinColor.Brown,
  };
  const player4: Player = {
    name: player4Name,
    color: PenguinColor.Black,
  };
  const twoTournamentPlayers: Array<TournamentPlayer> = [
    tournamentPlayer1,
    tournamentPlayer2,
  ];
  const fourTournamentPlayers: Array<TournamentPlayer> = [
    tournamentPlayer1,
    tournamentPlayer2,
    tournamentPlayer3,
    tournamentPlayer4,
  ];

  const numberedBoard: Board = createNumberedBoard([
    [1, 3, 5, 4],
    [3, 2, 4, 1],
    [2, 3, 5, 1],
    [4, 1, 1, 2],
  ]).unsafelyUnwrap();
  const numberedGame = createGameState(
    [player1, player2],
    numberedBoard
  ).unsafelyUnwrap();

  const player1TwoGamePosition1: BoardPosition = {
    col: 0,
    row: 0,
  };
  const player1TwoGamePosition2: BoardPosition = {
    col: 1,
    row: 0,
  };
  const player1TwoGamePosition3: BoardPosition = {
    col: 0,
    row: 3,
  };
  const player1TwoGamePosition4: BoardPosition = {
    col: 3,
    row: 1,
  };

  const player2TwoGamePosition1: BoardPosition = {
    col: 2,
    row: 0,
  };
  const player2TwoGamePosition2: BoardPosition = {
    col: 3,
    row: 0,
  };
  const player2TwoGamePosition3: BoardPosition = {
    col: 1,
    row: 1,
  };
  const player2TwoGamePosition4: BoardPosition = {
    col: 2,
    row: 3,
  };
  const player1TwoGamePlacements: Array<BoardPosition> = [
    player1TwoGamePosition1,
    player1TwoGamePosition2,
    player1TwoGamePosition3,
    player1TwoGamePosition4,
  ];
  const player2TwoGamePlacements: Array<BoardPosition> = [
    player2TwoGamePosition1,
    player2TwoGamePosition2,
    player2TwoGamePosition3,
    player2TwoGamePosition4,
  ];
  const player2TwoGamePlacementsDuplicate: Array<BoardPosition> = [
    player2TwoGamePosition1,
    player2TwoGamePosition1,
    player2TwoGamePosition3,
    player2TwoGamePosition4,
  ];
  const player1TwoGameMovement1: Movement = {
    startPosition: player1TwoGamePosition1,
    endPosition: { col: 0, row: 1 },
  };
  const player1TwoGameMovement2: Movement = {
    startPosition: player1TwoGamePosition3,
    endPosition: { col: 0, row: 2 },
  };
  const player1TwoGameMovement3: Movement = {
    startPosition: player1TwoGamePosition4,
    endPosition: { col: 3, row: 3 },
  };
  const player1TwoGameMovement4: Movement = {
    startPosition: { col: 3, row: 3 },
    endPosition: { col: 2, row: 1 },
  };
  const player2TwoGameMovement1: Movement = {
    startPosition: player2TwoGamePosition3,
    endPosition: { col: 1, row: 2 },
  };
  const player2TwoGameMovement2: Movement = {
    startPosition: { col: 1, row: 2 },
    endPosition: { col: 1, row: 3 },
  };
  const player2TwoGameMovement3: Movement = {
    startPosition: { col: 1, row: 3 },
    endPosition: { col: 2, row: 2 },
  };
  const player2TwoGameMovement4: Movement = {
    startPosition: player2TwoGamePosition2,
    endPosition: { col: 3, row: 2 },
  };
  const player1TwoGameMovements: Array<Movement> = [
    player1TwoGameMovement1,
    player1TwoGameMovement2,
    player1TwoGameMovement3,
    player1TwoGameMovement4,
  ];
  const player2TwoGameMovements: Array<Movement> = [
    player2TwoGameMovement1,
    player2TwoGameMovement2,
    player2TwoGameMovement3,
    player2TwoGameMovement4,
  ];
  const twoGamePenguinPositionsAfterPlacements: Map<
    PenguinColor,
    Array<BoardPosition>
  > = new Map([
    [
      player1.color,
      [
        { col: 0, row: 0 },
        { col: 1, row: 0 },
        { col: 0, row: 3 },
        { col: 3, row: 1 },
      ],
    ],
    [
      player2.color,
      [
        { col: 2, row: 0 },
        { col: 3, row: 0 },
        { col: 1, row: 1 },
        { col: 2, row: 3 },
      ],
    ],
  ]);
  const twoGamePenguinPositionsAfterPlacementsKickPlayer2: Map<
    PenguinColor,
    Array<BoardPosition>
  > = new Map([
    [
      player1.color,
      [
        { col: 0, row: 0 },
        { col: 1, row: 0 },
        { col: 0, row: 3 },
        { col: 3, row: 1 },
      ],
    ],
  ]);
  const twoGameNoUnplacedPenguins: Map<PenguinColor, 0> = new Map([
    [player1.color, 0],
    [player2.color, 0],
  ]);
  const twoGameNoUnplacedPenguinsKickPlayer2: Map<PenguinColor, 0> = new Map([
    [player1.color, 0],
  ]);
  const twoGameScoresKickPlayer2: Map<PenguinColor, number> = new Map([
    [player1.color, 0],
  ]);
  const twoGameAfterPlacements: MovementGame = {
    ...numberedGame,
    remainingUnplacedPenguins: twoGameNoUnplacedPenguins,
    penguinPositions: twoGamePenguinPositionsAfterPlacements,
  };
  const twoGameAfterPlacementsKickPlayer2: MovementGame = {
    ...numberedGame,
    players: [player1],
    remainingUnplacedPenguins: twoGameNoUnplacedPenguinsKickPlayer2,
    penguinPositions: twoGamePenguinPositionsAfterPlacementsKickPlayer2,
    scores: twoGameScoresKickPlayer2,
  };
  const twoGameFinalBoard: Board = createNumberedBoard([
    [0, 3, 5, 0],
    [3, 0, 4, 0],
    [2, 0, 5, 1],
    [0, 0, 1, 0],
  ]).unsafelyUnwrap();
  const twoGameFinalPenguinPositions: Map<
    PenguinColor,
    Array<BoardPosition>
  > = new Map([
    [
      player1.color,
      [
        { col: 1, row: 0 },
        { col: 0, row: 1 },
        { col: 0, row: 2 },
        { col: 2, row: 1 },
      ],
    ],
    [
      player2.color,
      [
        { col: 2, row: 0 },
        { col: 2, row: 3 },
        { col: 2, row: 2 },
        { col: 3, row: 2 },
      ],
    ],
  ]);
  const twoGameFinalScores: Map<PenguinColor, number> = new Map([
    [player1.color, 8],
    [player2.color, 10],
  ]);
  const twoGameFinalGame: MovementGame = {
    ...numberedGame,
    board: twoGameFinalBoard,
    penguinPositions: twoGameFinalPenguinPositions,
    remainingUnplacedPenguins: twoGameNoUnplacedPenguins,
    scores: twoGameFinalScores,
  };

  describe("tournamentPlayersToGamePlayers", () => {
    it("returns an empty array given an empty array", () => {
      expect(tournamentPlayersToGamePlayers([])).toEqual([]);
    });

    it("converts an array of less than 4 players", () => {
      const expectedConvertedTwoTournamentPlayers: Array<Player> = [
        player1,
        player2,
      ];
      expect(tournamentPlayersToGamePlayers(twoTournamentPlayers)).toEqual(
        expectedConvertedTwoTournamentPlayers
      );
    });

    it("converts an array of 4 players", () => {
      const expectedConvertedFourTournamentPlayers: Array<Player> = [
        player1,
        player2,
        player3,
        player4,
      ];
      expect(tournamentPlayersToGamePlayers(fourTournamentPlayers)).toEqual(
        expectedConvertedFourTournamentPlayers
      );
    });
  });

  describe("notifyPlayersGameStarting", () => {
    const mockGameIsStarting = jest.fn((game: Game) => {
      return;
    });

    const mockedTournamentPlayers: Array<TournamentPlayer> = twoTournamentPlayers.map(
      (tournamentPlayer: TournamentPlayer) => {
        return { ...tournamentPlayer, gameIsStarting: mockGameIsStarting };
      }
    );

    it("calls each player's gameIsStarting call with the given Game", () => {
      notifyPlayersGameStarting(mockedTournamentPlayers, numberedGame);
      expect(mockGameIsStarting.mock.calls.length).toEqual(
        mockedTournamentPlayers.length
      );

      for (let i = 0; i < mockedTournamentPlayers.length; i++) {
        expect(mockGameIsStarting.mock.calls[i][0]).toEqual(numberedGame);
      }
    });
  });

  describe("createInitialGameState", () => {
    const players: Array<Player> = [player1, player2];
    const tournamentPlayers: Array<TournamentPlayer> = [
      tournamentPlayer1,
      tournamentPlayer2,
    ];
    const board: Board = createNumberedBoard([
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ]).unsafelyUnwrap();
    const expectedGameState: Game = createGameState(
      players,
      board
    ).unsafelyUnwrap();

    it("successfully creates an initial Game state", () => {
      expect(
        createInitialGameState(tournamentPlayers, {
          cols: 4,
          rows: 4,
        })
      ).toEqual(ok(expectedGameState));
    });

    it("rejects invalid boardDimensions", () => {
      expect(
        createInitialGameState(tournamentPlayers, {
          cols: 0,
          rows: 2,
        })
      ).toEqual(err(new IllegalBoardError(0, 2)));
    });

    // it("rejects an invalid number of players", () => {
    //   expect(
    //     createInitialGameState([], {
    //       cols: 4,
    //       rows: 4,
    //     })
    //   ).toEqual(
    //     err(
    //       new IllegalGameStateError(
    //         [],
    //         createHoledOneFishBoard(4, 4, [], 1).unsafelyUnwrap(),
    //         "Invalid number of players specified for game: 0"
    //       )
    //     )
    //   );
    // });
  });

  describe("runPlacementTurn", () => {
    const initialRefereeState: RefereeState = {
      game: numberedGame,
      tournamentPlayers: new Map([
        [tournamentPlayer1.name, tournamentPlayer1],
        [tournamentPlayer2.name, tournamentPlayer2],
      ]),
      failingPlayers: [],
      cheatingPlayers: [],
    };
    const placement: BoardPosition = player1TwoGamePlacements[0];
    const penguinPositionsAfterPlacement1: Map<
      PenguinColor,
      Array<BoardPosition>
    > = new Map(numberedGame.penguinPositions).set(player1.color, [placement]);
    const remainingUnplacedPenguinsAfterPlacement1: Map<
      PenguinColor,
      number
    > = new Map(numberedGame.remainingUnplacedPenguins).set(player1.color, 3);
    const gameStateAfterPlacement1: Game = {
      ...numberedGame,
      players: shiftPlayers(numberedGame.players),
      penguinPositions: penguinPositionsAfterPlacement1,
      remainingUnplacedPenguins: remainingUnplacedPenguinsAfterPlacement1,
    };
    const refereeStateAfterPlacement1: RefereeState = {
      ...initialRefereeState,
      game: gameStateAfterPlacement1,
    };
    const penguinPositionsAfterBadPlacement2: Map<
      PenguinColor,
      Array<BoardPosition>
    > = new Map([[player1.color, [placement]]]);
    const remainingUnplacedPenguinsAfterBadPlacement2: Map<
      PenguinColor,
      number
    > = new Map([[player1.color, 3]]);
    const scoresAfterBadPlacement2: Map<PenguinColor, number> = new Map([
      [player1.color, 0],
    ]);
    const gameAfterBadPlacement2: Game = {
      ...gameStateAfterPlacement1,
      players: [player1],
      penguinPositions: penguinPositionsAfterBadPlacement2,
      remainingUnplacedPenguins: remainingUnplacedPenguinsAfterBadPlacement2,
      scores: scoresAfterBadPlacement2,
    };
    const refereeStateAfterBadPlacement2: RefereeState = {
      ...refereeStateAfterPlacement1,
      tournamentPlayers: new Map([[tournamentPlayer1.name, tournamentPlayer1]]),
      cheatingPlayers: [player2],
      game: gameAfterBadPlacement2,
    };

    it("makes a placement for the current player", () => {
      expect(runPlacementTurn(placement, initialRefereeState)).toEqual(
        refereeStateAfterPlacement1
      );
    });

    it("disqualifies a player for cheating on an invalid placement", () => {
      expect(runPlacementTurn(placement, refereeStateAfterPlacement1)).toEqual(
        refereeStateAfterBadPlacement2
      );
    });
  });

  describe("runPlacementRounds", () => {
    it("makes placements for all players without any kicks", () => {
      const player1: TournamentPlayer = createDummyPlayer(
        player1Name,
        player1TwoGamePlacements,
        player1TwoGameMovements
      );
      const player2: TournamentPlayer = createDummyPlayer(
        player2Name,
        player2TwoGamePlacements,
        player2TwoGameMovements
      );
      const initialRefereeState: RefereeState = {
        game: numberedGame,
        tournamentPlayers: new Map([
          [player1.name, player1],
          [player2.name, player2],
        ]),
        cheatingPlayers: [],
        failingPlayers: [],
      };
      const expectedRefereeState: RefereeState = {
        ...initialRefereeState,
        game: twoGameAfterPlacements,
      };

      return expect(runPlacementRounds(initialRefereeState)).resolves.toEqual(
        expectedRefereeState
      );
    });

    it("recovers from a kicked player and places all penguins", () => {
      const tournamentPlayer1: TournamentPlayer = createDummyPlayer(
        player1Name,
        player1TwoGamePlacements,
        player1TwoGameMovements
      );
      const tournamentPlayer2: TournamentPlayer = createDummyPlayer(
        player2Name,
        player2TwoGamePlacementsDuplicate,
        player2TwoGameMovements
      );
      const initialRefereeState: RefereeState = {
        game: numberedGame,
        tournamentPlayers: new Map([
          [tournamentPlayer1.name, tournamentPlayer1],
          [tournamentPlayer2.name, tournamentPlayer2],
        ]),
        cheatingPlayers: [],
        failingPlayers: [],
      };
      const expectedRefereeState: RefereeState = {
        ...initialRefereeState,
        tournamentPlayers: new Map([
          [tournamentPlayer1.name, tournamentPlayer1],
        ]),
        game: twoGameAfterPlacementsKickPlayer2,
        cheatingPlayers: [player2],
      };

      return expect(runPlacementRounds(initialRefereeState)).resolves.toEqual(
        expectedRefereeState
      );
    });

    it("detects failing players who timed out", () => {
      const tournamentPlayer1: TournamentPlayer = createSamplePlayer(
        player1Name
      );
      const tournamentPlayer2: TournamentPlayer = createDummyPlayer(
        player2Name,
        player2TwoGamePlacementsDuplicate,
        player2TwoGameMovements,
        10000
      );
      const initialRefereeState: RefereeState = {
        game: numberedGame,
        tournamentPlayers: new Map([
          [tournamentPlayer1.name, tournamentPlayer1],
          [tournamentPlayer2.name, tournamentPlayer2],
        ]),
        cheatingPlayers: [],
        failingPlayers: [],
      };

      return runPlacementRounds(initialRefereeState, 1000).then((result) => {
        expect(result.failingPlayers).toEqual([player2]);
        expect(result.cheatingPlayers).toEqual([]);
        expect(result.game.players).toEqual([player1]);
      });
    });
  });

  describe("gameIsFinished", () => {
    it("accepts a finished game with no more moves", () => {
      expect(gameIsFinished(twoGameFinalGame)).toEqual(true);
    });

    it("rejects an unfinished game", () => {
      expect(gameIsFinished(twoGameAfterPlacements)).toEqual(false);
    });
  });

  describe("runMovementTurn", () => {
    const penguinPositionsAfterMovement1: Map<
      PenguinColor,
      Array<BoardPosition>
    > = new Map(twoGameAfterPlacements.penguinPositions).set(player1.color, [
      player1TwoGamePosition2,
      player1TwoGamePosition3,
      player1TwoGamePosition4,
      { col: 0, row: 1 },
    ]);
    const scoresAfterMovement1: Map<PenguinColor, number> = new Map(
      twoGameAfterPlacements.scores
    ).set(player1.color, 1);
    const boardAfterMovement1: Board = createNumberedBoard([
      [0, 3, 5, 4],
      [3, 2, 4, 1],
      [2, 3, 5, 1],
      [4, 1, 1, 2],
    ]).unsafelyUnwrap();
    const gameAfterMovement1: MovementGame = {
      ...twoGameAfterPlacements,
      board: boardAfterMovement1,
      players: shiftPlayers(twoGameAfterPlacements.players),
      penguinPositions: penguinPositionsAfterMovement1,
      scores: scoresAfterMovement1,
    };
    const initialRefereeState: RefereeStateWithMovementGame = {
      tournamentPlayers: new Map([
        [tournamentPlayer1.name, tournamentPlayer1],
        [tournamentPlayer2.name, tournamentPlayer2],
      ]),
      game: twoGameAfterPlacements,
      failingPlayers: [],
      cheatingPlayers: [],
    };
    const refereeStateAfterMovement1: RefereeStateWithMovementGame = {
      ...initialRefereeState,
      game: gameAfterMovement1,
    };

    const penguinPositionsAfterBadMovement2: Map<
      PenguinColor,
      Array<BoardPosition>
    > = new Map(gameAfterMovement1.penguinPositions);
    penguinPositionsAfterBadMovement2.delete(player2.color);
    const scoresAfterBadMovement2: Map<PenguinColor, number> = new Map(
      gameAfterMovement1.scores
    );
    scoresAfterBadMovement2.delete(player2.color);
    const unplacedPenguinsAfterBadMovement2: Map<PenguinColor, 0> = new Map(
      gameAfterMovement1.remainingUnplacedPenguins
    );
    unplacedPenguinsAfterBadMovement2.delete(player2.color);
    const gameAfterBadMovement2: MovementGame = {
      ...gameAfterMovement1,
      players: [player1],
      penguinPositions: penguinPositionsAfterBadMovement2,
      remainingUnplacedPenguins: unplacedPenguinsAfterBadMovement2,
      scores: scoresAfterBadMovement2,
    };
    const refereeStateAfterBadMovement2: RefereeStateWithMovementGame = {
      ...refereeStateAfterMovement1,
      tournamentPlayers: new Map([[tournamentPlayer1.name, tournamentPlayer1]]),
      game: gameAfterBadMovement2,
      cheatingPlayers: [player2],
      failingPlayers: [],
    };

    it("makes a movement for the current player", () => {
      expect(
        runMovementTurn(player1TwoGameMovement1, initialRefereeState)
      ).toEqual(refereeStateAfterMovement1);
    });

    it("disqualifies a player for cheating on an invalid movement", () => {
      expect(
        runMovementTurn(player1TwoGameMovement1, refereeStateAfterMovement1)
      ).toEqual(refereeStateAfterBadMovement2);
    });
  });

  describe("runMovementRounds", () => {
    it("makes movements for all players, finishing a game without any kicks", () => {
      const player1: TournamentPlayer = createDummyPlayer(
        player1Name,
        player1TwoGamePlacements,
        player1TwoGameMovements
      );
      const player2: TournamentPlayer = createDummyPlayer(
        player2Name,
        player2TwoGamePlacements,
        player2TwoGameMovements
      );

      const initialRefereeState: RefereeStateWithMovementGame = {
        tournamentPlayers: new Map([
          [player1.name, player1],
          [player2.name, player2],
        ]),
        game: twoGameAfterPlacements,
        failingPlayers: [],
        cheatingPlayers: [],
      };
      const expectedRefereeState: RefereeStateWithMovementGame = {
        ...initialRefereeState,
        game: twoGameFinalGame,
      };

      return expect(runMovementRounds(initialRefereeState)).resolves.toEqual(
        expectedRefereeState
      );
    });

    it("recovers from a kicked player and finishes a game", () => {
      const tournamentPlayer1: TournamentPlayer = createSamplePlayer(
        player1Name
      );
      const player2TwoGamePosition1: BoardPosition = {
        col: 1,
        row: 0,
      };
      const player2TwoGamePosition2: BoardPosition = {
        col: 3,
        row: 0,
      };
      const player2TwoGamePosition3: BoardPosition = {
        col: 0,
        row: 3,
      };
      const player2TwoGamePosition4: BoardPosition = {
        col: 2,
        row: 3,
      };
      const player2TwoGamePlacements: Array<BoardPosition> = [
        player2TwoGamePosition1,
        player2TwoGamePosition2,
        player2TwoGamePosition3,
        player2TwoGamePosition4,
      ];
      const tournamentPlayer2: TournamentPlayer = createDummyPlayer(
        player2Name,
        player2TwoGamePlacements,
        player1TwoGameMovements
      );

      const initialRefereeState: RefereeStateWithMovementGame = {
        tournamentPlayers: new Map([
          [tournamentPlayer1.name, tournamentPlayer1],
          [tournamentPlayer2.name, tournamentPlayer2],
        ]),
        game: twoGameAfterPlacements,
        failingPlayers: [],
        cheatingPlayers: [],
      };

      const expectedPenguinPositions = new Map([
        [
          player1.color,
          [
            { col: 0, row: 0 },
            { col: 0, row: 2 },
            { col: 2, row: 3 },
            { col: 3, row: 2 },
          ],
        ],
      ]);
      const expectedRemainingUnplacedPenguins = new Map(
        twoGameAfterPlacements.remainingUnplacedPenguins
      );
      expectedRemainingUnplacedPenguins.delete(player2.color);
      const expectedScores = new Map(twoGameAfterPlacements.scores);
      expectedScores.delete(player2.color);
      expectedScores.set(player1.color, 31);
      const expectedBoard: Board = createNumberedBoard([
        [1, 0, 0, 0],
        [0, 2, 0, 0],
        [2, 3, 0, 1],
        [0, 1, 1, 0],
      ]).unsafelyUnwrap();
      const expectedGame: MovementGame = {
        ...twoGameAfterPlacements,
        board: expectedBoard,
        players: [player1],
        penguinPositions: expectedPenguinPositions,
        remainingUnplacedPenguins: expectedRemainingUnplacedPenguins,
        scores: expectedScores,
      };

      const expectedRefereeState: RefereeStateWithMovementGame = {
        ...initialRefereeState,
        tournamentPlayers: new Map([
          [tournamentPlayer1.name, tournamentPlayer1],
        ]),
        game: expectedGame,
        cheatingPlayers: [player2],
      };

      return expect(runMovementRounds(initialRefereeState)).resolves.toEqual(
        expectedRefereeState
      );
    });

    it("detects failing players who timed out", () => {
      const tournamentPlayer1: TournamentPlayer = createSamplePlayer(
        player1Name
      );
      const tournamentPlayer2: TournamentPlayer = createDummyPlayer(
        player2Name,
        player2TwoGamePlacementsDuplicate,
        player2TwoGameMovements,
        10000
      );
      const initialRefereeState: RefereeStateWithMovementGame = {
        tournamentPlayers: new Map([
          [tournamentPlayer1.name, tournamentPlayer1],
          [tournamentPlayer2.name, tournamentPlayer2],
        ]),
        game: twoGameAfterPlacements,
        failingPlayers: [],
        cheatingPlayers: [],
        movementSoFar: undefined,
      };

      return runMovementRounds(initialRefereeState, 1000).then((result) => {
        expect(result.failingPlayers).toEqual([player2]);
        expect(result.cheatingPlayers).toEqual([]);
        expect(result.game.players).toEqual([player1]);
      });
    });
  });

  describe("addScoresOfPlacedPenguins", () => {
    it("adds the scores of all player's current placed penguins", () => {
      const expectedScores: Map<PenguinColor, number> = new Map([
        [player1.color, 20],
        [player2.color, 22],
      ]);
      const expectedGame: Game = {
        ...twoGameFinalGame,
        scores: expectedScores,
      };
      expect(addScoresOfPlacedPenguins(twoGameFinalGame)).toEqual(expectedGame);
    });
  });

  describe("createGameDebrief", () => {
    it("creates a game debrief", () => {
      const refereeState: RefereeStateWithMovementGame = {
        tournamentPlayers: new Map([
          [tournamentPlayer1.name, tournamentPlayer1],
          [tournamentPlayer2.name, tournamentPlayer2],
        ]),
        game: twoGameFinalGame,
        cheatingPlayers: [player3],
        failingPlayers: [player4],
      };

      const expectedGameDebrief: GameDebrief = {
        activePlayers: [
          { name: player2Name, score: 10 },
          { name: player1Name, score: 8 },
        ],
        kickedPlayers: [{ name: player3Name }, { name: player4Name }],
      };

      expect(createGameDebrief(refereeState)).toEqual(expectedGameDebrief);
    });
  });

  describe("notifyPlayersOfOutcome", () => {
    const mockGameHasEnded = jest.fn((gameDebrief: GameDebrief) => {
      return;
    });

    const mockedTournamentPlayers: Array<TournamentPlayer> = twoTournamentPlayers.map(
      (tournamentPlayer: TournamentPlayer) => {
        return { ...tournamentPlayer, gameHasEnded: mockGameHasEnded };
      }
    );
    const gameDebrief: GameDebrief = {
      activePlayers: [],
      kickedPlayers: [],
    };

    it("calls each player's gameHasEnded call with the given Game", () => {
      notifyPlayersOfOutcome(mockedTournamentPlayers, gameDebrief);
      expect(mockGameHasEnded.mock.calls.length).toEqual(
        mockedTournamentPlayers.length
      );

      for (let i = 0; i < mockedTournamentPlayers.length; i++) {
        expect(mockGameHasEnded.mock.calls[i][0]).toEqual(gameDebrief);
      }
    });
  });

  describe("numberOfPenguinPlacements", () => {
    it("returns the correct number of placements", () => {
      expect(numberOfPenguinPlacements(4)).toEqual(8);
    });
  });

  describe("isBoardBigEnoughOrError", () => {
    it("accepts a big-enough board", () => {
      expect(boardIsBigEnough(2, { rows: 4, cols: 4 })).toEqual(true);
    });

    it("rejects not enough positions for the number of placements", () => {
      expect(boardIsBigEnough(2, { rows: 2, cols: 2 })).toEqual(false);
    });
  });

  describe("runGame", () => {
    const expectedGameDebrief: GameDebrief = {
      activePlayers: [
        { name: player1Name, score: 4 },
        { name: player2Name, score: 4 },
      ],
      kickedPlayers: [],
    };
    const players = [tournamentPlayer1, tournamentPlayer2];

    it("runs an entire game", async () => {
      const result = await runGame(players, { cols: 4, rows: 4 }).unsafelyUnwrap();
      expect(result).toEqual(expectedGameDebrief);
    });

    it("rejects not enough positions for the number of placements", () => {
      expect(runGame(players, { cols: 2, rows: 2 })).toEqual(
        err(new IllegalBoardError(2, 2))
      );
    });

    // it("rejects an invalid number of players", () => {
    //   expect(runGame([], { cols: 4, rows: 3 })).toEqual(
    //     err(
    //       new IllegalGameStateError(
    //         [],
    //         createHoledOneFishBoard(4, 3, [], 1).unsafelyUnwrap(),
    //         "Invalid number of players specified for game: 0"
    //       )
    //     )
    //   );
    // });
  });

  describe("disqualifyCurrentCheatingPlayer", () => {
    it("disqualifies current player for cheating", () => {
      const mockCall = jest.fn();
      const mockTournamentPlayer1 = {
        ...tournamentPlayer1,
        disqualifyMe: mockCall,
      };
      const newScores = new Map(numberedGame.scores);
      newScores.delete(PenguinColor.Red);
      const newPenguinPositions = new Map(numberedGame.penguinPositions);
      newPenguinPositions.delete(PenguinColor.Red);
      const newUnplacedPenguins = new Map(
        numberedGame.remainingUnplacedPenguins
      );
      newUnplacedPenguins.delete(PenguinColor.Red);
      const newPlayers = [...numberedGame.players];
      newPlayers.splice(0, 1);
      const expectedGame: Game = {
        ...numberedGame,
        scores: newScores,
        penguinPositions: newPenguinPositions,
        remainingUnplacedPenguins: newUnplacedPenguins,
        players: newPlayers,
      };
      const initialRefereeState: RefereeState = {
        game: numberedGame,
        tournamentPlayers: new Map([
          [mockTournamentPlayer1.name, mockTournamentPlayer1],
          [tournamentPlayer2.name, tournamentPlayer2],
        ]),
        cheatingPlayers: [],
        failingPlayers: [],
      };
      const expectedRefereeState: RefereeState = {
        game: expectedGame,
        tournamentPlayers: new Map([
          [tournamentPlayer2.name, tournamentPlayer2],
        ]),
        cheatingPlayers: [player1],
        failingPlayers: [],
      };

      const resultingRefereeState = disqualifyCurrentCheatingPlayer(
        initialRefereeState,
        "you have been disqualified"
      );
      expect(resultingRefereeState).toEqual(expectedRefereeState);
      expect(mockCall).toHaveBeenCalled();
      expect(mockCall).toHaveBeenCalledWith("you have been disqualified");
    });
  });

  describe("disqualifyCurrentFailingPlayer", () => {
    it("disqualifies current player for cheating", () => {
      const mockCall = jest.fn();
      const mockTournamentPlayer1 = {
        ...tournamentPlayer1,
        disqualifyMe: mockCall,
      };
      const newScores = new Map(numberedGame.scores);
      newScores.delete(PenguinColor.Red);
      const newPenguinPositions = new Map(numberedGame.penguinPositions);
      newPenguinPositions.delete(PenguinColor.Red);
      const newUnplacedPenguins = new Map(
        numberedGame.remainingUnplacedPenguins
      );
      newUnplacedPenguins.delete(PenguinColor.Red);
      const newPlayers = [...numberedGame.players];
      newPlayers.splice(0, 1);
      const expectedGame: Game = {
        ...numberedGame,
        scores: newScores,
        penguinPositions: newPenguinPositions,
        remainingUnplacedPenguins: newUnplacedPenguins,
        players: newPlayers,
      };
      const initialRefereeState: RefereeState = {
        game: numberedGame,
        tournamentPlayers: new Map([
          [mockTournamentPlayer1.name, mockTournamentPlayer1],
          [tournamentPlayer2.name, tournamentPlayer2],
        ]),
        cheatingPlayers: [],
        failingPlayers: [],
      };
      const expectedRefereeState: RefereeState = {
        game: expectedGame,
        tournamentPlayers: new Map([
          [tournamentPlayer2.name, tournamentPlayer2],
        ]),
        cheatingPlayers: [],
        failingPlayers: [player1],
      };

      const resultingRefereeState = disqualifyCurrentFailingPlayer(
        initialRefereeState,
        "you have been disqualified"
      );
      expect(resultingRefereeState).toEqual(expectedRefereeState);
      expect(mockCall).toHaveBeenCalled();
      expect(mockCall).toHaveBeenCalledWith("you have been disqualified");
    });
  });

  describe("disqualifyCurrentPlayer", () => {
    it("disqualifies current player", () => {
      const mockCall = jest.fn();
      const mockTournamentPlayer1 = {
        ...tournamentPlayer1,
        disqualifyMe: mockCall,
      };
      mockTournamentPlayer1;
      const newScores = new Map(numberedGame.scores);
      newScores.delete(PenguinColor.Red);
      const newPenguinPositions = new Map(numberedGame.penguinPositions);
      newPenguinPositions.delete(PenguinColor.Red);
      const newUnplacedPenguins = new Map(
        numberedGame.remainingUnplacedPenguins
      );
      newUnplacedPenguins.delete(PenguinColor.Red);
      const newPlayers = [...numberedGame.players];
      newPlayers.splice(0, 1);
      const expectedGame: Game = {
        ...numberedGame,
        scores: newScores,
        penguinPositions: newPenguinPositions,
        remainingUnplacedPenguins: newUnplacedPenguins,
        players: newPlayers,
      };
      const initialRefereeState: RefereeState = {
        game: numberedGame,
        tournamentPlayers: new Map([
          [mockTournamentPlayer1.name, mockTournamentPlayer1],
          [tournamentPlayer2.name, tournamentPlayer2],
        ]),
        cheatingPlayers: [],
        failingPlayers: [],
      };
      const expectedRefereeState: RefereeState = {
        game: expectedGame,
        tournamentPlayers: new Map([
          [tournamentPlayer2.name, tournamentPlayer2],
        ]),
        cheatingPlayers: [],
        failingPlayers: [],
      };

      const resultingRefereeState = disqualifyCurrentPlayer(
        initialRefereeState,
        "you have been disqualified"
      );
      expect(resultingRefereeState).toEqual(expectedRefereeState);
      expect(mockCall).toHaveBeenCalled();
      expect(mockCall).toHaveBeenCalledWith("you have been disqualified");
    });
  });

  describe("removeDisqualifiedPlayerFromGame", () => {
    it("removes current player from game", () => {
      const newScores = new Map(numberedGame.scores);
      newScores.delete(PenguinColor.Red);
      const newPenguinPositions = new Map(numberedGame.penguinPositions);
      newPenguinPositions.delete(PenguinColor.Red);
      const newUnplacedPenguins = new Map(
        numberedGame.remainingUnplacedPenguins
      );
      newUnplacedPenguins.delete(PenguinColor.Red);
      const newPlayers = [...numberedGame.players];
      newPlayers.splice(0, 1);
      const expectedGame: Game = {
        ...numberedGame,
        scores: newScores,
        penguinPositions: newPenguinPositions,
        remainingUnplacedPenguins: newUnplacedPenguins,
        players: newPlayers,
      };
      expect(removeDisqualifiedPlayerFromGame(numberedGame)).toEqual(
        expectedGame
      );
    });
  });

  describe("runGame with Observers", () => {
    const mockObserver: GameObserver = {
      gameHasChanged: jest.fn(),
      gameHasEnded: jest.fn(),
      gameIsStarting: jest.fn(),
    }
    const expectedGameDebrief: GameDebrief = {
      activePlayers: [
        { name: player1Name, score: 4 },
        { name: player2Name, score: 4 },
      ],
      kickedPlayers: [],
    };
    const players = [tournamentPlayer1, tournamentPlayer2];
    const observers = [mockObserver];

    it("should notify observer of game updates", async () => {
      const result = await runGame(players, { cols: 4, rows: 4 }, observers).unsafelyUnwrap();
      expect(result).toEqual(expectedGameDebrief);
      expect(mockObserver.gameIsStarting).toHaveBeenCalledTimes(1);
      expect(mockObserver.gameHasChanged).toHaveBeenCalledTimes(16);
      expect(mockObserver.gameHasEnded).toHaveBeenCalledTimes(1);
    });
  });
});
