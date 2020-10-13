import { Player, Game } from "../types/state";
import { Board, BoardPosition, Penguin, PenguinColor } from "../types/board";
import { InvalidNumberOfPlayersError, InvalidPositionError } from "../types/errors";
import { positionIsOnBoard } from "./validation";

const MAX_NUMBER_OF_PLAYERS = 4;
const MIN_NUMBER_OF_PLAYERS = 2;

/**
 * Sort the given array of Players by age, ascending.
 * 
 * @param players the array of Players to sort
 */
const sortPlayersByAge = (players: Array<Player>): Array<Player> => {
    return players.sort((playerA: Player, playerB: Player) => playerA.age - playerB.age);
};

/**
 * Create a new Game state given an array of Players, their color mappings, and
 * a created board.
 * 
 * @param players the array of Players playing this game
 * @param playerToColorMapping a bijection from Players and their PenguinColors
 * @param board the board to be played on within this game
 */
const createState = (players: Array<Player>, playerToColorMapping: Map<Player, PenguinColor>, board: Board): Game | InvalidNumberOfPlayersError => {
    // Error check whether the number of players given is valid.
    if (players.length < MIN_NUMBER_OF_PLAYERS || players.length > MAX_NUMBER_OF_PLAYERS) {
        return new InvalidNumberOfPlayersError(players.length);
    }

    // Sort the players by age to get the ordering.
    const playerOrdering: Array<Player> = sortPlayersByAge(players);

    return {
      players: playerOrdering,
      board,
      curPlayer: playerOrdering[0],
      penguinPositions: new Map(),
      playerToColorMapping
    };
}

/**
 * Places a penguin on behalf of a player. Takes in a penguin, position, and game state,
 * and places the penguin at the given position if it is a valid position.
 * 
 * @param penguin Penguin to be placed
 * @param game Current game state
 * @param position Position at which to place the penguin
 */
const placePenguin = (penguin: Penguin, game: Game, position: BoardPosition): Game | InvalidPositionError => {
    if (!positionIsOnBoard(game.board, position)) {
        return new InvalidPositionError(game.board, position);
    }

    
}

const movePenguin = (game: Game, player: Player, startPosition: BoardPosition, endPosition: BoardPosition): Game => {
    
}

export {
    MAX_NUMBER_OF_PLAYERS,
    sortPlayersByAge,
    createState,
}


