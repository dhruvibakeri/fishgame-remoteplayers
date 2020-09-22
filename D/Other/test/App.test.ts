import { fetchSizeFromArgs, isValidSize } from "../src/utils";

describe("fetchSizeFromArgs", () => {
  const makeInput = (size: string): string[] => ["foo", "bar", size];

  it("fetches a positive number from args", () => {
    expect(fetchSizeFromArgs(makeInput("5"))).toBe(5);
  });

  it("throws an error on invalid input", () => {
    expect(() => fetchSizeFromArgs(makeInput("foo"))).toThrow();
  });
});

describe("isValidSize", () => {
  it("returns false when the input is NaN", () => {
    expect(isValidSize(NaN)).toBe(false);
  });

  it("returns false when the input is less than 0", () => {
    expect(isValidSize(-1)).toBe(false);
  });

  it("returns false when the input is 0", () => {
    expect(isValidSize(0)).toBe(false);
  });

  it("returns true when the input is a positive integer", () => {
    expect(isValidSize(100)).toBe(true);
  });

  it("returns true when the input is a positive decimal", () => {
    expect(isValidSize(200.5)).toBe(true);
  });
});
