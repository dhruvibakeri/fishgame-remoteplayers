import { Player, Game } from "../types/state";
import { Board, BoardPosition, Penguin, PenguinColor } from "../types/board";
import { 
    InvalidNumberOfPlayersError, 
    InvalidPositionError, 
    IllegalPenguinMoveError, 
    InvalidGameStateError
} from "../types/errors";
import { isPenguin, playerHasUnplacedPenguin, positionIsOnBoard, positionIsPlayable, validatePenguinMove } from "./validation";


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
 * Creates array of all unplaced penguins for initial game state. Adds 6 - players.length penguins for each player
 * to array.
 * @param players Array of players for which to create penguins
 * @param playerToColorMapping Mapping of players to colors, used to assign penguin colors
 * @returns Array of penguins. Contains 6 - players.length penguins of each color in playerToColorMapping
 */
const buildUnplacedPenguinArray = (players: Array<Player>, playerToColorMapping: Map<Player, PenguinColor>): Array<Penguin> => {
    const unplacedPenguins: Array<Penguin> = [];
    for (const player of players) {
        const color = playerToColorMapping.get(player);
        for (let index = 0; index < (6 - players.length); index++) {
            unplacedPenguins.push({ color });
        }
    }

    return unplacedPenguins;
}

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
    const unplacedPenguins: Array<Penguin> = buildUnplacedPenguinArray(players, playerToColorMapping);

    return {
      players: playerOrdering,
      board,
      curPlayer: playerOrdering[0],
      unplacedPenguins: unplacedPenguins,
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
const placePenguin = (player: Player, game: Game, position: BoardPosition): Game | InvalidPositionError | InvalidGameStateError => {
    if (!positionIsOnBoard(game.board, position)) {
        return new InvalidPositionError(game.board, position);
    }

    if (!playerHasUnplacedPenguin(player, game)) {
        return new InvalidGameStateError(game, "Player does not have any remaining unplaced penguins");
    }

    const playerColor = game.playerToColorMapping.get(player);
    const penguinToPlaceIndex = game.unplacedPenguins.findIndex((penguin: Penguin) => { penguin.color === playerColor });
    const penguinToPlace = game.unplacedPenguins[penguinToPlaceIndex];
    const newUnplacedPenguinArray = game.unplacedPenguins.splice(penguinToPlaceIndex, 1);

    // Validate the move and get the Penguin being moved.
    if (positionIsPlayable(game, position)) {
        const updatedPenguinPositions: Map<BoardPosition, Penguin> = movePenguinInPenguinPositions(
            game.penguinPositions, 
            penguinToPlace,
            position
        );
        return {
            ...game,
            unplacedPenguins: newUnplacedPenguinArray,
            penguinPositions: updatedPenguinPositions,
        };
    }

    return new InvalidPositionError(game.board, position);
}

// TODO test
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
    endPosition: BoardPosition,
    startPosition?: BoardPosition
): Map<BoardPosition, Penguin> => {
    // Copy the given position mapping.
    const newPenguinPositions: Map<BoardPosition, Penguin> = new Map(penguinPositions);

    // Remove the Penguin at the start position.
    if (startPosition) {
        newPenguinPositions.delete(startPosition);
    }

    // Add the Penguin to its end position.
    newPenguinPositions.set(endPosition, penguin);

    return newPenguinPositions;
}

// TODO test
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
): Game | InvalidPositionError | IllegalPenguinMoveError | InvalidGameStateError => {
    // Verify that the start and end positions are valid.
    if (!positionIsOnBoard(game.board, startPosition)) {
        return new InvalidPositionError(game.board, startPosition);
    } else if (!positionIsOnBoard(game.board, endPosition)) {
        return new InvalidPositionError(game.board, endPosition);
    }

    // Validate the move and get the Penguin being moved.
    const playerPenguinOrError: Penguin | IllegalPenguinMoveError | InvalidGameStateError = validatePenguinMove(game, player, startPosition, endPosition);

    if (isPenguin(playerPenguinOrError)) {
        // If the move is valid, update the Game state's Penguin position 
        // mapping and return the new state. 
        const updatedPenguinPositions: Map<BoardPosition, Penguin> = movePenguinInPenguinPositions(
            game.penguinPositions, 
            playerPenguinOrError, 
            endPosition,
            startPosition, 
        );

        return {
            ...game,
            penguinPositions: updatedPenguinPositions
        }
    } else {
        // If the move was not valid, return the error.
        return playerPenguinOrError;
    }
}

export {
    MAX_NUMBER_OF_PLAYERS,
    sortPlayersByAge,
    createState,
}


