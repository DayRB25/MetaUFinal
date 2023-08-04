// schedule.test.js
const { reverseAdjList } = require("../functionExports");

test("Reverse adj list in a simple linear graph", () => {
  const adjList = { 0: [], 1: [0], 2: [1], 3: [2], 4: [3], 5: [4] };

  const reversedAdjList = reverseAdjList(adjList);
  expect(reversedAdjList).toEqual({
    0: ["1"],
    1: ["2"],
    2: ["3"],
    3: ["4"],
    4: ["5"],
    5: [],
  });
});

test("Reverse adj list in a graph with disjoint components", () => {
  const adjList = { 0: [], 1: [0], 2: [1], 3: [2], 4: [2], 5: [], 6: [5] };

  const reversedAdjList = reverseAdjList(adjList);
  expect(reversedAdjList).toEqual({
    0: ["1"],
    1: ["2"],
    2: ["3", "4"],
    3: [],
    4: [],
    5: ["6"],
    6: [],
  });
});

test("Reverse adj list in a  a complex graph", () => {
  const adjList = {
    0: [],
    1: [0],
    2: [0],
    3: [2],
    4: [2],
    5: [4],
    6: [5],
    7: [6, 8],
    8: [3],
  };

  const reversedAdjList = reverseAdjList(adjList);
  expect(reversedAdjList).toEqual({
    0: ["1", "2"],
    1: [],
    2: ["3", "4"],
    3: ["8"],
    4: ["5"],
    5: ["6"],
    6: ["7"],
    7: [],
    8: ["7"],
  });
});
