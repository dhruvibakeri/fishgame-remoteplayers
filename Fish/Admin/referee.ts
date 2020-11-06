import { PenguinColor, Board, BoardPosition, Tile } from "../Common/board";
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
import {
  createHoledOneFishBoard,
  getTileOnBoard,
} from "../Common/Controller/src/boardCreation";
import { isError } from "../Common/Controller/src/validation";
import {
  createGameTreeFromMovementGame,
  gameIsMovementGame,
} from "../Common/Controller/src/gameTreeCreation";
import {
  createGameState,
  getNextPlayerIndex,
  numOfPenguinsPerPlayer,
  skipToNextActivePlayer,
} from "../Common/Controller/src/gameStateCreation";
import { placePenguin } from "../Common/Controller/src/penguinPlacement";
import { GameTree, Movement } from "../Common/game-tree";
import { TournamentPlayer } from "../Common/player-interface";
import { isMovementLegal } from "../Common/Controller/src/queryGameTree";

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

/**
 * A RefereeStateWithMovementGame represents a RefereeState once the Game
 * has entered the movement stage of the Game, i.e. once all placements are
 * made. It is simply a RefereeState where the Game state is a MovementGame.
 */
type RefereeStateWithMovementGame = RefereeState & { game: MovementGame };

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
  // Create the game board to the given dimensions.
  const board:
    | Board
    | InvalidBoardConstraintsError
    | InvalidPositionError = createHoledOneFishBoard(
    boardDimensions.cols,
    boardDimensions.rows,
    [],
    1
  );

  // Create the Game state's player roster.
  const players: Array<Player> = tournamentPlayersToGamePlayers(
    tournamentPlayers
  );

  if (isError(board)) {
    return board;
  } else {
    // Create the Game state.
    return createGameState(players, board);
  }
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
): RefereeState => {
  const resultingGameOrError: Game | Error = placePenguin(
    getCurrentPlayer(currRefereeState.game),
    currRefereeState.game,
    placementPosition
  );

  if (isError(resultingGameOrError)) {
    // Make no placement and instead disqualify the cheating player.
    return disqualifyCurrentCheatingPlayer(currRefereeState);
  } else {
    // Update the RefereeState's Game state with the Game updated with the placement.
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
  let currRefereeState: RefereeState = refereeState;

  while (!gameIsMovementGame(currRefereeState.game)) {
    const currentTournamentPlayer: TournamentPlayer =
      currRefereeState.tournamentPlayers[currRefereeState.game.curPlayerIndex];
    const placementPosition: BoardPosition = currentTournamentPlayer.makePlacement(
      currRefereeState.game
    );

    currRefereeState = runPlacementTurn(placementPosition, currRefereeState);
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
    // Update the RefereeState's Game state with the Game updated with the move.
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
    const currentTournamentPlayer: TournamentPlayer =
      currRefereeState.tournamentPlayers[currRefereeState.game.curPlayerIndex];
    const movement: Movement = currentTournamentPlayer.makeMovement(
      currRefereeState.game
    );

    currRefereeState = runMovementTurn(movement, currRefereeState);
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
    ...refereeState.cheatingPlayers,
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
  const newPlayers = game.players.filter(
    (player: Player) => player.color !== disqualifiedPlayerColor
  );

  // Calculate next player index
  const nextPlayerIndex =
    game.curPlayerIndex === game.players.length - 1 ? 0 : game.curPlayerIndex;

  const updatedGame: Game = {
    ...game,
    scores: newScores,
    penguinPositions: newPenguinPositions,
    remainingUnplacedPenguins: newRemainingUnplacedPenguins,
    players: newPlayers,
    curPlayerIndex: nextPlayerIndex,
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
        sum + (getTileOnBoard(game.board, boardPosition) as Tile).numOfFish,
      0
    );

    scoresCopy.set(
      penguinColor,
      scoresCopy.get(penguinColor) + scoreOfPlacedPenguins
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
  const updatedScoresRefereeState: RefereeState = {
    ...refereeState,
    game: addScoresOfPlacedPenguins(refereeState.game),
  };

  // Get the active players from the Game's roster of players.
  const activePlayers: Array<ActivePlayer> = updatedScoresRefereeState.game.players.map(
    (player: Player) => {
      return {
        name: player.name,
        score: updatedScoresRefereeState.game.scores.get(player.color),
      };
    }
  );

  // Get kicked players from the RefereeState.
  const kickedPlayers: Array<InactivePlayer> = [
    ...updatedScoresRefereeState.cheatingPlayers,
    ...updatedScoresRefereeState.failingPlayers,
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
  boardDimension: BoardDimension
): true | InvalidBoardConstraintsError => {
  const numOfPlacements = numberOfPenguinPlacements(numOfPlayers);
  const numOfTilesOnBoard = boardDimension.cols * boardDimension.rows;
  const enoughPlacements = numOfPlacements <= numOfTilesOnBoard;

  if (!enoughPlacements) {
    return new InvalidBoardConstraintsError(
      boardDimension.cols,
      boardDimension.rows
    );
  } else {
    return true;
  }
};

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
 * @param boardDimensions the dimensions of the board to be created in the
 * game, this must at least have enough containers to hold all the players'
 * avatars
 * @return the GameDebrief from the finished game or an Error if the game
 * failed to be created.
 */
const runGame = (
  tournamentPlayers: Array<TournamentPlayer>,
  boardDimensions: BoardDimension
): GameDebrief | Error => {
  // Ensure that the board is big enough for all placements.
  const isBoardBigEnoughOrError = boardIsBigEnough(
    tournamentPlayers.length,
    boardDimensions
  );

  if (isError(isBoardBigEnoughOrError)) {
    return isBoardBigEnoughOrError;
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
  notifyPlayersOfOutcome(tournamentPlayers, gameDebrief);

  return gameDebrief;
};

export {
  RefereeState,
  RefereeStateWithMovementGame,
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
};
