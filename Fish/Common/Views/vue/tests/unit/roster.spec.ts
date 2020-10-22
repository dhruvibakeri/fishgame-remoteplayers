import { mount } from "@vue/test-utils";
import { Game as GameState, getPositionKey, Player } from "../../../../state";
import Roster from "../../src/components/Roster.vue";
import { createGameState } from "../../../../Controller/src/gameStateCreation";
import { createHoledOneFishBoard } from "../../../../Controller/src/boardCreation";
import { PenguinColor, BoardPosition, Board, Penguin } from "../../../../board";

describe("Router.vue", () => {
  const player1: Player = { name: "foo", color: PenguinColor.Black };
  const player2: Player = { name: "bar", color: PenguinColor.Brown };
  const player3: Player = { name: "baz", color: PenguinColor.Red };
  const players: Array<Player> = [player1, player2, player3];
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

  const wrapper = mount(Roster, {
    propsData: { game },
  });

  describe("renders a roster with players in order", () => {
    const playerComponents = wrapper.findAll(".player");

    test("the roster element is present", () => {
      expect(wrapper.findAll(".roster").length).toBe(1);
    });

    test("the players element is present", () => {
      expect(wrapper.findAll(".players").length).toBe(1);
    });

    test("there are the correct number of rendered players", () => {
      expect(playerComponents.length).toBe(3);
    });

    // Renders the roster in order with the first being the current player.
    test("the first player is the current player", () => {
      expect(playerComponents.at(0).props().player.color).toBe(player2.color);
      expect(playerComponents.at(0).props().isCurPlayer).toBe(true);
      expect(playerComponents.at(1).props().player.color).toBe(player1.color);
      expect(playerComponents.at(1).props().isCurPlayer).toBe(false);
      expect(playerComponents.at(2).props().player.color).toBe(player3.color);
      expect(playerComponents.at(2).props().isCurPlayer).toBe(false);
    });
  });
});
