import { Board, BoardPosition, Penguin, PenguinColor } from "./board";

/**
 * A Player is a structure representing a single Player within a Game. It
 * contains information to identify and set an ordering for players within a
 * game.
 *
 * @param name the Player's name used to identify a player
 * @param age the Player's age used to set the ordering of turns
 */
export interface Player {
  readonly name: string;
  readonly age: number;
}

/**
 * A Game is a structure representing the current game state of a fish game.
 *
 * @param players the array of Players participating in this game, in the
 * ordering which they will take turns
 * @param board the current Board of the game
 * @param curPlayer the player who's turn it currently is
 * @param remainingUnplacedPenguins a Map from Player to Number, the number represents how
 * many penguins the player has left to place
 * @param penguinPositions a Map from BoardPosition to Penguin tracking all
 * penguins that have been placed on the board (value) and their positions (key).
 * @param playerToColorMapping a Map from player to PenguinColor to represent the
 * player's penguin color
 */
export interface Game {
  readonly players: Array<Player>;
  readonly board: Board;
  readonly curPlayer: Player;
  readonly remainingUnplacedPenguins: Map<Player, number>;
  readonly penguinPositions: Map<BoardPosition, Penguin>;
  readonly playerToColorMapping: Map<Player, PenguinColor>;
}
