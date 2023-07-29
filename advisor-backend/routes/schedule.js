import express from "express";
import { Class } from "../models/index.js";
import { Prerequisite } from "../models/index.js";
import { RequiredClass } from "../models/index.js";
import { TakenClass } from "../models/index.js";
import { Student } from "../models/index.js";

const router = express.Router();

const numberOfElectives = 6;
const classesPerYear = 6;

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

const countNodes = (sourceNode, graph) => {
  const visited = new Set();
  dfsToCount(sourceNode, graph, visited);
  return { classes: visited, count: visited.size };
};

const deleteLengthyPrereqPaths = (preReqPaths, tooLongSet, yearsLeft) => {
  for (const course in preReqPaths) {
    if (preReqPaths[course].count > yearsLeft - 1) {
      tooLongSet.add(parseInt(course));
      delete preReqPaths[course];
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

const determinePrereqPaths = (preReqPaths, adjList) => {
  for (const course in adjList) {
    const courseInt = parseInt(course);
    preReqPaths[courseInt] = {};
    // run a dfs to determine the number of nodes in the subgraph rooted at course
    const { classes, count } = countNodes(courseInt, adjList);
    preReqPaths[courseInt].count = count;
    preReqPaths[courseInt].classes = classes;
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

const dfsToCount = (node, graph, visited) => {
  if (!visited.has(node)) {
    visited.add(parseInt(node));
  }
  for (const neighbor of graph[node]) {
    dfsToCount(neighbor, graph, visited);
  }
};

// Route for student schedule creation
router.post("/create", async (req, res) => {
  const SchoolId = req.body.SchoolId;
  const StudentId = req.body.StudentId;
  const preferredCourses = req.body.preferredCourses;
  let gradYear = null;
  if (req.body.gradYear) {
    gradYear = req.body.gradYear;
  }
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

    // save for later
    const originalAdjList = JSON.parse(JSON.stringify(adjList));
    const electiveAdditionAdjList = JSON.parse(JSON.stringify(adjList));

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

    const requiredClassesSet = new Set(requiredClassesData);

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

    //////////////////////////////////////////////////////
    // determine how many more classes can fit in the schedule
    //////////////////////////////////////////////////////
    const numberOfClasses = Object.getOwnPropertyNames(adjList).length;
    const student = await Student.findOne({ where: { id: StudentId } });
    let yearsLeft;

    // if goal grad date is present, then use it to determine number of years remaining
    // otherwise base it off of a standard four year cycle
    if (gradYear != null) {
      yearsLeft = gradYear - new Date().getFullYear();
    } else {
      yearsLeft = 4 - student.year;
    }
    if (numberOfClasses >= classesPerYear * yearsLeft) {
      // not possible to graduate in the current time frame
      return res.json({
        message: "Not possible to graduate with current time frame",
      });
    }

    // otherwise there is some space left, calculate the number of remaining classes
    let remainingClasses = classesPerYear * yearsLeft - numberOfClasses;
    //////////////////////////////////////////////////////
    // determine how many more classes can fit in the schedule
    //////////////////////////////////////////////////////

    //////////////////////////////////////////////////////
    // adding required number of electives
    //////////////////////////////////////////////////////
    const numberOfElectivesTaken = takenClassesData.filter(
      (takenClass) => !requiredClassesSet.has(takenClass)
    ); // everything in taken that is not required
    let numberOfRemainingElectives = numberOfElectives - numberOfElectivesTaken;

    // need overall adjacency matrix again, remove all taken courses (including those in adjList), should be left with only the non-required courses
    for (const element in electiveAdditionAdjList) {
      // delete it, non-required
      if (
        remainingClassSet.has(parseInt(element)) ||
        taken.has(parseInt(element))
      ) {
        delete electiveAdditionAdjList[element];
      }
    }

    // reverse edges so that I can start at a preferred course, and traverse from post-req to pre-req to determine the longest path to complete each course
    let reversedAdjList = {};
    for (const node in electiveAdditionAdjList) {
      reversedAdjList[node] = [];
    }

    for (const node in electiveAdditionAdjList) {
      for (const neighbor of electiveAdditionAdjList[node]) {
        reversedAdjList[neighbor].push(node);
      }
    }
    const saveReverseAdjList = JSON.parse(JSON.stringify(reversedAdjList));
    // determine pre-req path for all nodes in in reversedAdjList
    let preReqPaths = {};
    determinePrereqPaths(preReqPaths, reversedAdjList);
    let tooLongSet = new Set();
    deleteLengthyPrereqPaths(preReqPaths, tooLongSet, yearsLeft);

    // sort to find the smallest prereqpath courses
    let sortedPreReqPaths = Object.entries(preReqPaths);
    sortedPreReqPaths.sort((a, b) => a[1].count - b[1].count);

    // then add until remaining number of electives is 0
    const addedElectiveCourses = new Set();
    const electivesTaken = [];
    while (sortedPreReqPaths.length !== 0 && remainingClasses !== 0) {
      const quickestElectiveCourse = sortedPreReqPaths[0][1];
      if (quickestElectiveCourse.count <= numberOfRemainingElectives) {
        // add the associated classes to the overall taking set-- will need to store the visited set-- and decrement remaining courses
        addedElectiveCourses.add(parseInt(sortedPreReqPaths[0][0]));
        reversedAdjList[sortedPreReqPaths[0][0]] = [];
        for (const node in reversedAdjList) {
          reversedAdjList[node] = reversedAdjList[node].filter(
            (classItem) => classItem !== sortedPreReqPaths[0][0]
          );
        }
        // also need to remove dataArray[0][0] from adjList before recalculating preReqPaths
        remainingClasses -= quickestElectiveCourse.count;
        numberOfRemainingElectives -= quickestElectiveCourse.count;
        quickestElectiveCourse.classes.forEach((classItem) =>
          newSchedule.add(classItem)
        );
        quickestElectiveCourse.classes.forEach((classItem) =>
          electivesTaken.push(classItem)
        );
        if (numberOfRemainingElectives === 0) {
          break;
        }
      }

      preReqPaths = {};
      for (const course in reversedAdjList) {
        const intCourse = parseInt(course);
        if (addedElectiveCourses.has(intCourse) || tooLongSet.has(intCourse)) {
          continue;
        }
        preReqPaths[intCourse] = {};
        // run a dfs to determine the number of nodes in the subgraph rooted at course
        const { classes, count } = countNodes(intCourse, reversedAdjList);
        preReqPaths[intCourse].count = count;
        preReqPaths[intCourse].classes = classes;
      }
      sortedPreReqPaths = Object.entries(preReqPaths);
      sortedPreReqPaths.sort((a, b) => a[1].count - b[1].count);
    }
    if (electivesTaken.length < 6) {
      // schedule not valid
      return res.json({
        message: "Invalid schedule. Please enter a later goal graduation date",
      });
    }
    //////////////////////////////////////////////////////
    // adding required number of electives
    //////////////////////////////////////////////////////

    //////////////////////////////////////////////////////
    // use additional space for preferred classes
    //////////////////////////////////////////////////////
    reversedAdjList = saveReverseAdjList;
    preReqPaths = {};
    for (const course of preferredCourses) {
      if (newSchedule.has(course)) {
        continue;
      }
      preReqPaths[course] = {};
      // run a dfs to determine the number of nodes in the subgraph rooted at course
      const { classes, count } = countNodes(course, reversedAdjList);
      preReqPaths[course].count = count;
      preReqPaths[course].classes = classes;
    }

    tooLongSet = new Set();
    deleteLengthyPrereqPaths(preReqPaths, tooLongSet);

    if (Object.getOwnPropertyNames(preReqPaths).length !== 0) {
      // Convert the object to an array of key-value pairs (tuples)
      sortedPreReqPaths = Object.entries(preReqPaths);

      // Sort the array based on the values (second element of each tuple)
      sortedPreReqPaths.sort((a, b) => a[1].count - b[1].count);

      const addedPerferredCourses = new Set();
      while (sortedPreReqPaths.length !== 0 && remainingClasses !== 0) {
        const quickestPreferredCourse = sortedPreReqPaths[0][1];

        if (quickestPreferredCourse.count <= remainingClasses) {
          // add the associated classes to the overall taking set-- will need to store the visited set-- and decrement remaining courses
          addedPerferredCourses.add(parseInt(sortedPreReqPaths[0][0]));
          reversedAdjList[sortedPreReqPaths[0][0]] = [];
          for (const node in reversedAdjList) {
            reversedAdjList[node] = reversedAdjList[node].filter(
              (classItem) => classItem !== sortedPreReqPaths[0][0]
            );
          }
          // also need to remove dataArray[0][0] from adjList before recalculating preReqPaths
          remainingClasses -= quickestPreferredCourse.count;
          quickestPreferredCourse.classes.forEach((classItem) =>
            newSchedule.add(classItem)
          );
        }

        preReqPaths = {};
        for (const course of preferredCourses) {
          if (
            addedPerferredCourses.has(course) ||
            newSchedule.has(course) ||
            tooLongSet.has(course)
          ) {
            continue;
          }
          preReqPaths[course] = {};
          const { classes, count } = countNodes(course, reversedAdjList);
          preReqPaths[course].count = count;
          preReqPaths[course].classes = classes;
        }
        sortedPreReqPaths = Object.entries(preReqPaths);
        if (sortedPreReqPaths.length === 0 || remainingClasses === 0) {
          break;
        }
        sortedPreReqPaths.sort((a, b) => a[1].count - b[1].count);
      }
    }
    //////////////////////////////////////////////////////
    // use additional space for preferred classes
    //////////////////////////////////////////////////////

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
