import { shallowMount } from "@vue/test-utils";
import Fish from "../../src/components/Fish.vue";

describe("Tile.vue", () => {
  test("Renders a fish", () => {
    const wrapper = shallowMount(Fish);
    expect(wrapper.findAll(".fish").length).toEqual(1);
  });
});
