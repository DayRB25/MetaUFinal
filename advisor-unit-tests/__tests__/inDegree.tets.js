// schedule.test.js
const { initIndegreeObject } = require("../functionExports");

test("Initialization with a single class", () => {
  const inDegreeObject = {};
  const classData = [{ id: 1, name: "Math" }];

  initIndegreeObject(inDegreeObject, classData);
  expect(inDegreeObject).toEqual({ 1: 0 });
});

test("Initialization with multiple classes", () => {
  const inDegreeObject = {};
  const classData = [
    { id: 1, name: "Math" },
    { id: 2, name: "English" },
    { id: 3, name: "Spanish" },
  ];

  initIndegreeObject(inDegreeObject, classData);
  expect(inDegreeObject).toEqual({ 1: 0, 2: 0, 3: 0 });
});

test("Initialization with empty class array", () => {
  const inDegreeObject = {};
  const classData = [];

  initIndegreeObject(inDegreeObject, classData);
  expect(inDegreeObject).toEqual({});
});
