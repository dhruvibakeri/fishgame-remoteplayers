import { mount } from "@vue/test-utils";
import FishGroup from "../../src/components/FishGroup.vue";

describe("Tile.vue", () => {
  test("Renders a group of 5 fish when numFish is 5", () => {
    const wrapper = mount(FishGroup, {
      propsData: {
        numFish: 5,
      },
    });
    expect(wrapper.findAll(".fish-group").length).toEqual(1);
    expect(wrapper.findAll(".fish").length).toEqual(5);
  });
});
