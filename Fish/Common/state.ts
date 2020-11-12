import { Board, BoardPosition, PenguinColor } from "./board";

/**
 * A Player is a structure representing a single Player within a Game. It
 * contains information to identify and set an ordering for players within a
 * game.
 *
 * @param name the Player's name used to identify a player, this must be unique across players within a single Game.
 * @param color this Player's assigned color
 */
interface Player {
  readonly name: string;
  readonly color: PenguinColor;
}

/**
 * A Game is a structure representing the current game state of a fish game.
 *
 * @param players the array of Players participating in this game, in the
 * ordering which they will take turns, shifted such that the first player
 * of the array is always the current player.
 * @param board the current Board of the game
 * @param penguinPositions a Map from each PenguinColor to the BoardPositions
 * of each of that color's Penguins
 * @param remainingUnplacedPenguins a Map from a player's color to a number, the number represents how
 * many penguins the player has left to place
 * @param scores a Map from each PenguinColor to that Player's score
 */
interface Game {
  readonly players: Array<Player>;
  readonly board: Board;
  readonly penguinPositions: Map<PenguinColor, Array<BoardPosition>>;
  readonly remainingUnplacedPenguins: Map<PenguinColor, number>;
  readonly scores: Map<PenguinColor, number>;
}

/**
 * A MovementGame is a Game within the Movement stage where all players
 * have placed all of their penguins.
 */
type MovementGame = Game & {
  remainingUnplacedPenguins: Map<PenguinColor, 0>;
};

/**
 * Get the current player's score from the given Game state.
 *
 * @param game the Game state to retrieve from
 * @return the current player's score
 */
const getCurrentPlayerScore = (game: Game): number =>
  game.scores.get(getCurrentPlayerColor(game)) || 0;

/**
 * Get the current player's color from the given Game state.
 *
 * @param game the Game state to retrieve from
 * @return the current player's color
 */
const getCurrentPlayerColor = (game: Game): PenguinColor =>
  getCurrentPlayer(game).color;

/**
 * Get the current player from the given Game state.
 *
 * @param game the Game state to retrieve from
 * @return the current player
 */
const getCurrentPlayer = (game: Game): Player => game.players[0];

export {
  Player,
  Game,
  MovementGame,
  getCurrentPlayerScore,
  getCurrentPlayerColor,
  getCurrentPlayer,
};
