import { Player, Game } from "../../state";
import { Board, PenguinColor } from "../../board";
import { 
    InvalidNumberOfPlayersError,
} from "../types/errors";


const MAX_NUMBER_OF_PLAYERS = 4;
const MIN_NUMBER_OF_PLAYERS = 2;

/**
 * Sort the given array of Players by age, ascending.
 * 
 * @param players the array of Players to sort
 * @returns array of Players sorted in ascending order by age
 */
const sortPlayersByAge = (players: Array<Player>): Array<Player> => {
    return players.sort((playerA: Player, playerB: Player) => playerA.age - playerB.age);
};

/**
 * Creates array of all unplaced penguins for initial game state. Adds 6 - players.length penguins for each player
 * to array.
 * @param players Array of players for which to create penguins
 * @param playerToColorMapping Mapping of players to colors, used to assign penguin colors
 * @return Array of penguins. Contains 6 - players.length penguins of each color in playerToColorMapping
 */
const buildUnplacedPenguinMap = (players: Array<Player>): Map<Player, number> => {
    const unplacedPenguins: Map<Player, number> = new Map();
    const numPenguins: number = 6 - players.length;
    for (const player of players) {
        unplacedPenguins.set(player, numPenguins);
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
 * @return The new game state with given players, game, and playerToColorMapping
 */
const createGameState = (players: Array<Player>, playerToColorMapping: Map<Player, PenguinColor>, board: Board): Game | InvalidNumberOfPlayersError => {
    // Error check whether the number of players given is valid.
    if (players.length < MIN_NUMBER_OF_PLAYERS || players.length > MAX_NUMBER_OF_PLAYERS) {
        return new InvalidNumberOfPlayersError(players.length);
    }

    // Sort the players by age to get the ordering.
    const playerOrdering: Array<Player> = sortPlayersByAge(players);
    const unplacedPenguins: Map<Player, number> = buildUnplacedPenguinMap(players);

    return {
      players: playerOrdering,
      board,
      curPlayer: playerOrdering[0],
      remainingUnplacedPenguins: unplacedPenguins,
      penguinPositions: new Map(),
      playerToColorMapping,
    };
}

/**
 * Creates a sample game state with the given board FOR TESTING PURPOSES
 * 
 * @param board board to use for game state creation
 */
const createTestGameState = (board: Board): Game | InvalidNumberOfPlayersError => {
    
    const samplePlayer1: Player = { name: "foo", age: 21 };
    const samplePlayer2: Player = { name: "bar", age: 20 };
    const samplePlayers: Array<Player> = [samplePlayer1, samplePlayer2];
    const samplePlayerToColorMapping: Map<Player, PenguinColor> = new Map([
      [samplePlayer1, PenguinColor.Black],
      [samplePlayer2, PenguinColor.Brown],
    ]);
    const game: Game | InvalidNumberOfPlayersError = createGameState(samplePlayers, samplePlayerToColorMapping, board);
    return game;
}

export {
    MAX_NUMBER_OF_PLAYERS,
    sortPlayersByAge,
    createGameState,
    buildUnplacedPenguinMap,
    createTestGameState,
}


