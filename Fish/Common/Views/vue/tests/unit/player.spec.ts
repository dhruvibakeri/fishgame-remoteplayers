import { mount } from "@vue/test-utils";
import { PenguinColor } from "../../../../Controller/types/board";
import Player from "../../src/components/Player.vue";

describe("Player.vue", () => {
  const player = { name: "foo", age: 42 };
  const unplacedPenguins = 2;
  const color = PenguinColor.Black;
  const propsData = {
    player,
    unplacedPenguins,
    color,
    isCurPlayer: false,
  };

  test("Renders a player that is not the current player", () => {
    const wrapper = mount(Player, {
      propsData,
    });

    const playerComponent = wrapper.findAll(".player").at(0);
    const playerName = wrapper.findAll(".player-name").at(0);
    const playerUnplacedPenguins = wrapper.findAll(".unplaced-penguins").at(0);

    // The player is not the current player.
    expect(playerComponent.props().isCurPlayer).toBe(false);

    // The player has the correct name.
    expect(playerName.text()).toBe(player.name);

    // The player has the correct color.
    expect(playerComponent.props().color).toBe(color);

    // The player has the correct unplacedPenguins.
    expect(playerUnplacedPenguins.text()).toBe(`${unplacedPenguins} remaining`);
  });

  test("Renders a player that is the current player", () => {
    const wrapper = mount(Player, {
      propsData: {
        ...propsData,
        isCurPlayer: false,
      },
    });

    // The player is given the current player stylings.
    expect(
      wrapper
        .findAll(".player")
        .at(0)
        .props().isCurPlayer
    ).toBe(false);
  });
});
