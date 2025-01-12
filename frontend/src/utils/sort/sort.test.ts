import { sortNumbers, sortDates, sortStrings } from "./sort";

describe("sort numbers", () => {
  const data = [2, 0, 1];
  const ascData = [0, 1, 2];
  const descData = [2, 1, 0];
  const mixedData = [
    1,
    2,
    null as unknown as number,
    undefined as unknown as number,
    "a" as unknown as number,
    NaN,
  ];

  it("should sort numbers in ascending order", () => {
    const sortedData = sortNumbers({ data });

    expect(sortedData).toEqual(ascData);
  });

  it("should sort numbers in descending order", () => {
    const sortedData = sortNumbers({ data, order: "desc" });

    expect(sortedData).toEqual(descData);
  });

  it("should return empty array if data is empty", () => {
    expect(sortNumbers({ data: [] })).toEqual([]);
  });

  it("should throw error for non-array input", () => {
    expect(() => sortNumbers({ data: {} as unknown as [] })).toThrow(TypeError);
  });

  it("should filter out non-numeric values", () => {
    expect(sortNumbers({ data: mixedData })).toEqual([1, 2]);
  });
});

describe("sort Dates", () => {
  const data = [
    new Date("2021-01-01"),
    new Date("2020-01-01"),
    new Date("2020-12-31"),
  ];
  const ascData = [
    new Date("2020-01-01"),
    new Date("2020-12-31"),
    new Date("2021-01-01"),
  ];
  const descData = [
    new Date("2021-01-01"),
    new Date("2020-12-31"),
    new Date("2020-01-01"),
  ];
  const mixedData = [
    new Date("2021-01-01"),
    new Date("2020-12-31"),
    new Date("2020-01-01"),
    null as unknown as Date,
    undefined as unknown as Date,
    "a" as unknown as Date,
    2 as unknown as Date,
  ];

  it("should sort numbers in ascending order", () => {
    const sortedData = sortDates({ data });

    expect(sortedData).toEqual(ascData);
  });

  it("should sort numbers in descending order", () => {
    const sortedData = sortDates({ data, order: "desc" });

    expect(sortedData).toEqual(descData);
  });

  it("should return empty array if data is empty", () => {
    expect(sortDates({ data: [] })).toEqual([]);
  });

  it("should throw error for non-array input", () => {
    expect(() => sortDates({ data: {} as unknown as [] })).toThrow(TypeError);
  });

  it("should filter out non-date values", () => {
    expect(sortDates({ data: mixedData })).toEqual(ascData);
  });
});

describe("sort strings", () => {
  const data = ["b", "a", "c"];
  const ascData = ["a", "b", "c"];
  const descData = ["c", "b", "a"];
  const mixedData = [
    "a",
    "b",
    "c",
    null as unknown as string,
    undefined as unknown as string,
    2 as unknown as string,
  ];

  it("should sort numbers in ascending order", () => {
    expect(sortStrings({ data })).toEqual(ascData);
  });

  it("should sort numbers in descending order", () => {
    expect(sortStrings({ data, order: "desc" })).toEqual(descData);
  });

  it("should return empty array if data is empty", () => {
    expect(sortStrings({ data: [] })).toEqual([]);
  });

  it("should throw error for non-array input", () => {
    expect(() => sortStrings({ data: {} as unknown as [] })).toThrow(TypeError);
  });

  it("should filter out non-string values", () => {
    expect(sortStrings({ data: mixedData })).toEqual(ascData);
  });
});
