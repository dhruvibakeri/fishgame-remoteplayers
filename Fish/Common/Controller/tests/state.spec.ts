import { BoardPosition } from "../../board";
import { getPositionFromKey, getPositionKey } from "../../state";

describe("state.ts", () => {
  const position: BoardPosition = {
    col: 4,
    row: 5,
  };
  const positionKey: string = "4,5";

  describe("getPositionKey", () => {
    it("creates a key from a given BoardPosition", () => {
      expect(getPositionKey(position)).toEqual(positionKey);
    });
  });

  describe("getPositionFromKey", () => {
    it("creates a BoardPosition from a valid key", () => {
      expect(getPositionFromKey(positionKey)).toEqual(position);
    });

    // TODO test invalid key given
  });
});
