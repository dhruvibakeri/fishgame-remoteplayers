import { shallowMount } from "@vue/test-utils";
import Penguin from "../../src/components/Penguin.vue";

describe('Penguin.vue', () => {
  test('renders a penguin svg image', () => {
    const wrapper = shallowMount(Penguin, {
      propsData: {
        color: "brown",
        position: {row: 0, col: 0},
        tileSize: 80,
      }
    });
    expect(wrapper.find(".penguin-path").exists()).toBe(true);
  });
});