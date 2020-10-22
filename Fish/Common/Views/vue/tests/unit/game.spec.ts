import { mount } from "@vue/test-utils";
import { Game as GameState, Player } from "../../../../state";
import Game from "../../src/components/Game.vue";
import { createGameState } from "../../../../Controller/src/gameStateCreation";
import { createHoledOneFishBoard } from "../../../../Controller/src/boardCreation";
import { PenguinColor, BoardPosition, Board, Penguin } from "../../../../board";

describe("Game.vue", () => {
  const player1: Player = { name: "foo", color: PenguinColor.Black };
  const player2: Player = { name: "bar", color: PenguinColor.Brown };
  const players: Array<Player> = [player1, player2];
  const holePosition: BoardPosition = { col: 1, row: 0 };
  const holePositions: Array<BoardPosition> = [holePosition];
  const board: Board = createHoledOneFishBoard(2, 2, holePositions, 1) as Board;
  const penguinPositions: Map<PenguinColor, Array<BoardPosition>> = new Map([
    [player1.color, [{ col: 0, row: 0 }]],
    [player2.color, [{ col: 1, row: 1 }]],
  ]);
  const game: GameState = {
    ...(createGameState(players, board) as GameState),
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
