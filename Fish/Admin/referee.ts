import { PenguinColor, Board, BoardPosition } from "../Common/board";
import {
  GameDebrief,
  ActivePlayer,
  InactivePlayer,
} from "../Common/player-interface";
import {
  InvalidBoardConstraintsError,
  InvalidPositionError,
  InvalidNumberOfPlayersError,
  InvalidGameStateError,
} from "../Common/Controller/types/errors";
import {
  Game,
  MovementGame,
  Player,
  getCurrentPlayerColor,
  getCurrentPlayer,
} from "../Common/state";
import { createHoledOneFishBoard } from "../Common/Controller/src/boardCreation";
import { isError } from "../Common/Controller/src/validation";
import {
  createGameTreeFromMovementGame,
  gameIsMovementGame,
} from "../Common/Controller/src/gameTreeCreation";
import {
  createGameState,
  isValidNumberOfPlayers,
  numOfPenguinsPerPlayer,
  PENGUIN_AMOUNT_N,
  getNextPlayerIndex,
} from "../Common/Controller/src/gameStateCreation";
import { placePenguin } from "../Common/Controller/src/penguinPlacement";
import { GameTree, Movement } from "../Common/game-tree";
import { TournamentPlayer } from "../Common/player-interface";
import { isMovementLegal } from "../Common/Controller/src/queryGameTree";

const ACTION_TIMEOUT_MS = 5000;

/**
 * A BoardDimension represents the size of a board within a Fish game. It
 * specifies both the number of rows and the number of columns in the board.
 *
 * @param rows the number of rows in the board, must be a positive integer
 * @param cols the number of columns in the board, must be a positive integer
 */
interface BoardDimension {
  readonly rows: number;
  readonly cols: number;
}

/**
 * A RefereeState is a composition of a Game state used by the Referee
 * component for tracking the state of the Game it is running along
 * with other necessary values that are not specific to a Game, but
 * are necessary for running it.
 *
 * @param game the current Game state of the Game this referee is running
 * @param tournamentPlayers an array of the TournamentPlayers participating in
 * this game, each representing an individual player's implementation of the
 * Player-Referee protocol
 * @param cheatingPlayers an array of all the players currently caught cheating
 * throughout the game, where a cheating player is one who has provided a
 * placement or movement that violates the rules of the game
 * @param failingPlayers an array of all the players currently who have failed
 * to provide an action for their turn within the specified timeout when
 * requested of them
 */
interface RefereeState {
  readonly game: Game;
  readonly tournamentPlayers: Array<TournamentPlayer>;
  readonly cheatingPlayers: Array<Player>;
  readonly failingPlayers: Array<Player>;
}

type RefereeStateWithMovementGame = RefereeState & { game: MovementGame };

/**
 * Given an array of TournamentPlayers, returns an array of corresponding Players.
 * The given array of tournament players is assumed to be less than or equal to
 * 4 in length, corresponding to the max amount of players.
 *
 * @param tournamentPlayers array of TournamentPlayers in the game
 * @returns an array of Players correpsonding to the given array of TournamentPlayers
 */
const tournamentPlayersToGamePlayers = (
  tournamentPlayers: Array<TournamentPlayer>
): Array<Player> => {
  const players: Array<Player> = [];
  for (const penguinColor in PenguinColor) {
    if (players.length < tournamentPlayers.length) {
      players.push({
        name: tournamentPlayers[players.length].name,
        color: PenguinColor[penguinColor],
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
  boardDimensions: BoardDimension
):
  | Game
  | InvalidBoardConstraintsError
  | InvalidPositionError
  | InvalidNumberOfPlayersError
  | InvalidGameStateError => {
  // TODO randomize board creation (fish amounts, holes)
  const board:
    | Board
    | InvalidBoardConstraintsError
    | InvalidPositionError = createHoledOneFishBoard(
    boardDimensions.cols,
    boardDimensions.rows,
    [],
    1
  );
  const players: Array<Player> = tournamentPlayersToGamePlayers(
    tournamentPlayers
  );

  if (isError(board)) {
    return board;
  } else {
    return createGameState(players, board);
  }
};

const runPlacementTurn = (
  placementPosition: BoardPosition,
  currRefereeState: RefereeState
): RefereeState => {
  const resultingGameOrError: Game | Error = placePenguin(
    currRefereeState.game.players[currRefereeState.game.curPlayerIndex],
    currRefereeState.game,
    placementPosition
  );

  if (isError(resultingGameOrError)) {
    return disqualifyCurrentCheatingPlayer(currRefereeState);
  } else {
    return { ...currRefereeState, game: resultingGameOrError };
  }
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
const runPlacementRounds = (
  refereeState: RefereeState
): RefereeStateWithMovementGame => {
  // TODO get some type safety by ensuring the given game is a MovementGame
  let currRefereeState: RefereeState = refereeState;

  while (!gameIsMovementGame(currRefereeState.game)) {
    requestPlacementFromPlayer(
      currRefereeState.tournamentPlayers[currRefereeState.game.curPlayerIndex],
      currRefereeState.game
    )
      .then((placementPosition: BoardPosition) => {
        currRefereeState = runPlacementTurn(
          placementPosition,
          currRefereeState
        );
      })
      .catch(() => {
        // TODO fail the player
      });
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

const runMovementTurn = (
  movement: Movement,
  currRefereeState: RefereeStateWithMovementGame
): RefereeStateWithMovementGame => {
  const gameTree: GameTree = createGameTreeFromMovementGame(
    currRefereeState.game
  );
  const result: MovementGame | Error = isMovementLegal(gameTree, movement);

  if (isError(result)) {
    // Disqualifying a player only changes penguin positions by removing a player.
    // This means that if the given RefereeState is a
    // RefereeStateWithMovementGame, then the result must also be one.
    return disqualifyCurrentCheatingPlayer(
      currRefereeState,
      result.message
    ) as RefereeStateWithMovementGame;
  } else {
    return {
      ...currRefereeState,
      game: result,
    };
  }
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
const runMovementRounds = (refereeState: RefereeStateWithMovementGame) => {
  let currRefereeState: RefereeStateWithMovementGame = refereeState;

  while (!gameIsFinished(currRefereeState.game as MovementGame)) {
    requestMovementFromPlayer(
      currRefereeState.tournamentPlayers[currRefereeState.game.curPlayerIndex],
      currRefereeState.game
    )
      .then((movement: Movement) => {
        currRefereeState = runMovementTurn(movement, currRefereeState);
      })
      .catch(() => {
        // TODO fail player
      });
  }

  return currRefereeState;
};

const getTournamentPlayerFromPlayer = (
  tournamentPlayers: Array<TournamentPlayer>,
  player: Player
): TournamentPlayer => {
  return tournamentPlayers.find(
    (tournamentPlayer: TournamentPlayer) =>
      tournamentPlayer.name === player.name
  );
};

/**
 * Given a RefereeState and optional message, add the current player to the list of
 * failing players and disqualify them from the game by calling disqualifyCurrentPlayer
 *
 * @param refereState the RefereeState to remove current player from active play
 * @param message the message to give the TournamentPlayer about their
 * disqualification, defaulting to a timeout message
 */
const disqualifyCurrentFailingPlayer = (
  refereeState: RefereeState,
  message?: string
): RefereeState => {
  // Add current player to list of failing players
  const newFailingPlayers = [...refereeState.cheatingPlayers];
  newFailingPlayers.push(getCurrentPlayer(refereeState.game));

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
 * cheating players and disqualify them from the game by calling disqualifyCurrentPlayer
 *
 * @param refereState the RefereeState to remove current player from active play
 * @param message the message to give the TournamentPlayer about their
 * disqualification, defaulting to a timeout message
 */
const disqualifyCurrentCheatingPlayer = (
  refereeState: RefereeState,
  message?: string
): RefereeState => {
  // Add current player to list of cheating players
  const newCheatingPlayers = [...refereeState.cheatingPlayers];
  newCheatingPlayers.push(getCurrentPlayer(refereeState.game));

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
  refereeState.tournamentPlayers[refereeState.game.curPlayerIndex].disqualifyMe(
    message
  );

  // Remove player from list of TournamentPlayers
  const newTournamentPlayers = [...refereeState.tournamentPlayers];
  newTournamentPlayers.splice(refereeState.game.curPlayerIndex, 1);

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
 * list fo players
 */
const removeDisqualifiedPlayerFromGame = (game: Game): Game => {
  const disqualifiedPlayerColor = getCurrentPlayerColor(game);

  // Remove player from game scores
  const newScores = new Map([...game.scores]);
  newScores.delete(disqualifiedPlayerColor);

  // Remove player from game penguinPositions
  const newPenguinPositions = new Map([...game.penguinPositions]);
  newPenguinPositions.delete(disqualifiedPlayerColor);

  // Remove player from game remainingUnplacedPenguins
  const newRemainingUnplacedPenguins = new Map([
    ...game.remainingUnplacedPenguins,
  ]);
  newRemainingUnplacedPenguins.delete(disqualifiedPlayerColor);

  // Remove player from game players
  const newPlayers = [...game.players].splice(game.curPlayerIndex, 1);

  const nextPlayerIndex =
    getNextPlayerIndex(game) - 1 > 0 ? getNextPlayerIndex(game) : 0;

  const newGame = {
    ...game,
    scores: newScores,
    penguinPositions: newPenguinPositions,
    remainingUnplacedPenguins: newRemainingUnplacedPenguins,
    players: newPlayers,
  };

  return {
    ...game,
    scores: newScores,
    penguinPositions: newPenguinPositions,
    remainingUnplacedPenguins: newRemainingUnplacedPenguins,
    players: newPlayers,
    curPlayerIndex: nextPlayerIndex,
  };
};

/**
 * Create a Promise which rejects after a timeout period, with an error
 * message, meant to be used to apply a timeout to a request to a
 * player that requires a response.
 *
 * @param currentPlayer the TournamentPlayer who is being requested
 * @return a Promise that will reject after a timeout
 */
const setTimeoutPlayerRequest = <T>(currentPlayer: TournamentPlayer) =>
  new Promise<T>((resolve, reject) => {
    setTimeout(
      () =>
        reject(
          `${currentPlayer.name} did not respond within ${ACTION_TIMEOUT_MS}ms.`
        ),
      ACTION_TIMEOUT_MS
    );
  });

/**
 * Request a given TournamentPlayer's next placement for the given Game,
 * along with a timeout.
 *
 * @param tournamentPlayer the TournamentPlayer being requested
 * @param game the Game from which they must place a penguin
 * @return a Promise containing their placement BoardPosition
 */
const requestPlacementFromPlayer = (
  tournamentPlayer: TournamentPlayer,
  game: Game
): Promise<BoardPosition> => {
  return Promise.race([
    tournamentPlayer.makePlacement(game),
    setTimeoutPlayerRequest<BoardPosition>(tournamentPlayer),
  ]);
};

/**
 * Request a given TournamentPlayer's next movement for the given Game,
 * along with a timeout.
 *
 * @param tournamentPlayer the TournamentPlayer being requested
 * @param game the Game from which they must move a penguin
 * @return a Promise containing their Movement
 */
const requestMovementFromPlayer = (
  tournamentPlayer: TournamentPlayer,
  game: Game
): Promise<Movement> => {
  return Promise.race([
    tournamentPlayer.makeMovement(game),
    setTimeoutPlayerRequest<Movement>(tournamentPlayer),
  ]);
};

/**
 * Generate a GameDevrief from the given RefereeState once the game is complete.
 *
 * @param refereeState the RefereeState to generate the GameDebrief from
 * @return the GameDebrief
 */
const createGameDebrief = (refereeState: RefereeState): GameDebrief => {
  const activePlayers: Array<ActivePlayer> = refereeState.game.players.map(
    (player: Player) => {
      return {
        name: player.name,
        score: refereeState.game.scores.get(player.color),
      };
    }
  );

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

const numberOfPenguinPlacements = (numOfPlayers: number) => {
  return numOfPenguinsPerPlayer(numOfPlayers) * numOfPlayers;
};

/**
 * Given an array of TournamentPlayers and BoardDimensions i.e. the input to a
 * Referee's runGame, determine whether the specified game is valid, returning
 * true if it is or the corresponding error if not.
 *
 * @param tournamentPlayers the TournamentPlayers participating in the game
 * @param boardDimension the dimensions of the board to be created in the game
 * @return true if the inputs specify a valid game (board is big enough for
 * all placements, valid number of players) and the corresponding Error if not
 */
const validGameSpecified = (
  tournamentPlayers: Array<TournamentPlayer>,
  boardDimension: BoardDimension
): true | InvalidBoardConstraintsError | InvalidNumberOfPlayersError => {
  const numOfPlacements = numberOfPenguinPlacements(tournamentPlayers.length);
  const numOfTilesOnBoard = boardDimension.cols * boardDimension.rows;
  const enoughPlacements = numOfPlacements <= numOfTilesOnBoard;

  if (!enoughPlacements) {
    return new InvalidBoardConstraintsError(
      boardDimension.cols,
      boardDimension.rows
    );
  } else if (!isValidNumberOfPlayers(tournamentPlayers.length)) {
    return new InvalidNumberOfPlayersError(tournamentPlayers.length);
  } else {
    return true;
  }
};

/**
 * Given an array of participating TournamentPlayers and a set of
 * BoardDimenesions, setup and run a full Fish game. This call represents the
 * core functionality of the Referee component.
 *
 * @param tournamentPlayers the TournamentPlayers participating in the game,
 * being at most length 4 and uniquely identified by name. The order of
 * received players is the ordering used when playing
 * @param boardDimensions the dimensions of the board to be created in the
 * game, this must at least have enough containers to hold all the players'
 * avatars
 */
const runGame = (
  tournamentPlayers: Array<TournamentPlayer>,
  boardDimensions: BoardDimension
): GameDebrief | Error => {
  // Ensure that the board is big enough for all placements and that the
  // number of players given is valid.
  const isValidInputsOrError: true | Error = validGameSpecified(
    tournamentPlayers,
    boardDimensions
  );

  if (isError(isValidInputsOrError)) {
    return isValidInputsOrError;
  }

  // Create the initial state, return error if fails.
  const initialGameOrError: Game | Error = createInitialGameState(
    tournamentPlayers,
    boardDimensions
  );

  if (isError(initialGameOrError)) {
    return initialGameOrError;
  }

  // Create the initial RefereeState.
  const initialRefereeState: RefereeState = {
    game: initialGameOrError,
    tournamentPlayers,
    cheatingPlayers: [],
    failingPlayers: [],
  };

  // Notify all players the game is starting.
  notifyPlayersGameStarting(tournamentPlayers, initialGameOrError);

  // Run placement rounds.
  const refereeStateAfterPlacements = runPlacementRounds(initialRefereeState);

  // Run movement rounds.
  const refereeStateAfterMovements = runMovementRounds(
    refereeStateAfterPlacements
  );

  // Deliver the game outcome.
  const gameDebrief: GameDebrief = createGameDebrief(
    refereeStateAfterMovements
  );
  notifyPlayersOfOutcome(tournamentPlayers, gameDebrief); // TODO currently this notifies ALL players of the outcome regardless of whether they've been kicked. Is this what we want?
  return gameDebrief;
};

export { tournamentPlayersToGamePlayers };
