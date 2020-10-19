import { Movement, getMovementFromKey, getMovementKey } from "../../game-tree";
import { InvalidKeyError } from "../types/errors";

describe("state.ts", () => {
  const movement: Movement = {
    startPosition: {
      col: 4,
      row: 5,
    },
    endPosition: {
      col: 4,
      row: 4,
    },
  };
  const movementKey: string = "4,5,4,4";

  describe("getMovementFromKey", () => {
    it("creates a key from a given Movement", () => {
      expect(getMovementFromKey(movementKey)).toEqual(movement);
    });

    it("rejects an invalid key", () => {
      expect(getMovementFromKey("hello")).toEqual(
        new InvalidKeyError("hello", "Movement")
      );
      expect(getMovementFromKey("1,2,3")).toEqual(
        new InvalidKeyError("1,2,3", "Movement")
      );
      expect(getMovementFromKey("1,2.5,3,4")).toEqual(
        new InvalidKeyError("1,2.5,3,4", "Movement")
      );
      expect(getMovementFromKey("1,2,3,4hello")).toEqual(
        new InvalidKeyError("1,2,3,4hello", "Movement")
      );
      expect(getMovementFromKey("hello1,2,3,4")).toEqual(
        new InvalidKeyError("hello1,2,3,4", "Movement")
      );
      expect(getMovementFromKey("1,2,3,4,5")).toEqual(
        new InvalidKeyError("1,2,3,4,5", "Movement")
      );
    });
  });

  describe("getMovementKey", () => {
    it("creates a Movement from a key", () => {
      expect(getMovementKey(movement)).toEqual(movementKey);
    });
  });
});
