import { mount } from "@vue/test-utils";
import { Game as GameState, Player } from "../../../../state";
import Game from "../../src/components/Game.vue";
import { createGameState } from "../../../../Controller/src/gameStateCreation";
import { createHoledOneFishBoard } from "../../../../Controller/src/boardCreation";
import { PenguinColor, BoardPosition, Board, Penguin } from "../../../../board";

describe("Game.vue", () => {
  const player1: Player = { name: "foo", age: 20 };
  const player2: Player = { name: "bar", age: 30 };
  const players: Array<Player> = [player1, player2];
  const playerToColorMapping: Map<Player, PenguinColor> = new Map([
    [player1, PenguinColor.Black],
    [player2, PenguinColor.Brown],
  ]);
  const holePosition: BoardPosition = { col: 1, row: 0 };
  const holePositions: Array<BoardPosition> = [holePosition];
  const board: Board = createHoledOneFishBoard(2, 2, holePositions, 1) as Board;
  const player1Penguin: Penguin = { color: PenguinColor.Black };
  const player2Penguin: Penguin = { color: PenguinColor.Brown };
  const penguinPositions: Map<BoardPosition, Penguin> = new Map([
    [{ col: 0, row: 0 }, player1Penguin],
    [{ col: 1, row: 1 }, player2Penguin],
  ]);
  const game: GameState = {
    ...(createGameState(players, playerToColorMapping, board) as GameState),
    penguinPositions,
  };

  const wrapper = mount(Game, {
    propsData: { game },
  });

  describe("renders a board, penguins, and a roster", () => {
    test("the board element is present", () => {
      expect(wrapper.findAll(".board").length).toBe(1);
    });

    test("there is a penguin element for each placed penguin", () => {
      expect(wrapper.findAll(".penguin").length).toBe(
        Array.from(penguinPositions).length
      );
    });

    test("the roster element is present", () => {
      expect(wrapper.findAll(".roster").length).toBe(1);
    });
  });
});
