// schedule.test.js
const { generateFinalAdjList } = require("../functionExports");

const originalAdjList = {
  1: [2],
  2: [4],
  3: [4],
  4: [5],
  5: [],
  6: [7, 8, 10],
  7: [],
  8: [9],
  9: [],
  10: [],
};
test("Generate adjacency list based on schedule set with all classes in original", () => {
  const newSchedule = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const finalAdjList = generateFinalAdjList(newSchedule, originalAdjList);

  expect(finalAdjList).toEqual({
    1: [2],
    2: [4],
    3: [4],
    4: [5],
    5: [],
    6: [7, 8, 10],
    7: [],
    8: [9],
    9: [],
    10: [],
  });
});

test("Generate adjacency list based on schedule set with no classes in original", () => {
  const newSchedule = new Set();
  const finalAdjList = generateFinalAdjList(newSchedule, originalAdjList);
  expect(finalAdjList).toEqual({});
});

test("Generate adjacency list based on schedule set with no classes in original", () => {
  const newSchedule = new Set([1, 4, 6, 7, 8, 9, 10]);
  const finalAdjList = generateFinalAdjList(newSchedule, originalAdjList);

  expect(finalAdjList).toEqual({
    1: [],
    4: [],
    6: [7, 8, 10],
    7: [],
    8: [9],
    9: [],
    10: [],
  });
});
