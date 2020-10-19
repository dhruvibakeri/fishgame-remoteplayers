import { Game, getPositionFromKey, Player } from "../../state";
import {
  GameTree,
  Movement,
  LazyGameTree,
  getMovementKey,
} from "../../game-tree";
import { PenguinColor, Penguin, BoardPosition } from "../../board";
import { getReachablePositions } from "./movementChecking";
import { movePenguin } from "./penguinPlacement";
import { IllegalMovementError } from "../types/errors";

/**
 *
 */
const createGameTree = (game: Game): GameTree => {
  return {
    gameState: game,
    potentialMoves: generatePotentialMoveMapping(game),
  };
};

const generatePotentialMoveMapping = (
  game: Game
): Map<string, LazyGameTree> => {
  const currentPlayerPenguinPositions: Array<BoardPosition> = getCurrentPlayerPenguinPositions(
    game
  );

  // Get the reachable positions for each of their penguin positions
  const penguinPosToReachablePositions: Array<[
    BoardPosition,
    Array<BoardPosition>
  ]> = currentPlayerPenguinPositions.map((position: BoardPosition) => [
    position,
    getReachablePositions(game, position),
  ]);

  // Create the mapping for the movement to each of those positions
  return getPotentialMovesFromReachablePositions(
    game,
    penguinPosToReachablePositions
  );
};

const getPotentialMovesFromReachablePositions = (
  game: Game,
  reachablePositions: Array<[BoardPosition, Array<BoardPosition>]>
): Map<string, LazyGameTree> => {
  // Turn each reachable position into a movement
  const allMovements: Array<[string, LazyGameTree]> = reachablePositions
    .map(
      (
        startPositionToReachablePositions: [BoardPosition, Array<BoardPosition>]
      ) => {
        const startPosition: BoardPosition =
          startPositionToReachablePositions[0];
        const reachableFromStart: Array<BoardPosition> =
          startPositionToReachablePositions[1];
        const movements = reachableFromStart.map(
          (endPosition: BoardPosition) => {
            return { startPosition, endPosition };
          }
        );

        return movements;
      }
    )
    .reduce(
      (acc: Array<Movement>, movements: Array<Movement>) => [
        ...acc,
        ...movements,
      ],
      []
    )
    .map((movement: Movement) => [
      getMovementKey(movement),
      createLazyGameTree(game, movement),
    ]);

  return new Map(allMovements);
};

const createLazyGameTree = (game: Game, movement: Movement): LazyGameTree => {
  // This resulting game state is guaranteed to receive valid inputs as it is
  // only used for GameTree creation, which uses penguins and reachable positions
  // that have already been validated.
  const newGameState = movePenguin(
    game,
    game.curPlayer,
    movement.startPosition,
    movement.endPosition
  ) as Game;
  return () => createGameTree(newGameState);
};

const getPlayerPenguinPositions = (
  game: Game,
  player: Player
): Array<BoardPosition> => {
  const playerColor = game.playerToColorMapping.get(player.name);
  const isPlayersPenguin = ([positionKey, penguin]: [
    string,
    Penguin
  ]): boolean => penguin.color === playerColor;

  // We can type cast here as BoardPosition because by definition penguinPosition keys are
  // valid BoardPositions
  const getPosition = ([positionKey, penguin]: [
    string,
    Penguin
  ]): BoardPosition => getPositionFromKey(positionKey) as BoardPosition;

  return Array.from(game.penguinPositions)
    .filter(isPlayersPenguin)
    .map(getPosition);
};

const getCurrentPlayerPenguinPositions = (game: Game): Array<BoardPosition> =>
  getPlayerPenguinPositions(game, game.curPlayer);

export {
  createGameTree,
  generatePotentialMoveMapping,
  getPotentialMovesFromReachablePositions,
  createLazyGameTree,
  getPlayerPenguinPositions,
  getCurrentPlayerPenguinPositions,
};
