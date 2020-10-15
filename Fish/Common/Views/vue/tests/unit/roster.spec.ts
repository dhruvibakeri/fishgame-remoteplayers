import { mount } from "@vue/test-utils";
import { Game as GameState, Player } from "../../../../Controller/types/state";
import Roster from "../../src/components/Roster.vue";
import { createGameState } from "../../../../Controller/src/gameStateCreation";
import { createHoledOneFishBoard } from "../../../../Controller/src/boardCreation";
import {
  PenguinColor,
  BoardPosition,
  Board,
  Penguin,
} from "../../../../Controller/types/board";

describe("Router.vue", () => {
  const player1: Player = { name: "foo", age: 30 };
  const player2: Player = { name: "bar", age: 20 };
  const player3: Player = { name: "baz", age: 40 };
  const players: Array<Player> = [player1, player2, player3];
  const playerToColorMapping: Map<Player, PenguinColor> = new Map([
    [player1, PenguinColor.Black],
    [player2, PenguinColor.Brown],
    [player3, PenguinColor.Red],
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
    test("the players are ordered by age and the first is the current player", () => {
      expect(playerComponents.at(0).props().player.age).toBe(player2.age);
      expect(playerComponents.at(0).props().isCurPlayer).toBe(true);
      expect(playerComponents.at(1).props().player.age).toBe(player1.age);
      expect(playerComponents.at(1).props().isCurPlayer).toBe(false);
      expect(playerComponents.at(2).props().player.age).toBe(player3.age);
      expect(playerComponents.at(2).props().isCurPlayer).toBe(false);
    });
  });
});
