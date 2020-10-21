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
 * NOTE: This Game state is subject to change in regards to adding further
 * functionality as the assignments demand them. We have opted per milestone
 * to offer ONLY the requested functionalities in order to save our effort
 * and avoid having to do excessive refactors, meaning that this definition
 * is by no means exhaustive to all representations needed for the final
 * product of a Fish game.
 *
 * If something has not be required yet within the assignment prompt or was
 * not required for the implementation of the requirements for the latest milestone,
 * it will not have been added yet. This does not mean we do not intend to add
 * that functionality. See `game-state.md` within the `Planning` folder for
 * our initial design of an entire complete Game state.
 *
 * @param players the array of Players participating in this game, in the
 * ordering which they will take turns
 * @param board the current Board of the game
 * @param curPlayerIndex the index of the Player who's turn it currently is
 * @param penguinPositions a Map from each PenguinColor to the BoardPositions
 * of each of that color's Penguins
 * @param remainingUnplacedPenguins a Map from a player's color to a number, the number represents how
 * many penguins the player has left to place
 * @param scores a Map from each PenguinColor to that Player's score
 */
interface Game {
  readonly players: Array<Player>;
  readonly board: Board;
  readonly curPlayerIndex: number;
  readonly penguinPositions: Map<PenguinColor, Array<BoardPosition>>;
  readonly remainingUnplacedPenguins: Map<PenguinColor, number>;
  readonly scores: Map<PenguinColor, number>;
}
// TODO test
const getCurrentPlayerScore = (game: Game): number =>
  game.scores.get(getCurrentPlayerColor(game));

// TODO test
const getCurrentPlayerColor = (game: Game): PenguinColor =>
  game.players[game.curPlayerIndex].color;

// TODO test
const getCurrentPlayer = (game: Game): Player =>
  game.players[game.curPlayerIndex];

export {
  Player,
  Game,
  getCurrentPlayerScore,
  getCurrentPlayerColor,
  getCurrentPlayer,
};
