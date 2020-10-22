import { mount } from "@vue/test-utils";
import { PenguinColor } from "../../../../board";
import { Player as PlayerModel } from "../../../../state";
import Player from "../../src/components/Player.vue";

describe("Player.vue", () => {
  const player: PlayerModel = { name: "foo", color: PenguinColor.Black };
  const unplacedPenguins = 2;
  const color = PenguinColor.Black;
  const propsData = {
    player,
    unplacedPenguins,
    isCurPlayer: false,
  };

  describe("renders a player that is not the current player", () => {
    const wrapper = mount(Player, {
      propsData,
    });

    const playerComponent = wrapper.findAll(".player").at(0);
    const playerName = wrapper.findAll(".player-name").at(0);
    const playerUnplacedPenguins = wrapper.findAll(".unplaced-penguins").at(0);

    test("the player is not the current player", () => {
      expect(playerComponent.props().isCurPlayer).toBe(false);
    });

    test("the player has the correct name", () => {
      expect(playerName.text()).toBe(player.name);
    });

    test("the player has the correct color", () => {
      expect(playerComponent.props().player.color).toBe(color);
    });

    test("the player has the correct unplacedPenguins", () => {
      expect(playerUnplacedPenguins.text()).toBe(
        `${unplacedPenguins} penguins left to place`
      );
    });
  });

  describe("renders a player that is the current player", () => {
    const wrapper = mount(Player, {
      propsData: {
        ...propsData,
        isCurPlayer: false,
      },
    });

    test("the player is given the current player stylings", () => {
      expect(
        wrapper
          .findAll(".player")
          .at(0)
          .props().isCurPlayer
      ).toBe(false);
    });
  });
});
