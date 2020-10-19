import { BoardPosition } from "../../board";
import { getPositionFromKey, getPositionKey } from "../../state";
import { InvalidKeyError } from "../types/errors";

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

    it("rejects an invalid key", () => {
      expect(getPositionFromKey("1,")).toEqual(
        new InvalidKeyError("1,", "BoardPosition")
      );
      expect(getPositionFromKey("1,2.3")).toEqual(
        new InvalidKeyError("1,2.3", "BoardPosition")
      );
      expect(getPositionFromKey("1,2,3")).toEqual(
        new InvalidKeyError("1,2,3", "BoardPosition")
      );
      expect(getPositionFromKey("")).toEqual(
        new InvalidKeyError("", "BoardPosition")
      );
      expect(getPositionFromKey("hello1,2")).toEqual(
        new InvalidKeyError("hello1,2", "BoardPosition")
      );
      expect(getPositionFromKey("1,2hello")).toEqual(
        new InvalidKeyError("1,2hello", "BoardPosition")
      );
    });
  });
});
