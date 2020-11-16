import { PenguinColor, BoardPosition, Board, Tile } from "../../board";
import { Movement } from "../../game-tree";
import { Player, Game, getCurrentPlayer, MovementGame } from "../../state";
import { createNumberedBoard } from "./boardCreation";
import { createGameState, PENGUIN_AMOUNT_N } from "./gameStateCreation";
import { gameIsMovementGame } from "./gameTreeCreation";
import { movePenguin } from "./penguinPlacement";
import {
  InputPlayer,
  InputPosition,
  InputState,
  InputBoard,
  Action,
  MoveResponseQuery,
  GameDescriptionPlayer,
} from "./testHarnessInput";
import { Result } from "true-myth";
import { TournamentPlayer } from "../../player-interface";
import { createSamplePlayer } from "../../../Player/player";
const { ok, err } = Result;

/**
 * Utility function for outputting false to signify errors that occurred in the
 * test harness, whether these be due to being given invalid states/movements
 * or if the condition wasn't satisfied that the player after the MoveResponseQuery
 * cannot move any penguins to neighbor the previous' destination.
 */
const printFalse = (): void => console.log(JSON.stringify(false));

/**
 * Given an InputPlayer, derive a unique name for this player.
 *
 * This is used to bridge the gap between the InputPlayer
 * representation which has no explicit name, and the Player
 * representation which does.
 *
 * The current behavior for this is to simply use the InputPlayer's
 * color as their name.
 *
 * @param inputPlayer
 */
const getInputPlayerName = (inputPlayer: InputPlayer): string => {
  return inputPlayer.color;
};

/**
 * Transform the given InputPlayer into a Player.
 *
 * To reconcile differences in the structure of an InputPlayer and a Player,
 * the inputPlayer's color is used as the Player's name.
 *
 * @param inputPlayer the InputPlayer to transform
 * @return the transformed Player
 */
const inputPlayerToPlayer = (inputPlayer: InputPlayer): Player => {
  return {
    name: getInputPlayerName(inputPlayer),
    color: inputPlayer.color,
  };
};

/**
 * Transform the given InputPosition into a BoardPosition.
 *
 * @param inputPosition the InputPosition to transform
 * @return the transformed BoardPosition
 */
const inputPositionToBoardPosition = (
  inputPosition: InputPosition
): BoardPosition => {
  return { row: inputPosition[0], col: inputPosition[1] };
};

/**
 * Given two InputPositions representing the starting and ending positions of
 * a Movement, create a Movement from them.
 *
 * @param fromPosition the starting InputPosition of the movement
 * @param toPosition the ending InputPosition of the movement
 * @return the converted Movement
 */
const inputPositionsToMovement = (
  fromPosition: InputPosition,
  toPosition: InputPosition
): Movement => {
  return {
    startPosition: inputPositionToBoardPosition(fromPosition),
    endPosition: inputPositionToBoardPosition(toPosition),
  };
};

/**
 * Transform the given array of InputPlayers into a penguin positions mapping
 * from each position that holds a penguin to the penguin on that position.
 *
 * @param players the array of InputPlayers to transform
 * @return the transformed penguin positions mapping
 */
const inputPlayersToPenguinPositions = (
  players: Array<InputPlayer>
): Map<PenguinColor, Array<BoardPosition>> =>
  new Map(
    players.map((inputPlayer: InputPlayer) => [
      inputPlayer.color,
      inputPlayer.places.map(inputPositionToBoardPosition),
    ])
  );

/**
 * Transform the given array of InputPlayers into a scoresheet mapping from
 * each player's color to their specified score.
 *
 * @param players the array of InputPlayers to transform
 * @return the transformed scoresheet mapping
 */
const inputPlayersToScores = (
  players: Array<InputPlayer>
): Map<PenguinColor, number> =>
  new Map(
    players.map((inputPlayer: InputPlayer) => [
      inputPlayer.color,
      inputPlayer.score,
    ])
  );

/**
 * Assuming all the given InputPlayers have valid amounts of placed penguins,
 * create their respective mapping from each player's PenguinColor to their
 * number of unplaced penguins.
 *
 * @param players the array of InputPlayers to transform
 * @return the transformed remaining unplaced penguins mapping
 */
const inputPlayersToRemainingUnplacedPenguins = (
  players: Array<InputPlayer>
): Result<Map<PenguinColor, number>, Error> => {
  const penguinsToPlace = PENGUIN_AMOUNT_N - players.length;
  const somePlayerHasTooManyPlacements = players.some(
    (player: InputPlayer) => player.places.length > penguinsToPlace
  );

  if (somePlayerHasTooManyPlacements) {
    return err(
      new Error("A player has more than the allowed nhumber of placements.")
    );
  }

  return ok(
    new Map(
      players.map((player: InputPlayer) => [
        player.color,
        penguinsToPlace - player.places.length,
      ])
    )
  );
};

/**
 * Attempt to transform the given InputState into a Game state, returning
 * the Game state if successful and an Error if one occurred while doing
 * so.
 *
 * @param inputState the InputState to transform
 * @return the successfully transformed Game state or an error
 */
const inputStateToGameState = (inputState: InputState): Result<Game, Error> => {
  // Derive information from the InputState necessary to create a Game.
  const board: Result<Board, Error> = createNumberedBoard(inputState.board);
  const players = inputState.players.map(inputPlayerToPlayer);
  const penguinPositions = inputPlayersToPenguinPositions(inputState.players);
  const scores = inputPlayersToScores(inputState.players);
  const remainingUnplacedPenguins: Result<
    Map<PenguinColor, number>,
    Error
  > = inputPlayersToRemainingUnplacedPenguins(inputState.players);

  return board.andThen((board: Board) =>
    remainingUnplacedPenguins.andThen(
      (remainingUnplacedPenguins: Map<PenguinColor, number>) =>
        createGameState(players, board).andThen((game: Game) => {
          return ok({
            ...game,
            penguinPositions,
            scores,
            remainingUnplacedPenguins,
          });
        })
    )
  );
};

/**
 * Attempt to transform the given InputState into a MovementGame state,
 * returning the MovementGame state if successful and an Error if one
 * occurred while doing so.
 *
 * @param inputState the InputState to transform
 * @return the successfully transformed MovementGame state or an error
 */
const inputStateToMovementGame = (
  inputState: InputState
): Result<MovementGame, Error> =>
  inputStateToGameState(inputState).andThen((game: Game) =>
    gameIsMovementGame(game)
      ? ok(game)
      : err(new Error("Game state is not a MovementGame"))
  );

/**
 * Transform the given BoardPosition into an InputPosition.
 *
 * @param boardPosition the BoardPosition to transform
 * @return the transformed InputPosition
 */
const boardPositionToInputPosition = (
  boardPosition: BoardPosition
): InputPosition => [boardPosition.row, boardPosition.col];

/**
 * For a given Player within a given Game, derive the positions of all that
 * player's Penguins in the form of an array of InputPositions.
 *
 * @param game the Game to derive from
 * @param player the player to get the places for
 * @param index the index of this player in the ordering of players, used
 * to fix reorderings
 * @return the array of InputPositions representing the given player's Penguins
 */
const getPlayerPlaces = (
  game: Game,
  player: Player,
  index: number
): Array<InputPosition> => {
  const playerPenguinPositions = game.penguinPositions.get(player.color);
  if (index === 0 && playerPenguinPositions.length > 1) {
    // If the player is the first player in the ordering and their number of
    // placed penguins is greater than 1, this means that the ordering of
    // their penguins positions within its corresponding Game state penguin
    // position array has been changed. More specifically, Game movements
    // remove the original penguin position and appends them to the end of
    // the position array. This compensates for that to prevent issues with
    // recognizing JSON equality (order matters) by placing the last
    // penguin position back at the start, since it's also guaranteed by the
    // test harness that the first penguin will always been the one that moves.
    const reOrderedPenguinPositions = [
      playerPenguinPositions[playerPenguinPositions.length - 1],
      ...playerPenguinPositions.slice(0, playerPenguinPositions.length - 1),
    ];
    return reOrderedPenguinPositions.map(boardPositionToInputPosition);
  }
  return playerPenguinPositions.map(boardPositionToInputPosition);
};

/**
 * Transform the given Game state into an array of its InputPlayers.
 *
 * @param game the Game to transform
 * @return the Array of InputPlayers derived from the given Game
 */
const gameStateToInputPlayers = (game: Game): Array<InputPlayer> =>
  game.players.map((player: Player, index: number) => {
    return {
      color: player.color,
      score: game.scores.get(player.color),
      places: getPlayerPlaces(game, player, index),
    };
  });

/**
 * Transform the given Board to an InputBoard.
 *
 * @param board the Board to transform
 * @return the transformed InputBoard
 */
const boardToInputBoard = (board: Board): InputBoard =>
  board.tiles.map((row: Array<Tile>) =>
    row.map((tile: Tile) => tile.numOfFish)
  );

/**
 * Transform the given Game state into an InputState.
 *
 * @param game the Game state to transform
 * @return the transformed InputState
 */
const gameToInputState = (game: Game): InputState => {
  return {
    players: gameStateToInputPlayers(game),
    board: boardToInputBoard(game.board),
  };
};

/**
 * Given a MoveResponseQuery, return the Game state that results from applying
 * the specified movement to the game state.
 *
 * Since the xtree harness assumes that the given MoveResponseQuery is valid
 * and a portion of this validity means that the move outlined in the query
 * is valid for the given state, these same assumptions may also be held here when
 * applying the movement to the Game state. This assumption also ensures that
 * the given InputState is also a valid state for movement i.e. all penguins
 * are placed, since no movement would be valid otherwise.
 *
 * @param moveResponseQuery the MoveResponseQuery to process
 * @return the Game state resulting from the query or false if for some reason
 * this fails.
 */
const performMoveResponseQuery = (
  moveResponseQuery: MoveResponseQuery
): Result<MovementGame, Error> => {
  // Convert the state within the query into a Game state, assuming the
  // Game is valid as specified in the xtree harness assumptions.
  // Create a Movement from the from and to positions within the query.
  const movement: Movement = inputPositionsToMovement(
    moveResponseQuery.from,
    moveResponseQuery.to
  );

  return inputStateToMovementGame(
    moveResponseQuery.state
  ).andThen((game: MovementGame) =>
    movePenguin(
      game,
      getCurrentPlayer(game),
      movement.startPosition,
      movement.endPosition
    )
  );
};

/**
 * Convert the given Movement into an Action.
 *
 * @param movement the Movement to convert
 * @return the converted Action
 */
const movementToAction = (movement: Movement): Action => [
  boardPositionToInputPosition(movement.startPosition),
  boardPositionToInputPosition(movement.endPosition),
];

/**
 * Attempt to convert the given GameDescriptionPlayer into a TournamentPlayer.
 * 
 * @param gameDescriptionPlayer the GameDescriptionPlayer to convert
 * @return the converted TournamentPlayer 
 */
const gameDescriptionPlayerToTournamentPlayer = (gameDescriptionPlayer: GameDescriptionPlayer): Result<TournamentPlayer, Error> => {
  const name = gameDescriptionPlayer[0];
  const depth = gameDescriptionPlayer[1];
  if (name.length > 12) {
    return err(new Error("Name must be 12 characters or less"));
  }
  return ok(createSamplePlayer(`${name}_${depth}`, depth));
}

/**
 * Convert the given GameDescriptionPlayer into a TournamentPlayer and add it 
 * to the given accumulator if the conversion was successful and the accumulator
 * is not an error.
 * 
 * @param acc the accumulated TournamentPlayers or an Error
 * @param gameDescriptionPlayer the GameDescriptionPlayer to convert
 * @return the updated accumulator containing the new player if conversion was 
 * successful and the accumulator is not an error
 */
const gameDescriptionPlayersReducer = (
  acc: Result<Array<TournamentPlayer>, Error>,  
  gameDescriptionPlayer: GameDescriptionPlayer
): Result<Array<TournamentPlayer>, Error> => 
  acc.andThen((accPlayers: Array<TournamentPlayer>) =>
    gameDescriptionPlayerToTournamentPlayer(gameDescriptionPlayer).map((tournamentPlayer: TournamentPlayer) => [...accPlayers, tournamentPlayer]))

/**
 * Attempt to convert the given array of GameDescriptionPlayers into an array of 
 * TournamentPlayers, returning the converted array if successful and an Error
 * if not.
 * 
 * @param gameDescriptionPlayers the array of GameDescriptionPlayers to convert
 * @return an array of the converted TournamentPlayers if successful or an 
 * error if not
 */
const gameDescriptionPlayersToTournamentPlayers = (
  gameDescriptionPlayers: Array<GameDescriptionPlayer>
): Result<Array<TournamentPlayer>, Error> => gameDescriptionPlayers.reduce<Result<Array<TournamentPlayer>, Error>>(gameDescriptionPlayersReducer, ok([]))

/**
 * Return an original inputted name given a converted TournamentPlayer's name.
 * 
 * This is necessary for handling inputs with duplicate names since 
 * GameDescriptionPlayers given to the referee are only guaranteed to 
 * be pairwise distinct i.e. duplicate names are allowed so long as 
 * the depths are different. 
 * 
 * @param tpName a converted TournamentPlayer's name
 * @return the original GameDescriptionPlayer name
 */
const tournamentPlayerNameToGameDescriptionName = (tpName: string): string => tpName.split("_")[0]

export {
  printFalse,
  inputStateToGameState,
  gameToInputState,
  performMoveResponseQuery,
  inputPositionToBoardPosition,
  movementToAction,
  gameDescriptionPlayersToTournamentPlayers,
  tournamentPlayerNameToGameDescriptionName,
};
