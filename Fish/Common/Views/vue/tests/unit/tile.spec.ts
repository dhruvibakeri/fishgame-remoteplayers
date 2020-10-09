import { shallowMount, mount } from "@vue/test-utils";
import Tile from "../../src/components/Tile.vue";

describe('Tile.vue', () => {
  test('renders hexagon tile when tile is not a hole', () => {
    const wrapper = shallowMount(Tile, {
      propsData: {
        size: 10,
        isHole: false,
        numFish: 1
      }
    });
    expect(wrapper.find(".hexagon").exists()).toBe(true);
  });
});

describe('Tile.vue', () => {
  test('does not anything when tile is a hole', () => {
    const wrapper = shallowMount(Tile, {
      propsData: {
        size: 10,
        isHole: true,
        numFish: 1
      }
    });
    expect(wrapper.find(".hexagon").exists()).toBe(false);
    expect(wrapper.html()).toEqual("");
  });
});

describe('Tile.vue', () => {
  test('Renders a group of 5 fish when numFish is 5', () => {
    const wrapper = mount(Tile, {
      propsData: {
        size: 10,
        isHole: false,
        numFish: 5
      }
    });
    expect(wrapper.findAll(".fish").length).toEqual(5);
  });
});