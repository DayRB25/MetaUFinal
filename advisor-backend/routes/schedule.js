import express from "express";
import { Class } from "../models/index.js";
import { Prerequisite } from "../models/index.js";
import { RequiredClass } from "../models/index.js";
import { TakenClass } from "../models/index.js";
import { Student } from "../models/index.js";
import { Queue } from "../utils/Queue.js";

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

const checkDesiredYearAndBefore = (
  scheduleObject,
  desiredYear,
  postReqsSet
) => {
  let validMoveFlag = true;
  for (const year in scheduleObject) {
    // only check desiredYear and before
    if (parseInt(year) <= desiredYear) {
      const coursesSet = scheduleObject[year];
      postReqsSet.forEach((postReq) => {
        if (coursesSet.has(postReq)) {
          // invalid schedule
          validMoveFlag = false;
        }
      });
    }
  }
  return validMoveFlag;
};

const checkDesiredYearAndAfter = (scheduleObject, desiredYear, preReqsSet) => {
  let validMoveFlag = true;
  for (const year in scheduleObject) {
    // only check desiredYear and after
    if (parseInt(year) >= desiredYear) {
      const coursesSet = scheduleObject[year];
      preReqsSet.forEach((preReq) => {
        if (coursesSet.has(preReq)) {
          // invalid schedule
          validMoveFlag = false;
        }
      });
    }
  }
  return validMoveFlag;
};

const createScheduleObject = (schedule, scheduleObject) => {
  for (let i = 0; i < schedule.length; i++) {
    const year = schedule[i];
    const yearSemester = year.semesters[0];
    const yearClasses = yearSemester.classes;
    const yearSet = new Set();
    for (let j = 0; j < yearClasses.length; j++) {
      const course = yearClasses[j];
      yearSet.add(course.id);
    }
    scheduleObject[year.number] = yearSet;
  }
};

const countNodes = (sourceNode, graph) => {
  const visited = new Set();
  dfsToCount(sourceNode, graph, visited);
  return { classes: visited, count: visited.size };
};

const deepCopyWithSets = (obj) => {
  const copiedObject = {};
  for (const key in obj) {
    if (typeof obj[key] === "object" && obj[key] instanceof Set) {
      copiedObject[key] = new Set(obj[key]);
    } else if (typeof obj[key] === "object") {
      copiedObject[key] = deepCopyWithSets(obj[key]);
    } else {
      copiedObject[key] = obj[key];
    }
  }
  return copiedObject;
};

const deleteLengthyPrereqPaths = (preReqPaths, tooLongSet, yearsLeft) => {
  for (const course in preReqPaths) {
    if (preReqPaths[course].count > yearsLeft - 2) {
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

const findAllPrerequisites = (course, graph, prereqs) => {
  for (const prereq of graph[course]) {
    if (!prereqs.has(prereq)) {
      prereqs.add(parseInt(prereq));
      findAllPrerequisites(prereq, graph, prereqs);
    }
  }
};

const findAllPostrequisites = (node, adjList, postReqSet) => {
  for (const postreq of adjList[node]) {
    if (!postReqSet.has(postreq)) {
      postReqSet.add(postreq);
      findAllPostrequisites(postreq, adjList, postReqSet);
    }
  }
};

const findCourseYear = (scheduleObject, course) => {
  for (const year in scheduleObject) {
    if (scheduleObject[year].has(course.id)) {
      return parseInt(year);
    }
  }
  return -1;
};

const generateTopologicalSort = (
  topologicalSort,
  zeroQueue,
  adjList,
  inDegreeObject
) => {
  while (!zeroQueue.isEmpty()) {
    const currentClass = zeroQueue.dequeue();

    topologicalSort.push(currentClass);
    for (const neighbor of adjList[currentClass]) {
      inDegreeObject[neighbor] -= 1;
      if (inDegreeObject[neighbor] === 0) {
        zeroQueue.enqueue(neighbor);
      }
    }
  }
};

const fetchCourseData = async (courseId) => {
  try {
    const res = await Class.findOne({ where: { id: courseId } });
    return res.dataValues;
  } catch (error) {
    return null;
  }
};

const fetchCourseDataByName = async (name) => {
  try {
    const res = await Class.findOne({ where: { name } });
    return res.dataValues.id;
  } catch (error) {
    return null;
  }
};

const generateSchedule = async (
  topologicalSort,
  reversedFinalAdjList,
  yearsLeft,
  startYear
) => {
  const maxClassesPerYear = 6;
  const years = [];
  for (let i = 0; i < yearsLeft; i++) {
    years.push({
      number: startYear + i,
      semesters: [
        { number: 1, classes: [] },
        { number: 2, classes: [] },
      ],
    });
  }
  const courseYearMap = {};
  for (const course of topologicalSort) {
    courseYearMap[course] = -1;
  }

  for (const course of topologicalSort) {
    // for each course in the topo sort
    // find all pre-reqs
    const prereqs = new Set();
    findAllPrerequisites(course, reversedFinalAdjList, prereqs);
    let potentialYear = 0;
    for (const prereq of prereqs) {
      // get the current year of all prereq, this course needs to be greater than the greatest year
      const prereqYear = courseYearMap[prereq];
      potentialYear = Math.max(potentialYear, prereqYear + 1);
    }
    if (potentialYear >= yearsLeft) {
      return null;
    } else if (
      years[potentialYear].semesters[0].classes.length == maxClassesPerYear &&
      potentialYear === yearsLeft
    ) {
      return null;
    } else if (
      years[potentialYear].semesters[0].classes.length == maxClassesPerYear
    ) {
      potentialYear += 1;
    }
    courseYearMap[course] = potentialYear;
    const courseInfo = await fetchCourseData(course);
    years[potentialYear].semesters[0].classes.push(courseInfo);
    years[potentialYear].semesters[1].classes.push(courseInfo);
  }
  return years;
};

const moveCourseToDifferentYear = (
  schedule,
  desiredYear,
  originalYear,
  course
) => {
  for (let i = 0; i < schedule.length; i++) {
    const year = schedule[i];
    // delete it from this year
    if (year.number === originalYear) {
      // for both semesters
      year.semesters[0].classes = year.semesters[0].classes.filter(
        (classItem) => classItem.id !== course.id
      );
      year.semesters[1].classes = year.semesters[0].classes.filter(
        (classItem) => classItem.id !== course.id
      );
    }

    // add it to this year
    if (year.number === desiredYear) {
      year.semesters[0].classes.push(course);
      year.semesters[1].classes.push(course);
    }
  }
};

const reverseAdjList = (adjList) => {
  let reversedAdjList = {};
  for (const node in adjList) {
    reversedAdjList[node] = [];
  }

  for (const node in adjList) {
    for (const neighbor of adjList[node]) {
      reversedAdjList[neighbor].push(node);
    }
  }
  return reversedAdjList;
};

// Route for student schedule creation
router.post("/create", async (req, res) => {
  const SchoolId = req.body.SchoolId;
  const StudentId = req.body.StudentId;

  const preferredCoursesByName = req.body.preferredCourses;
  // transform preferredCourses to be an array of course id's
  const preferredCourses = [];
  for (let i = 0; i < preferredCoursesByName.length; i++) {
    const preferredCourse = preferredCoursesByName[i];
    const courseId = await fetchCourseDataByName(preferredCourse);
    preferredCourses.push(courseId);
  }

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
    let numberOfRemainingElectives =
      numberOfElectives - numberOfElectivesTaken.length;

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
    if (numberOfRemainingElectives > 0) {
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

    //////////////////////////////////////////////////////
    // add schedule elements to final adj list
    //////////////////////////////////////////////////////
    const finalScheduleAdjList = {};
    for (const course of newSchedule) {
      finalScheduleAdjList[course] = originalAdjList[course].filter((neigbor) =>
        newSchedule.has(neigbor)
      );
    }
    //////////////////////////////////////////////////////
    // add schedule elements to final adj list
    //////////////////////////////////////////////////////

    //////////////////////////////////////////////////////
    // calculate in degrees
    //////////////////////////////////////////////////////
    disjointComponents = [];
    determineDisjointComponents(disjointComponents, finalScheduleAdjList);

    inDegreeObject = {};

    for (const classItem in finalScheduleAdjList) {
      const intId = parseInt(classItem);
      inDegreeObject[intId] = 0;
    }

    for (let i = 0; i < disjointComponents.length; i++) {
      const component = disjointComponents[i];
      // recreate adjList for this component
      const componentAdjList = {};
      for (let j = 0; j < component.length; j++) {
        const classId = component[j];
        componentAdjList[classId] = finalScheduleAdjList[classId];
      }
      // calculate in degrees
      for (const classId in componentAdjList) {
        for (const postreqId of componentAdjList[classId]) {
          inDegreeObject[postreqId] += 1;
        }
      }
    }
    //////////////////////////////////////////////////////
    // calculate in degrees
    //////////////////////////////////////////////////////

    const zeroQueue = new Queue();
    for (const classId in inDegreeObject) {
      if (inDegreeObject[classId] === 0) {
        zeroQueue.enqueue(parseInt(classId));
      }
    }

    // generate toposort
    const topologicalSort = [];
    generateTopologicalSort(
      topologicalSort,
      zeroQueue,
      finalScheduleAdjList,
      inDegreeObject
    );

    // from the toposort, create the year object
    const reversedFinalAdjList = {};
    for (const node in finalScheduleAdjList) {
      reversedFinalAdjList[node] = [];
    }

    for (const node in finalScheduleAdjList) {
      for (const neighbor of finalScheduleAdjList[node]) {
        reversedFinalAdjList[neighbor].push(node);
      }
    }

    const schedule = await generateSchedule(
      topologicalSort,
      reversedFinalAdjList,
      yearsLeft,
      student.year
    );

    res.json({ schedule });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// this route handles course swaps into years that are not full of classes already
router.post("/nonfull", (req, res) => {
  // schedule array (array of year objects)
  const schedule = req.body.schedule;
  // original adjList for the schedule, need this to verify validity of schedule
  const scheduleAdjList = req.body.scheduleAdjList;
  // course I want to shift
  const courseToChange = req.body.courseToChange;
  // year I want to shift it to
  const desiredYear = req.body.desiredYear;

  // reverse scheduleAdjList
  const reverseScheduleAdjList = reverseAdjList(scheduleAdjList);

  // create array of year sets, each set contains the classes for that year
  const scheduleObject = {};
  createScheduleObject(schedule, scheduleObject);

  // find year of course to be moved
  const courseYear = findCourseYear(scheduleObject, courseToChange);

  // nothing to be done
  if (courseYear === desiredYear) {
    return res.json({ message: "Swapping into current year" });
  }

  // if the course's year is before the desired year, the course is being moved forward
  // for a forward move, need to check if course is coming after it's postreqs
  if (courseYear < desiredYear) {
    // find postReqs ////
    const postReqsSet = new Set();
    findAllPostrequisites(courseToChange.id, scheduleAdjList, postReqsSet);

    // now to check through the relevant years in scheduleObject for any of the postReqs //
    const validForwardMove = checkDesiredYearAndBefore(
      scheduleObject,
      desiredYear,
      postReqsSet
    );

    if (validForwardMove) {
      // valid move
      moveCourseToDifferentYear(
        schedule,
        desiredYear,
        courseYear,
        courseToChange
      );
      return res.status(200).json({ message: "Success", schedule });
    } else {
      // invalid move
      return res.status(200).json({ message: "Invalid" });
    }
  } else {
    // if the course's year is after the desired year, the course is being moved back
    // for a backward move, need to check if course is coming before it's prereqs

    // find preReqs ////
    const preReqsSet = new Set();
    findAllPrerequisites(courseToChange.id, reverseScheduleAdjList, preReqsSet);

    // now to check through the relevant years in scheduleObject for any of the postReqs //
    const validBackMove = checkDesiredYearAndAfter(
      scheduleObject,
      desiredYear,
      preReqsSet
    );

    if (validBackMove) {
      // valid move
      moveCourseToDifferentYear(
        schedule,
        desiredYear,
        courseYear,
        courseToChange
      );
      return res.status(200).json({ message: "Success", schedule });
    } else {
      // invalid move
      return res.status(200).json({ message: "Invalid" });
    }
  }
});

router.post("/full-year-options", (req, res) => {
  // schedule array (array of year objects)
  const schedule = req.body.schedule;
  // original adjList for the schedule, need this to verify validity of schedule
  const scheduleAdjList = req.body.scheduleAdjList;
  // course I want to shift
  const courseToChange = req.body.courseToChange;
  // year I want to shift it to
  const desiredYear = req.body.desiredYear;

  // reverse scheduleAdjList
  const reverseScheduleAdjList = reverseAdjList(scheduleAdjList);

  // create array of year sets
  const scheduleObject = {};
  createScheduleObject(schedule, scheduleObject);
  const courseYear = findCourseYear(scheduleObject, courseToChange);

  // array for storing all of the valid swap options
  const validMoves = [];

  // determine set of courses from desired year
  let courseSet = scheduleObject[desiredYear];
  if (courseYear < desiredYear) {
    // forward swap for courseToChange
    // loop through each course in the set
    courseSet.forEach((course) => {
      // make copy of schedule object to swap items
      const copyForSwap = deepCopyWithSets(scheduleObject);

      // now remove course from desiredYear set
      copyForSwap[desiredYear].delete(course);
      // now remove courseToMove from courseYear set
      copyForSwap[courseYear].delete(courseToChange.id);

      // add course to courseYear and courseToMove to desiredYear
      copyForSwap[desiredYear].add(courseToChange.id);
      copyForSwap[courseYear].add(course);

      // find postReqs ////
      const postReqsSet = new Set();
      findAllPostrequisites(courseToChange.id, scheduleAdjList, postReqsSet);

      // now to check through the relevant years in scheduleObject for any of the postReqs
      const validForwardMove = checkDesiredYearAndBefore(
        scheduleObject,
        desiredYear,
        postReqsSet
      );

      // find preReqs ////
      const preReqsSet = new Set();
      findAllPrerequisites(course, reverseScheduleAdjList, preReqsSet);

      // now to check through the relevant years in scheduleObject for any of the postReqs //
      const validBackMove = checkDesiredYearAndAfter(
        scheduleObject,
        courseYear,
        preReqsSet
      );

      // if both flags still true, add it's name to array of valid options
      if (validForwardMove && validBackMove) {
        const yearIdx = schedule.findIndex(
          (year) => year.number === desiredYear
        );
        const courseDetailsIdx = schedule[
          yearIdx
        ].semesters[0].classes.findIndex(
          (classItem) => classItem.id === course
        );
        const courseDetails =
          schedule[yearIdx].semesters[0].classes[courseDetailsIdx];
        validMoves.push(courseDetails.name);
      }
    });
    return res.json({ validMoves });
  } else {
    // backward swap for courseToChange
    courseSet.forEach((course) => {
      // make copy of schedule object to swap items
      const copyForSwap = deepCopyWithSets(scheduleObject);

      // now remove course from desiredYear set
      copyForSwap[desiredYear].delete(course);
      // now remove courseToMove from courseYear set
      copyForSwap[courseYear].delete(courseToChange.id);

      // add course to courseYear and courseToMove to desiredYear
      copyForSwap[desiredYear].add(courseToChange.id);
      copyForSwap[courseYear].add(course);

      // then do forward check for course
      // find postReqs ////
      const postReqsSet = new Set();
      findAllPostrequisites(course, scheduleAdjList, postReqsSet);

      // now to check through the relevant years in scheduleObject for any of the postReqs //
      const validForwardMove = checkDesiredYearAndBefore(
        scheduleObject,
        courseYear,
        postReqsSet
      );

      // then do backward check for courseToMove
      // find preReqs ////
      const preReqsSet = new Set();
      findAllPrerequisites(
        courseToChange.id,
        reverseScheduleAdjList,
        preReqsSet
      );

      // now to check through the relevant years in scheduleObject for any of the postReqs //
      const validBackMove = checkDesiredYearAndAfter(
        scheduleObject,
        desiredYear,
        preReqsSet
      );

      // if both flags true, swap is valid add it's name to array of valid options
      if (validBackMove && validForwardMove) {
        const yearIdx = schedule.findIndex(
          (year) => year.number === desiredYear
        );
        const courseDetailsIdx = schedule[
          yearIdx
        ].semesters[0].classes.findIndex(
          (classItem) => classItem.id === course
        );
        const courseDetails =
          schedule[yearIdx].semesters[0].classes[courseDetailsIdx];
        validMoves.push(courseDetails.name);
      }
    });
    return res.json({ validMoves });
  }
});

router.post("/swap", (req, res) => {
  const courses = req.body.courses;
  const schedule = req.body.schedule;

  const scheduleObject = {};
  createScheduleObject(schedule, scheduleObject);

  const courseOne = courses[0];
  const courseTwo = courses[1];

  const courseYearOne = findCourseYear(scheduleObject, courseOne);
  const courseYearTwo = findCourseYear(scheduleObject, courseTwo);

  moveCourseToDifferentYear(schedule, courseYearTwo, courseYearOne, courseOne);
  moveCourseToDifferentYear(schedule, courseYearOne, courseYearTwo, courseTwo);
  return res.status(200).json({ schedule });
});

export default router;
