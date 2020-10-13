import { Player, Game } from "../types/state";
import { Board, BoardPosition, Penguin, PenguinColor } from "../types/board";
import { 
    InvalidNumberOfPlayersError, 
    InvalidPositionError, 
    InvalidGameStateError,
    IllegalPenguinPositionError
} from "../types/errors";
import { isError, validatePenguinMove, validatePenguinPlacement } from "./validation";


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
 * @return the Game state with the updated board or an error
 */
const placePenguin = (game: Game, player: Player, position: BoardPosition): Game | InvalidGameStateError | InvalidPositionError | IllegalPenguinPositionError => {

}

/**
 * Delete the penguin at the given start position in the given penguin position
 * mapping and add the given penguin at the given end position in the mapping.
 * 
 * @param penguinPositions the Penguin position mapping
 * @param penguin the Penguin to move to the end position
 * @param startPosition the starting position to clear within the mapping
 * @param endPosition the end position to add the Penguin to
 * @return the new updated position mapping
 */
const movePenguinInPenguinPositions = (
    penguinPositions: Map<BoardPosition, Penguin>, 
    penguin: Penguin,
    startPosition: BoardPosition, 
    endPosition: BoardPosition
): Map<BoardPosition, Penguin> => {
    // Copy the given position mapping.
    const newPenguinPositions: Map<BoardPosition, Penguin> = new Map(penguinPositions);

    // Remove the Penguin at the start position.
    newPenguinPositions.delete(startPosition);

    // Add the Penguin to its end position.
    newPenguinPositions.set(endPosition, penguin);

    return newPenguinPositions;
}

/**
 * Move the given Player's penguin at the given start position on the Board of
 * the given Game state to a given end position.
 * 
 * @param game the Game state
 * @param player the Player who is moving their Penguin
 * @param startPosition the position of Penguin the Player wishes to move
 * @param endPosition the position the Player wants to move its Penguin to
 * @return the new Game state with the resulting move or an error
 */
const movePenguin = (
    game: Game, 
    player: Player, 
    startPosition: BoardPosition, 
    endPosition: BoardPosition
): Game | InvalidPositionError | IllegalPenguinPositionError | InvalidGameStateError => {
    // Validate the move and get the Penguin being moved.
    const playerPenguinOrError: Penguin | IllegalPenguinPositionError | InvalidGameStateError | InvalidPositionError = validatePenguinMove(game, player, startPosition, endPosition);

    if (isError(playerPenguinOrError)) {
        // If the move was invalid, return the error.
        return playerPenguinOrError;
    } else {
        // If the move is valid, update the Game state's Penguin position 
        // mapping and return the new state. 
        const updatedPenguinPositions = movePenguinInPenguinPositions(
            game.penguinPositions, 
            playerPenguinOrError, 
            startPosition, 
            endPosition
        );

        return {
            ...game,
            penguinPositions: updatedPenguinPositions
        }
    }
}

export {
    MAX_NUMBER_OF_PLAYERS,
    sortPlayersByAge,
    createState,
    movePenguinInPenguinPositions,
    movePenguin
}


