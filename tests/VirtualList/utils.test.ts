import { getHeightsAndOffsets, search } from "../../src/VirtualList/utils";

describe("getHeightsAndOffsets", () => {
  it("should calculate heights, offsets, and other metrics from an array of elements", () => {
    const elements = [
      { props: { height: "100" } },
      { props: { height: "200" } },
      { props: { height: "150" } },
    ];

    const result = getHeightsAndOffsets(elements);
    expect(result.heights).toEqual([100, 200, 150]);
    expect(result.offsets).toEqual([0, 100, 300]);
    expect(result.totalHeight).toEqual(450);
    expect(result.maxHeight).toEqual(200);
    expect(result.minHeight).toEqual(100);
    expect(result.avgHeight).toEqual(150);
  });

  it("should return empty metrics if the elements array is null or empty", () => {
    let result = getHeightsAndOffsets([]);
    expect(result).toEqual({
      heights: [],
      offsets: [],
      totalHeight: 0,
      maxHeight: 0,
      minHeight: 0,
      avgHeight: 0,
    });

    result = getHeightsAndOffsets([]);
    expect(result).toEqual({
      heights: [],
      offsets: [],
      totalHeight: 0,
      maxHeight: 0,
      minHeight: 0,
      avgHeight: 0,
    });
  });

  it("getHeightsAndOffsets returns default values when elements array is null", () => {
    const elements = null;

    const result = getHeightsAndOffsets(elements);

    expect(result.heights).toEqual([]);
    expect(result.offsets).toEqual([]);
    expect(result.totalHeight).toEqual(0);
    expect(result.maxHeight).toEqual(0);
    expect(result.minHeight).toEqual(0);
    expect(result.avgHeight).toEqual(0);
  });
});

describe("search", () => {
  it("should find the index of a target value in a sorted array", () => {
    const array = [1, 3, 5, 7, 9, 11];

    expect(search(array, 5)).toBe(2);
    expect(search(array, 9)).toBe(4);
  });

  it("should return the index of the closest value if the target is not found", () => {
    const array = [1, 3, 5, 7, 9, 11];

    expect(search(array, 6)).toBe(2);
    expect(search(array, 8)).toBe(3);
  });

  it("search returns 0 for target not found", () => {
    const arr = [1];
    const target = 2;
    const result = search(arr, target);

    expect(result).toBe(0);
  });

  it("search function returns the ending index if the target is greater than the last element.", () => {
    const array = [1, 3, 5, 7, 9];
    const target = 10;
    const result = search(array, target);

    expect(result).toBe(array.length - 1);
  });

  test("should return -1 when the array is empty", () => {
    const array = null;
    const target = 5;
    const result = search(array, target);

    expect(result).toBe(-1);
  });
});
