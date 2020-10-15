import { mount } from "@vue/test-utils";
import Board from "../../src/components/Board.vue";
import { createHoledOneFishBoard } from "../../../../Controller/src/boardCreation";

describe("Board.vue", () => {
  test("Renders 8 hexagon tiles when board is 3x3 with 1 hole", () => {
    const board = createHoledOneFishBoard(3, 3, [{ col: 0, row: 0 }], 2);
    const wrapper = mount(Board, {
      propsData: { board },
    });
    expect(wrapper.findAll(".tile").length).toBe(8);
    expect(wrapper.findAll(".hexagon").length).toBe(8);
  });
});

describe("Board.vue", () => {
  test("Renders 8 fish when board is 3x3 with 1 hole and 1 fish on each tile", () => {
    const board = createHoledOneFishBoard(3, 3, [{ col: 0, row: 0 }], 2);
    const wrapper = mount(Board, {
      propsData: { board },
    });
    expect(wrapper.findAll(".fish").length).toBe(8);
    expect(wrapper.findAll(".fish-group").length).toBe(8);
  });
});
