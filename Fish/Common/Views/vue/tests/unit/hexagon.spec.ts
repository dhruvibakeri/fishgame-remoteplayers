import { shallowMount } from "@vue/test-utils";
import Hexagon from "@/components/Hexagon.vue";

describe("Hexagon.vue", () => {
  it("renders hexagon", () => {
    const wrapper = shallowMount(Hexagon, {
      propsData: {
        size: 20,
        isActive: true,
      },
    });
    expect(wrapper.find("polygon")).toBeDefined();
  });
});
