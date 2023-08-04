// schedule.test.js
const { determineDisjointComponents } = require("../functionExports");

test("Disjoint components from simple graph", () => {
  const adjList = { 0: [1], 1: [2], 2: [3, 4], 3: [], 4: [], 5: [6], 6: [] };
  const disjointComponents = [];

  determineDisjointComponents(disjointComponents, adjList);
  expect(disjointComponents).toEqual([
    [0, 1, 2, 3, 4],
    [5, 6],
  ]);
});

test("Disjoint component test with a single component", () => {
  const adjList = { 0: [1], 1: [2], 2: [3, 4], 3: [], 4: [5], 5: [6], 6: [] };
  const disjointComponents = [];

  determineDisjointComponents(disjointComponents, adjList);
  expect(disjointComponents).toEqual([[0, 1, 2, 3, 4, 5, 6]]);
});

test("Disjoint components from empty adjacency list", () => {
  const adjList = {};
  const disjointComponents = [];

  determineDisjointComponents(disjointComponents, adjList);
  expect(disjointComponents).toEqual([]);
});
