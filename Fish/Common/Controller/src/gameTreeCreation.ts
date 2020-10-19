import { Game, getPositionFromKey } from "../../state";
import { GameTree, Movement, LazyGameTree } from "../../game-tree";
import { PenguinColor, Penguin, BoardPosition } from "../../board";
import { getReachablePositions } from "./movementChecking";
import { movePenguin } from "./penguinPlacement";

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
): Map<Movement, LazyGameTree> => {
  const currentPlayerPenguinPositions: Array<[
    BoardPosition,
    Penguin
  ]> = getCurrentPlayerPenguinPositions(game);

  // Get the reachable positions for each of their penguin positions
  const penguinPosToReachablePositions: Array<[
    BoardPosition,
    Array<BoardPosition>
  ]> = currentPlayerPenguinPositions.map(([position]) => [
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
): Map<Movement, LazyGameTree> => {
  // Turn each reachable position into a movement
  const allMovements: Array<[Movement, LazyGameTree]> = reachablePositions
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
    .reduce((acc: Array<Movement>, movements: Array<Movement>) => [
      ...acc,
      ...movements,
    ])
    .map((movement: Movement) => [
      movement,
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

const getCurrentPlayerPenguinPositions = (
  game: Game
): Array<[BoardPosition, Penguin]> => {
  const currentPlayerColor: PenguinColor = game.playerToColorMapping.get(
    game.curPlayer.name
  );
  const penguinPositionArray: Array<[string, Penguin]> = Array.from(
    game.penguinPositions
  );
  const currentPlayerPenguins: Array<[
    string,
    Penguin
  ]> = penguinPositionArray.filter(
    ([, penguin]) => penguin.color === currentPlayerColor
  );
  const currentPlayerPenguinsAndPositions: Array<[
    BoardPosition,
    Penguin
  ]> = currentPlayerPenguins.map(([positionKey, penguin]) => [
    getPositionFromKey(positionKey),
    penguin,
  ]);
  return currentPlayerPenguinsAndPositions;
};
