import { PenguinColor, Board, BoardPosition } from "../../board";
import {
  GameDebrief,
  ActivePlayer,
  InactivePlayer,
} from "../../player-interface";
import {
  IllegalBoardError,
  IllegalGameStateError,
  IllegalMovementError,
  IllegalPlacementError,
} from "../types/errors";
import {
  Game,
  MovementGame,
  Player,
  getCurrentPlayerColor,
  getCurrentPlayer,
} from "../../state";
import {createBlankBoard, createHoledOneFishBoard, getTileOnBoard} from "./boardCreation";
import {
  createGameTreeFromMovementGame,
  gameIsMovementGame,
} from "./gameTreeCreation";
import {
  createGameState,
  numOfPenguinsPerPlayer,
  skipToNextActivePlayer,
} from "./gameStateCreation";
import { placePenguin } from "./penguinPlacement";
import { GameTree, Movement } from "../../game-tree";
import { TournamentPlayer } from "../../player-interface";
import { checkMovementLegal } from "./queryGameTree";
import { Result } from "true-myth";
import { GameObserver } from "./gameObserver-interface";
const { err } = Result;

const PLAYER_REQUEST_TIMEOUT = 5000;

/**
 * A BoardParameters represents the size of a board within a Fish game. It
 * specifies both the number of rows and the number of columns in the board,
 * and the fish that should be on each tile.
 *
 * @param rows the number of rows in the board, must be a positive integer
 * @param cols the number of columns in the board, must be a positive integer
 * @param numFish the number of fish that each tile should have, if provided. Defaults to 1.
 */
interface BoardParameters {
  readonly rows: number;
  readonly cols: number;
  readonly numFish?: number;
  readonly holes?: Array<BoardPosition>;
}

/**
 * A RefereeState is a composition of a Game state used by the Referee
 * component for tracking the state of the Game it is running along
 * with other necessary values that are not specific to a Game, but
 * are necessary for running it.
 *
 * @param game the current Game state of the Game this referee is running
 * @param tournamentPlayers a mapping from each participating player's
 * name to the courresponding TournamentPlayer
 * @param cheatingPlayers an array of all the players currently caught cheating
 * throughout the game, where a cheating player is one who has provided a
 * placement or movement that violates the rules of the game
 * @param failingPlayers an array of all the players currently who have failed
 * to provide an action for their turn within the specified timeout when
 * requested of them
 */
interface RefereeState {
  readonly game: Game;
  readonly tournamentPlayers: Map<string, TournamentPlayer>;
  readonly cheatingPlayers: Array<Player>;
  readonly failingPlayers: Array<Player>;
}

/**
 * A RefereeStateWithMovementGame represents a RefereeState once the Game
 * has entered the movement stage of the Game, i.e. once all placements are
 * made. It is simply a RefereeState where the Game state is a MovementGame.
 */
type RefereeStateWithMovementGame = RefereeState & { game: MovementGame };

/**
 * Given the currrent Referee state, returns the currently playing
 * TournamentPlayer in the Game.
 *
 * @param refereeState the state of the referee.
 * @return the TournamentPlayer whose turn is next.
 */
const getCurrentTournamentPlayer = (
  refereeState: RefereeState
): TournamentPlayer => {
  const game = refereeState.game;
  const player: Player = getCurrentPlayer(game);
  return refereeState.tournamentPlayers.get(player.name) as TournamentPlayer;
};

/**
 * Given an array of TournamentPlayers, returns an array of corresponding Players.
 * The given array of tournament players is assumed to be less than or equal to
 * 4 in length, corresponding to the max amount of players.
 *
 * @param tournamentPlayers array of TournamentPlayers in the game
 * @return an array of Players correpsonding to the given array of TournamentPlayers
 */
const tournamentPlayersToGamePlayers = (
  tournamentPlayers: Array<TournamentPlayer>
): Array<Player> => {
  const players: Array<Player> = [];
  for (const penguinColor in PenguinColor) {
    if (players.length < tournamentPlayers.length) {
      players.push({
        name: tournamentPlayers[players.length].name,
        color: penguinColor as PenguinColor,
      });
    }
  }
  return players;
};

/**
 * Given an array of TournamentPlayers along with the game's initial Game,
 * notify all of the players that the game is beginning.
 *
 * @param tournamentPlayers the participating TournamentPlayers
 * @param startingGameState the initial Game state
 */
const notifyPlayersGameStarting = (
  tournamentPlayers: Array<TournamentPlayer>,
  startingGameState: Game
): void => {
  for (const player of tournamentPlayers) {
    player.gameIsStarting(startingGameState);
  }
};

// TODO
const notifyObserversGameStarting = (
  observers: Array<GameObserver>,
  startingGameState: Game
): void => {
  observers.forEach((observer) => {
    observer.gameIsStarting(startingGameState);
  })
}

/**
 * Given an array of TournamentPlayers and a set of BoardDimenesions, for a new
 * Fish game, create the Game's initial state.
 *
 * @param players the TournamentPlayers participating in the game
 * @param boardDimensions the dimensions of the game's board
 * @return the initial Game state.
 */
const createInitialGameState = (
  tournamentPlayers: Array<TournamentPlayer>,
  boardParams: BoardParameters
): Result<Game, IllegalBoardError | IllegalGameStateError> => {
  // Create the Game state's player roster.
  const players: Array<Player> = tournamentPlayersToGamePlayers(
    tournamentPlayers
  );

  return (createHoledOneFishBoard(
      boardParams.cols,
      boardParams.rows,
    boardParams.holes || [],
    1,
    boardParams.numFish || 1
  ) as Result<
    Board,
    IllegalBoardError | IllegalGameStateError
  >).andThen((board: Board) => createGameState(players, board));
};

/**
 * Given a placement position and the current RefereeState, make a placement
 * for the current player of the RefereeState's Game state and update the
 * RefereeState to reflect the result. If the placement was invalid, mark
 * the player as a cheater and kick them from the game.
 *
 * @param placementPosition the position to make a placement on for the
 * current player
 * @param currRefereeState the current RefereeState from which the placement is
 * being made
 * @return the updated RefereeState
 */
const runPlacementTurn = (
  placementPosition: BoardPosition,
  currRefereeState: RefereeState
): RefereeState =>
  placePenguin(
    getCurrentPlayer(currRefereeState.game),
    currRefereeState.game,
    placementPosition
  ).match({
    Ok: (game: Game) => {
      return { ...currRefereeState, game };
    },
    Err: (e: IllegalPlacementError) => {
      return disqualifyCurrentCheatingPlayer(currRefereeState, e.message);
    },
  });

/**
 * Apply a timeout to the given player request which will reject the request
 * after 5000ms if the request is not resolved.
 *
 * @param request the request to add a timeout to
 * @param timeout the timeout duration
 * @return a new Promise with an applied timeout
 */
const timeoutRequest = <T>(
  request: Promise<T>,
  timeout: number
): Promise<T> => {
  let id: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve, reject) => {
    id = setTimeout(
      () => reject(`Player did not respond in ${timeout}ms.`),
      timeout
    );
  });

  return Promise.race([request, timeoutPromise]).then((result) => {
    clearTimeout(id);
    return result;
  });
};

/**
 * Run the placement rounds of the Game within the given RefereeState, calling
 * upon players for their placements, attempting these, disqualifying players if
 * necessary, and returning the resulting RefereeState with all the placements
 * complete
 *
 * @param refereeState the RefereeState from which to run the placement rounds
 * @return the resulting RefereeState after running all placements
 */
const runPlacementRounds = async (
  refereeState: RefereeState,
  timeout: number = PLAYER_REQUEST_TIMEOUT,
  observers?: Array<GameObserver>
): Promise<RefereeStateWithMovementGame> => {
  let currRefereeState: RefereeState = refereeState;

  while (!gameIsMovementGame(currRefereeState.game)) {
    const currentTournamentPlayer: TournamentPlayer = getCurrentTournamentPlayer(
      currRefereeState
    );

    currRefereeState = await timeoutRequest(
      currentTournamentPlayer.makePlacement(currRefereeState.game),
      timeout
    )
      .then((position: BoardPosition) => {
        return runPlacementTurn(position, currRefereeState);
      })
      .catch((err: string) => {
        return disqualifyCurrentFailingPlayer(currRefereeState, err);
      });

    observers && notifyObserversOfChange(observers, currRefereeState.game);
  }

  // With the invariant that the board made by the referee must contain enough
  // positions for all of every player's placements, running all placement
  // rounds must guarantee that the current game is a MovementGame.
  return currRefereeState as RefereeStateWithMovementGame;
};

/**
 * Given a MovementGame, determine if the game is finished with no players able
 * to make any more moves.
 *
 * @param game the MovementGame to check
 * @return whether the game is finished
 */
const gameIsFinished = (game: MovementGame): boolean => {
  const gameTree: GameTree = createGameTreeFromMovementGame(game);
  return gameTree.potentialMoves.length === 0;
};

/**
 * Given a Movement and the current RefereeState, make a movement for the
 * current player of the RefereeState's Game state and update the RefereeState
 * to reflect the result. If the movement was invalid, mark the player as a
 * cheater and kick them from the game.
 *
 * @param movement the movement for to make for the current player
 * @param currRefereeState the current RefereeState from which the movement is
 * being made
 * @return the updated RefereeState
 */
const runMovementTurn = (
  movement: Movement,
  currRefereeState: RefereeStateWithMovementGame
): RefereeStateWithMovementGame => {
  const gameTree: GameTree = createGameTreeFromMovementGame(
    currRefereeState.game
  );

  return checkMovementLegal(gameTree, movement).match({
    Ok: (game: MovementGame) => {
      return {
        ...currRefereeState,
        game,
      };
    },
    Err: (e: IllegalMovementError) => {
      return disqualifyCurrentCheatingPlayer(
        currRefereeState,
        e.message
      ) as RefereeStateWithMovementGame;
    },
  });
};

/**
 * Run the movement rounds of the Game within the given RefereeState, calling
 * upon players for their movements, attempting these, disqualifying players if
 * necessary, and returning ther resulting RefereeState once the game is
 * complete.
 *
 * @param refereeState the RefereeState from which to run the placement rounds
 * @return the resulting RefereeState after finishing the game
 */
const runMovementRounds = async (
  refereeState: RefereeStateWithMovementGame,
  timeout: number = PLAYER_REQUEST_TIMEOUT,
  observers?: Array<GameObserver>,
): Promise<RefereeStateWithMovementGame> => {
  let currRefereeState: RefereeStateWithMovementGame = refereeState;

  while (!gameIsFinished(currRefereeState.game as MovementGame)) {
    const currentTournamentPlayer: TournamentPlayer = getCurrentTournamentPlayer(
      currRefereeState
    );

    currRefereeState = await timeoutRequest(
      currentTournamentPlayer.makeMovement(currRefereeState.game),
      timeout
    )
      .then((movement: Movement) => {
        return runMovementTurn(movement, currRefereeState);
      })
      .catch((err: string) => {
        return disqualifyCurrentFailingPlayer(
          currRefereeState,
          err
        ) as RefereeStateWithMovementGame;
      });
    
    observers && notifyObserversOfChange(observers, currRefereeState.game);
  }

  return currRefereeState;
};

/**
 * Given a RefereeState and optional message, add the current player to the list of
 * failing players and disqualify them from the game by calling disqualifyCurrentPlayer.
 *
 * @param refereeState the RefereeState to remove current player from active play
 * @param message the message to give the TournamentPlayer about their
 * disqualification, defaulting to a timeout message
 * @return the updated RefereeState
 */
const disqualifyCurrentFailingPlayer = (
  refereeState: RefereeState,
  message?: string
): RefereeState => {
  // Add current player to list of failing players
  const newFailingPlayers = [
    ...refereeState.failingPlayers,
    getCurrentPlayer(refereeState.game),
  ];

  // Remove the player from the RefereeState/Game state.
  const newRefereeState = disqualifyCurrentPlayer(
    refereeState,
    message ||
      "You failed to make a placement/movement in the expected time limit"
  );

  return {
    ...newRefereeState,
    failingPlayers: newFailingPlayers,
  };
};

/**
 * Given a RefereeState and optional message, add the current player to the list of
 * cheating players and disqualify them from the game by calling disqualifyCurrentPlayer.
 *
 * @param refereeState the RefereeState to remove current player from active play
 * @param message the message to give the TournamentPlayer about their
 * disqualification, defaulting to a timeout message
 * @return the updated RefereeState
 */
const disqualifyCurrentCheatingPlayer = (
  refereeState: RefereeState,
  message?: string
): RefereeState => {
  // Add current player to list of cheating players
  const newCheatingPlayers = [
    ...refereeState.cheatingPlayers,
    getCurrentPlayer(refereeState.game),
  ];

  // Remove the player from the RefereeState/Game state.
  const newRefereeState = disqualifyCurrentPlayer(
    refereeState,
    message || "You attempted an illegal move/placement"
  );

  return {
    ...newRefereeState,
    cheatingPlayers: newCheatingPlayers,
  };
};

/**
 * Given a RefereeState, disqualify the current player of the RefereeState's Game
 * state by removing them from the Game state and tournamentPlayers. Also notifies
 * the failing/cheating TournamentPlayer (current player) that they have been disqualified
 * and sends message as to why they've been disqualified.
 *
 * @param refereeState the RefereeState from which to disqualify the current player.
 * @param message string message for reason player is being disqualified
 * @return the updated RefereeState
 */
const disqualifyCurrentPlayer = (
  refereeState: RefereeState,
  message: string
): RefereeState => {
  // Notify player they were disqualified
  getCurrentTournamentPlayer(refereeState).disqualifyMe(message);

  // Remove player from list of TournamentPlayers
  const newTournamentPlayers = new Map(refereeState.tournamentPlayers);
  newTournamentPlayers.delete(getCurrentPlayer(refereeState.game).name);

  // Remove player from game
  const newGame = removeDisqualifiedPlayerFromGame(refereeState.game);

  return {
    ...refereeState,
    game: newGame,
    tournamentPlayers: newTournamentPlayers,
  };
};

/**
 * Removes current player from given game by removing their color mapping from
 * scores, penguinPositions, remainingUnplacedPenguins, and removes player from
 * list of players
 *
 * @param game the game to remove the current player from
 * @return the updated Game
 */
const removeDisqualifiedPlayerFromGame = (game: Game): Game => {
  const disqualifiedPlayerColor = getCurrentPlayerColor(game);

  // Remove player from game scores
  const newScores = new Map(game.scores);
  newScores.delete(disqualifiedPlayerColor);

  // Remove player from game penguinPositions
  const newPenguinPositions = new Map(game.penguinPositions);
  newPenguinPositions.delete(disqualifiedPlayerColor);

  // Remove player from game remainingUnplacedPenguins
  const newRemainingUnplacedPenguins = new Map(game.remainingUnplacedPenguins);
  newRemainingUnplacedPenguins.delete(disqualifiedPlayerColor);

  // Remove player from game players
  const newPlayers = [...game.players];
  newPlayers.shift();

  const updatedGame: Game = {
    ...game,
    scores: newScores,
    penguinPositions: newPenguinPositions,
    remainingUnplacedPenguins: newRemainingUnplacedPenguins,
    players: newPlayers,
  };

  return gameIsMovementGame(updatedGame)
    ? skipToNextActivePlayer(updatedGame)
    : updatedGame;
};

/**
 * Add to the scores of each of the given Game's Players the sum of all of
 * the tiles of all of their currently placed penguins.
 *
 * This should only ever be called at the end of the game, after there
 * are no more possible movements. This is only necessary since tile
 * amounts are not added to a player's score until they move from
 * that tile.
 *
 * @param game the Game state to update the scores of
 * @return the update Game state
 */
const addScoresOfPlacedPenguins = (game: Game): Game => {
  const scoresCopy: Map<PenguinColor, number> = new Map(game.scores);

  for (const positionsPerColor of Array.from(game.penguinPositions)) {
    const penguinColor: PenguinColor = positionsPerColor[0];
    const scoreOfPlacedPenguins = positionsPerColor[1].reduce<number>(
      (sum: number, boardPosition: BoardPosition) =>
        sum +
        getTileOnBoard(game.board, boardPosition).unsafelyUnwrap().numOfFish,
      0
    );

    const curScore: number = scoresCopy.get(penguinColor) as number;
    scoresCopy.set(
      penguinColor, curScore + scoreOfPlacedPenguins
    );
  }

  return {
    ...game,
    scores: scoresCopy,
  };
};

/**
 * Generate a GameDevrief from the given RefereeState once the game is complete.
 *
 * @param refereeState the RefereeState to generate the GameDebrief from
 * @return the created GameDebrief
 */
const createGameDebrief = (refereeState: RefereeState): GameDebrief => {
  const compareActivePlayers = (player1: ActivePlayer, player2: ActivePlayer) =>
    player2.score - player1.score;

  // Get the active players from the Game's roster of players.
  const activePlayers: Array<ActivePlayer> = refereeState.game.players
    .map((player: Player) => {
      return {
        name: player.name,
        score: refereeState.game.scores.get(player.color),
      } as ActivePlayer;
    })
    .sort(compareActivePlayers);

  // Get kicked players from the RefereeState.
  const kickedPlayers: Array<InactivePlayer> = [
    ...refereeState.cheatingPlayers,
    ...refereeState.failingPlayers,
  ].map((player: Player) => {
    return { name: player.name };
  });

  return {
    activePlayers,
    kickedPlayers,
  };
};

/**
 * Notify all the given TournamentPlayers about the outcome of the finished
 * game with the given GameDebrief.
 *
 * @param tournamentPlayers the participating players to be notified
 * @param gameDebrief the GameDebrief describing the game's outcome
 */
const notifyPlayersOfOutcome = (
  tournamentPlayers: Array<TournamentPlayer>,
  gameDebrief: GameDebrief
): void => {
  tournamentPlayers.forEach((tournamentPlayer: TournamentPlayer) =>
    tournamentPlayer.gameHasEnded(gameDebrief)
  );
};

// TODO purpose
const notifyObserversOfOutcome = (
  observers: Array<GameObserver>,
  gameDebrief: GameDebrief
): void => {
  observers.forEach((observer: GameObserver) => {
    observer.gameHasEnded(gameDebrief)
  })
}

// TODO purpose
const notifyObserversOfChange = (
  observers: Array<GameObserver>,
  game: Game
): void => {
  observers.forEach((observer: GameObserver) => {
    observer.gameHasChanged(game);
  })
}

/**
 * Get the total number of penguin placements which would be made for the given
 * number of players.
 *
 * @param numOfPlayers the number of players
 */
const numberOfPenguinPlacements = (numOfPlayers: number) =>
  numOfPenguinsPerPlayer(numOfPlayers) * numOfPlayers;

/**
 * Given a number of players and BoardDimensions, determine whether the board
 * is big enough to house all of the players' penguins.
 *
 * @param numOfPlayers the number of participating players
 * @param boardDimension the dimensions of the board to be created in the game
 * @return true if the inputs specify the board is big enough and the
 * corresponding Error if not
 */
const boardIsBigEnough = (
  numOfPlayers: number,
  boardDimension: BoardParameters
): boolean => {
  const numOfPlacements = numberOfPenguinPlacements(numOfPlayers);
  const numOfTilesOnBoard = boardDimension.cols * boardDimension.rows;
  return numOfPlacements <= numOfTilesOnBoard;
};

/**
 * Create a mapping from each given TournamentPlayer's name to the actual TournamentPlayer.
 *
 * @param tournamentPlayers the participating TournamentPlayers to make a mapping from
 * @return the created mapping from names to TournamentPlayers
 */
const createTournamentPlayerMapping = (
  tournamentPlayers: Array<TournamentPlayer>
): Map<string, TournamentPlayer> =>
  new Map(
    tournamentPlayers.map((tournamentPlayer: TournamentPlayer) => [
      tournamentPlayer.name,
      tournamentPlayer,
    ])
  );

/**
 * Given an array of participating TournamentPlayers and a set of
 * BoardDimenesions, setup and run a full Fish game. This call represents the
 * core functionality of the Referee component.
 *
 * As part of running a game, the referee must recognize and respond to both
 * cheating and failing players.
 *
 * Cheating encompasses all cases where a player responds with their placement
 * or move, but the placement or movement is invalid for the current state of
 * the game. These cases are handled here in the referee implementation
 * directly.
 *
 * Failure occurs if the player either fails to respond within a specified
 * timeout or returns a malformed or bad response. Checking for this case
 * is only pertinent once remote communcation is introduced, so it is not
 * handled within the referee implementation here yet.
 *
 * @param tournamentPlayers the TournamentPlayers participating in the game,
 * being at most length 4 and uniquely identified by name. The order of
 * received players is the ordering used when playing
 * @param boardParameters the dimensions of the board to be created in the
 * game, this must at least have enough containers to hold all the players'
 * avatars
 * @return the GameDebrief from the finished game or an Error if the game
 * failed to be created.
 */
const runGame = (
  tournamentPlayers: Array<TournamentPlayer>,
  boardParameters: BoardParameters,
  observers?: Array<GameObserver>
): Result<Promise<GameDebrief>, IllegalBoardError | IllegalGameStateError> => {
  if (!boardIsBigEnough(tournamentPlayers.length, boardParameters)) {
    return err(
      new IllegalBoardError(boardParameters.cols, boardParameters.rows)
    );
  }

  return createInitialGameState(tournamentPlayers, boardParameters).map((game: Game) => {
    return new Promise(async (resolve) => {
      // Create the initial RefereeState.
      const initialRefereeState: RefereeState = {
        game,
        tournamentPlayers: createTournamentPlayerMapping(tournamentPlayers),
        cheatingPlayers: [],
        failingPlayers: [],
      };

      // Notify all players the game is starting.
      notifyPlayersGameStarting(tournamentPlayers, game);

      observers && notifyObserversGameStarting(observers, game);

      // Run placement rounds.
      const refereeStateAfterPlacements = await runPlacementRounds(
        initialRefereeState, PLAYER_REQUEST_TIMEOUT, observers || []
      );

      // Run movement rounds.
      const refereeStateAfterMovements = await runMovementRounds(
        refereeStateAfterPlacements, PLAYER_REQUEST_TIMEOUT, observers || []
      );

      // Deliver the game outcome.
      const gameDebrief: GameDebrief = createGameDebrief(
        refereeStateAfterMovements
      );

      notifyPlayersOfOutcome(tournamentPlayers, gameDebrief);

      observers && notifyObserversOfOutcome(observers, gameDebrief);

      resolve(gameDebrief);
    });
  });
};

/**
 * Gets the winners of a game from the game debrief.
 * The winners are the highest scoring active players in the game.
 *
 * @param debrief the game debrief, which is the outcome of the run game.
 */
const getWinners = (debrief: GameDebrief): Array<ActivePlayer> => {
  const activePlayers = debrief.activePlayers;
  if (activePlayers.length === 0) {
    return [];
  }
  return activePlayers.filter((player: ActivePlayer) => player.score === activePlayers[0].score);
}
/**
 * Gets the losers of a game from the game debrief.
 * The losers are all the players who did not get the highest score in the game.
 *
 * @param debrief the game debrief, which is the outcome of the run game.
 */
const getLosers = (debrief: GameDebrief): Array<ActivePlayer> => {
  const activePlayers = debrief.activePlayers;
  if (activePlayers.length === 0) {
    return [];
  }
  return activePlayers.filter((player: ActivePlayer) => player.score !== activePlayers[0].score);
}

export {
  RefereeState,
  RefereeStateWithMovementGame,
  BoardParameters,
  tournamentPlayersToGamePlayers,
  notifyPlayersGameStarting,
  runPlacementRounds,
  notifyPlayersOfOutcome,
  boardIsBigEnough,
  gameIsFinished,
  disqualifyCurrentCheatingPlayer,
  disqualifyCurrentFailingPlayer,
  disqualifyCurrentPlayer,
  removeDisqualifiedPlayerFromGame,
  createInitialGameState,
  runPlacementTurn,
  runMovementTurn,
  runMovementRounds,
  createGameDebrief,
  addScoresOfPlacedPenguins,
  numberOfPenguinPlacements,
  runGame,
  timeoutRequest,
  PLAYER_REQUEST_TIMEOUT,
  getWinners,
  getLosers,
};
