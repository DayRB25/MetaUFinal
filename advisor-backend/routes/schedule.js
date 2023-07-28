import express from "express";
import { Class } from "../models/index.js";
import { Prerequisite } from "../models/index.js";
import { RequiredClass } from "../models/index.js";
import { TakenClass } from "../models/index.js";

const router = express.Router();

const calculateInDegrees = (
  inDegreeObject,
  disjointComponents,
  classData,
  adjList
) => {
  for (let i = 0; i < classData.length; i++) {
    const schoolClass = classData[i];
    inDegreeObject[schoolClass.id] = 0;
  }

  for (let i = 0; i < disjointComponents.length; i++) {
    const component = disjointComponents[i];
    // recreate adjList for this component
    const componentAdjList = {};
    for (let j = 0; j < component.length; j++) {
      const classId = component[j];
      componentAdjList[classId] = adjList[classId];
    }
    // calculate in degrees
    for (const classId in componentAdjList) {
      for (const postreqId of componentAdjList[classId]) {
        inDegreeObject[postreqId] += 1;
      }
    }
  }
};

const determineDisjointComponents = (disjointComponents, adjList) => {
  let visited = new Set();
  for (const classItem in adjList) {
    const intId = parseInt(classItem);
    if (!visited.has(intId)) {
      const component = [];
      dfs(intId, adjList, visited, component);
      disjointComponents.push(component);
    }
  }
};

const dfs = (node, graph, visited, component) => {
  visited.add(node);
  component.push(node);
  const neighbors = graph[node];
  for (let i = 0; i < neighbors.length; i++) {
    const neighbor = neighbors[i];
    if (!visited.has(neighbor)) {
      dfs(neighbor, graph, visited, component);
    }
  }
};

const dfsPrune = (node, graph, taken) => {
  if (taken.has(node)) {
    const savePostreqs = graph[node];
    graph[node] = [];
    for (let i = 0; i < savePostreqs.length; i++) {
      const postreq = savePostreqs[i];
      dfsPrune(postreq, graph, taken);
    }
  }
};

// Route for student schedule creation
router.post("/create", async (req, res) => {
  const SchoolId = req.body.SchoolId;
  const StudentId = req.body.StudentId;
  const newSchedule = new Set();
  try {
    const schoolClasses = await Class.findAll({ where: { SchoolId } });
    // isolating relevant data from response
    const schoolClassesData = schoolClasses.map(
      (schoolClass) => schoolClass.dataValues
    );

    const adjList = {};
    // generating adjacency list
    for (let i = 0; i < schoolClassesData.length; i++) {
      const schoolClass = schoolClassesData[i];
      adjList[schoolClass.id] = [];

      // fetching courses for which current course is a pre-req
      const dependentClasses = await Prerequisite.findAll({
        where: { PrereqId: schoolClass.id },
      });

      // isolating relevant data from response
      const dependentClassesData = dependentClasses.map(
        (dependentClass) => dependentClass.dataValues
      );

      // add all classes current class is a pre-req for to adj list
      for (let j = 0; j < dependentClassesData.length; j++) {
        const dependentClass = dependentClasses[j];
        adjList[schoolClass.id].push(dependentClass.PostreqId);
      }
    }
    const originalAdjList = JSON.parse(JSON.stringify(adjList));

    //////////////////////////////////////////////////////
    // calculate indegrees
    //////////////////////////////////////////////////////
    let disjointComponents = [];
    determineDisjointComponents(disjointComponents, adjList);

    let inDegreeObject = {};
    calculateInDegrees(
      inDegreeObject,
      disjointComponents,
      schoolClassesData,
      adjList
    );

    let zeroList = [];
    for (const classId in inDegreeObject) {
      if (inDegreeObject[classId] === 0) {
        zeroList.push(parseInt(classId));
      }
    }
    //////////////////////////////////////////////////////
    // calculate indegrees
    //////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////
    // pruning adjacency list of anything that has been taken already
    //////////////////////////////////////////////////////
    const takenClasses = await TakenClass.findAll({ where: { StudentId } });
    const takenClassesData = takenClasses.map(
      (takenClass) => takenClass.dataValues.ClassId
    );
    const takenClassSet = new Set(takenClassesData);

    // create taken set from takenClasses
    const taken = new Set();
    for (let i = 0; i < takenClassesData.length; i++) {
      const takenClass = takenClassesData[i];
      taken.add(takenClass);
    }
    // start pruning from zeroList items, dfs
    for (let i = 0; i < zeroList.length; i++) {
      const currentClass = zeroList[i];
      if (takenClassSet.has(currentClass)) {
        dfsPrune(currentClass, adjList, takenClassSet);
      }
    }
    ///////////////////////////////////////////////////////
    // pruning adjacency list of anything that has been taken already
    //////////////////////////////////////////////////////

    //////////////////////////////////////////////////////
    // calculate indegrees
    //////////////////////////////////////////////////////
    inDegreeObject = {};
    calculateInDegrees(
      inDegreeObject,
      disjointComponents,
      schoolClassesData,
      adjList
    );

    zeroList = [];
    for (const classId in inDegreeObject) {
      if (
        inDegreeObject[classId] === 0 &&
        !takenClassSet.has(parseInt(classId))
      ) {
        zeroList.push(parseInt(classId));
      }
    }
    //////////////////////////////////////////////////////
    // calculate indegrees
    //////////////////////////////////////////////////////

    //////////////////////////////////////////////////////
    // determine set of remaining classes and prune adjancency list to include them only
    //////////////////////////////////////////////////////
    const requiredClasses = await RequiredClass.findAll({
      where: { SchoolId },
    });
    const requiredClassesData = requiredClasses.map(
      (requiredClass) => requiredClass.dataValues.ClassId
    );

    const remainingClassArray = requiredClassesData.filter(
      (requiredClass) => !takenClassSet.has(requiredClass)
    );
    const remainingClassSet = new Set(remainingClassArray);

    for (const element in adjList) {
      // delete it, non-required
      if (takenClassSet.has(parseInt(element))) {
        delete adjList[element];
      }
    }

    for (const element in adjList) {
      // delete it, non-required
      if (!remainingClassSet.has(parseInt(element))) {
        delete adjList[element];
      } else {
        // loop through neighbors to find a non-required element and remove them
        adjList[element] = adjList[element].filter((neighbor) =>
          remainingClassSet.has(neighbor)
        );
      }
    }
    //////////////////////////////////////////////////////
    // determine set of remaining classes and prune adjancency list to include them only
    //////////////////////////////////////////////////////

    // add these courses directly to the final schedule set //////
    for (const key in adjList) {
      newSchedule.add(parseInt(key));
    }

    const finalScheduleAdjList = {};
    for (const course of newSchedule) {
      finalScheduleAdjList[course] = originalAdjList[course].filter((neigbor) =>
        newSchedule.has(neigbor)
      );
    }

    res.json({ finalScheduleAdjList });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
