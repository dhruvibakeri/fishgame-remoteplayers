import { PenguinColor, Board, BoardPosition } from '../Common/board';
import { GameIsStarting, MakePlacement, MakeMovement, GameHasEnded, DisqualifyMe, GameDebrief, ActivePlayer, InactivePlayer } from '../Common/player-interface';
import { InvalidBoardConstraintsError, InvalidPositionError, InvalidNumberOfPlayersError, InvalidGameStateError } from '../Common/Controller/types/errors';
import { Game, getCurrentPlayer, getCurrentPlayerColor, MovementGame, Player } from '../Common/state';
import { createHoledOneFishBoard } from '../Common/Controller/src/boardCreation';
import { isError } from '../Common/Controller/src/validation';
import { createGameTreeFromMovementGame, gameIsMovementGame } from '../Common/Controller/src/gameTreeCreation';
import { createGameState } from '../Common/Controller/src/gameStateCreation';
import { movePenguin, placePenguin } from '../Common/Controller/src/penguinPlacement';
import { GameTree, Movement, PotentialMovement } from '../Common/game-tree';
import { isMovementLegal } from '../Common/Controller/src/queryGameTree';

const ACTION_TIMEOUT_MS = 5000;

/**
 * A TournamentPlayer represents an implementation of the player-referee 
 * protocol, specifying both identifying information for the player, along
 * with the various calls that the referee may make to this player in order
 * to notify them of the game starting or ending, request the corresponding
 * actions for their turns, and notify them of potential disqualification.
 * 
 * 
 * @param gameIsStarting call to tell the player that the game is starting
 * @param makePlacement call to ask the player for a penguin placement location
 * @param makeMovement call to ask the player for a penguin movement
 * @param gameHasEnded call to tell the player that the game has ended and give
 * game results
 * @param disqualifyMe call to tell the player they've been disqualified
 */
interface TournamentPlayer {
    name: string;
    gameIsStarting: GameIsStarting;
    makePlacement: MakePlacement;
    makeMovement: MakeMovement;
    gameHasEnded: GameHasEnded;
    disqualifyMe: DisqualifyMe;
}

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

interface RefereeState {
    readonly game: Game;
    readonly tournamentPlayers: Array<TournamentPlayer>;
    readonly cheatingPlayers: Array<Player>;
    readonly failingPlayers: Array<Player>;
}

/**
 * Given an array of TournamentPlayers, returns an array of corresponding Players
 * 
 * @param tournamentPlayers array of TournamentPlayers in the game
 * @returns an array of Players correpsonding to the given array of TournamentPlayers
 */
const tournamentPlayersToGamePlayers = (tournamentPlayers: Array<TournamentPlayer>): Array<Player> => {
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
}

/**
 * Given an array of TournamentPlayers along with the game's initial Game,
 * notify all of the players that the game is beginning.
 * 
 * @param tournamentPlayers the participating TournamentPlayers
 * @param startingGameState the initial Game state
 */
const notifyPlayersGameStarting = (tournamentPlayers: Array<TournamentPlayer>, startingGameState: Game): void => {
    for (const player of tournamentPlayers) {
        player.gameIsStarting(startingGameState);
    }
}

/**
 * Given an array of TournamentPlayers and a set of BoardDimenesions, for a new
 * Fish game, create the Game's initial state.
 * 
 * @param players the TournamentPlayers participating in the game
 * @param boardDimensions the dimensions of the game's board
 * @return the initial Game state.
 */
const createInitialGameState = (tournamentPlayers: Array<TournamentPlayer>, boardDimensions: BoardDimension): Game | InvalidBoardConstraintsError | InvalidPositionError | InvalidNumberOfPlayersError | InvalidGameStateError => {
    // TODO randomize board creation (fish amounts, holes)
    const board: Board | InvalidBoardConstraintsError | InvalidPositionError = createHoledOneFishBoard(boardDimensions.cols, boardDimensions.rows, [], 1);
    const players: Array<Player> = tournamentPlayersToGamePlayers(tournamentPlayers);
    
    if (isError(board)) {
        return board;
    } else {
        return createGameState(players, board);
    }
}

/**
 * Given an array of TournamentPlayers and a RefereeState, kick the current 
 * player of the RefereeState's Game state by removing them from its
 * tournament players and the Game state's players and adding them to
 * the RefereeState's failed/cheating players.
 * 
 * @param refereeState the RefereeState from which to kick the current player.
 * @return the updated RefereeState
 */
const kickCurrentPlayer = (refereeState: RefereeState): RefereeState => {
    // Notify the player they have been kicked.
    const failingPlayer: TournamentPlayer = refereeState.tournamentPlayers[refereeState.game.curPlayerIndex];
    kickFailingPlayer(failingPlayer);

    // Remove the current player from the referee state's tournament players and game state's players.
    // Update the Game state's current player index to the next player.
    // Add the current player to the failed/cheating players.
    // TODO 

    return refereeState; // TODO
}

/**
 * Run the placement rounds of the Game within the given RefereeState, calling 
 * upon players for their placements, attempting these, kicking players if 
 * necessary, and returning the resulting RefereeState with all the placements
 * complete
 * 
 * @param refereeState the RefereeState from which to run the placement rounds
 * @return the resulting RefereeState after running all placements
 */
const runPlacementRounds = (refereeState: RefereeState): RefereeState => {
    // TODO get some type safety by ensuring the given game is a MovementGame
    let currRefereeState: RefereeState = refereeState;

    while (!gameIsMovementGame(refereeState.game)) {
        const placementPosition: BoardPosition = requestPlacementFromPlayer(currRefereeState.tournamentPlayers[currRefereeState.game.curPlayerIndex], currRefereeState.game);
        const resultingGameOrError: Game | Error = placePenguin(currRefereeState.game.players[currRefereeState.game.curPlayerIndex], currRefereeState.game, placementPosition);

        if (isError(resultingGameOrError)) {
            currRefereeState = kickCurrentPlayer(currRefereeState);
        } else {
            currRefereeState = {...currRefereeState, game: resultingGameOrError}
        }
    }

    return currRefereeState;
}

/**
 * Given a MovementGame, determine if the game is finished with no players able
 * to make any more moves.
 */
const gameIsFinished = (game: MovementGame): boolean => {
    const gameTree: GameTree = createGameTreeFromMovementGame(game);
    return gameTree.potentialMoves.length === 0;
}

/**
 * Run the movement rounds of the Game within the given RefereeState, calling 
 * upon players for their movements, attempting these, kicking players if 
 * necessary, and returning ther resulting RefereeState once the game is
 * complete.
 * 
 * @param refereeState the RefereeState from which to run the placement rounds
 * @return the resulting RefereeState after finishing the game
 */
const runMovementRounds = (refereeState: RefereeState) => {
    let currRefereeState: RefereeState = refereeState;

    while(!gameIsFinished(currRefereeState.game as MovementGame)) {
        const movement: Movement = requestMovementFromPlayer(currRefereeState.tournamentPlayers[currRefereeState.game.curPlayerIndex], currRefereeState.game);
        const resultingGameOrError: Game | Error = movePenguin(currRefereeState.game as MovementGame, getCurrentPlayer(currRefereeState.game), movement.startPosition, movement.endPosition);
        // TODO use query game tree to validate the movement?

        if (isError(resultingGameOrError)) {
            currRefereeState = kickCurrentPlayer(refereeState);
        } else {
            currRefereeState = {...currRefereeState, game: resultingGameOrError }
        }
    }

    return currRefereeState;
}

const getTournamentPlayerFromPlayer = (tournamentPlayers: Array<TournamentPlayer>, player: Player): TournamentPlayer => {
    return tournamentPlayers.find((tournamentPlayer: TournamentPlayer) => tournamentPlayer.name === player.name);
}

/**
 * Call the given TournamentPlayer's DisqualifyMe call to notify them of their 
 * disqualification from the game using a given message if specified.
 * 
 * @param tournamentPlayer the TournamentPlayer to disqualify
 * @param message the message to give the TournamentPlayer about their 
 * disqualification, defaulting to a timeout message
 */
const kickFailingPlayer = (tournamentPlayer: TournamentPlayer, message?: string): void => {
    tournamentPlayer.disqualifyMe(message || 'You failed to make a placement/movement in the expected time limit');
}

const applyTime

const requestPlacementFromPlayer = (tournamentPlayer: TournamentPlayer, game: Game): Promise<BoardPosition> => {
    return tournamentPlayer.makePlacement()
    gi
}

const requestMovementFromPlayer = (tournamentPlayer: TournamentPlayer, game: Game): Movement => {

}

/**
 * Generate a GameDevrief from the given RefereeState once the game is complete.
 * 
 * @param refereeState the RefereeState to generate the GameDebrief from
 * @return the GameDebrief
 */
const createGameDebrief = (refereeState: RefereeState): GameDebrief => {
    const activePlayers: Array<ActivePlayer> = refereeState.game.players.map((player: Player) => {
        return {
            name: player.name,
            score: refereeState.game.scores.get(player.color)
        }
    });

    const kickedPlayers: Array<InactivePlayer> = [...refereeState.cheatingPlayers, ...refereeState.failingPlayers].map((player: Player) => {
        return {name: player.name}
    });
    
    return {
        activePlayers,
        kickedPlayers
    }
}

/**
 * Notify all the given TournamentPlayers about the outcome of the finished 
 * game with the given GameDebrief.
 * 
 * @param tournamentPlayers the participating players to be notified
 * @param gameDebrief the GameDebrief describing the game's outcome
 */
const notifyPlayersOfOutcome = (tournamentPlayers: Array<TournamentPlayer>, gameDebrief: GameDebrief): void => {
    tournamentPlayers.forEach((tournamentPlayer: TournamentPlayer) => tournamentPlayer.gameHasEnded(gameDebrief))
}

/**
 * Run an entire ga
 *using the given tour/
const runGame = (tournamentPlayers: Array<TournamentPl ayer>, boardDimensions: BoardDimension): GameDebrief | Error => { // TODO say the specific errors that could occur
    // Create the initial state, return error if fails.
    const initialGameOrError: Game | Error = createInitialGameState(tournamentPlayers, boardDimensions);

    if (isError(initialGameOrError)) {
        return initialGameOrError;
    }

    // Create the initial RefereeState.
    const initialRefereeState: RefereeState = {
        tournamentPlayers,
        game: initialGameOrError,
        cheatingPlayers: [],
        failingPlayers: []
    }

    // Notify all players the game is starting.
    notifyPlayersGameStarting(tournamentPlayers, initialGameOrError);

    // Run placement rounds.
    const refereeStateAfterPlacements = runPlacementRounds(initialRefereeState);

    // Run movement rounds.
    const refereeStateAfterMovements = runMovementRounds(refereeStateAfterPlacements);

    // Deliver the game outcome.
    const gameDebrief: GameDebrief = createGameDebrief(refereeStateAfterMovements);
    notifyPlayersOfOutcome(tournamentPlayers, gameDebrief); // TODO currently this notifies ALL players of the outcome regardless of whether they've been kicked. Is this what we want?
    return gameDebrief;
}

