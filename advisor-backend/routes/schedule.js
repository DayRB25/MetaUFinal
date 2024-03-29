// library imports
import express from "express";
// model imports
import { Class } from "../models/index.js";
import { Prerequisite } from "../models/index.js";
import { RequiredClass } from "../models/index.js";
import { TakenClass } from "../models/index.js";
import { Student } from "../models/index.js";
// util imports
import { Queue } from "../utils/Queue.js";

const router = express.Router();
// number of electives required for graduation
const numberOfElectives = 6;
// max number of classes that fit in a year
const classesPerYear = 6;

// initialize in degree object (indegree object maps a class id to its indegree count)
const initIndegreeObject = (inDegreeObject, classData) => {
  for (let i = 0; i < classData.length; i++) {
    const schoolClass = classData[i];
    inDegreeObject[schoolClass.id] = 0;
  }
};

// calculate the indegrees of all classes in indegree object using the disjoint components in the graph
const calculateInDegrees = (inDegreeObject, disjointComponents, adjList) => {
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

// calculate the number of year a student has before graduation
// if a specified graduation date is not provided, assume a regular 4 year cycle
const calculateNumberOfYearsBeforeGrad = (gradYear, studentYear) => {
  if (gradYear != null) {
    return gradYear - new Date().getFullYear();
  } else {
    return 4 - studentYear;
  }
};

// check if the schedule is valid (no violation of prereqs or postreqs)
const isValidSchedule = (
  scheduleObject,
  desiredYear,
  dependentCoursesSet,
  backSwap
) => {
  let validMoveFlag = true;
  for (const year in scheduleObject) {
    // only check desiredYear and after
    if (
      backSwap ? parseInt(year) >= desiredYear : parseInt(year) <= desiredYear
    ) {
      const coursesSet = scheduleObject[year];
      dependentCoursesSet.forEach((dependentCourse) => {
        if (coursesSet.has(dependentCourse)) {
          // invalid schedule
          validMoveFlag = false;
        }
      });
    }
  }
  return validMoveFlag;
};

// schedule object maps each year to a set of classes that occur in that year
// create this object using the schedule received from the user
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

// helper function driving the dfs to count function
const countNodes = (sourceNode, graph) => {
  const visited = new Set();
  dfsToCount(sourceNode, graph, visited);
  return { classes: visited, count: visited.size };
};

// to prioritize graduation speed, delete pre req paths that will potentially be too long and stall graduation
const deleteLengthyPrereqPaths = (preReqPaths, tooLongSet, yearsLeft) => {
  for (const course in preReqPaths) {
    if (preReqPaths[course].count > Math.min(yearsLeft - 1, 1)) {
      tooLongSet.add(parseInt(course));
      delete preReqPaths[course];
    }
  }
};

// determine the disjoint components in the graph
// courses like biology will be in no way connected to a course like enlgish, so
// identify these separate components
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

// prereq paths object maps a course id to the length of its prereq path (including itself)
// and a set containing all of the courses on that path
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

// general dfs function
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

// dfs to prune courses that have been taken from the course catalog adjacency
// list
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

// dfs used to count the number of nodes with
// directed edges connecting them
const dfsToCount = (node, graph, visited) => {
  if (!visited.has(node)) {
    visited.add(parseInt(node));
  }
  for (const neighbor of graph[node]) {
    dfsToCount(neighbor, graph, visited);
  }
};

// function housing the general recursive logic to identify
// all courses in a subgroup rooted at the arg course
const findAllCoursesInSubGraphRootedAtCourse = (
  course,
  graph,
  dependentCourses
) => {
  for (const dependentCourse of graph[course]) {
    if (!dependentCourses.has(dependentCourse)) {
      dependentCourses.add(parseInt(dependentCourse));
      findAllCoursesInSubGraphRootedAtCourse(
        dependentCourse,
        graph,
        dependentCourses
      );
    }
  }
};

// function calling logic above, remain separate from findAllPostreqs for clarity
const findAllPrerequisites = (course, graph, prereqs) => {
  findAllCoursesInSubGraphRootedAtCourse(course, graph, prereqs);
};

// function calling logic above, remain separate from findAllPrereqs for clarity
const findAllPostrequisites = (course, graph, postreqs) => {
  findAllCoursesInSubGraphRootedAtCourse(course, graph, postreqs);
};

// function to find the year the arg course resides in
const findCourseYear = (scheduleObject, course) => {
  for (const year in scheduleObject) {
    if (scheduleObject[year].has(course.id)) {
      return parseInt(year);
    }
  }
  return -1;
};

// function to generate topological sort from the arg adjList
// start with the zero-indegree nodes contained in zero queue
// as they are the "source" nodes
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

// function to fetch course data from courseId
const fetchCourseData = async (courseId) => {
  try {
    const res = await Class.findOne({ where: { id: courseId } });
    return res.dataValues;
  } catch (error) {
    return null;
  }
};

// function to fetch course ID from a course name
const fetchCourseDataByName = async (name) => {
  try {
    const res = await Class.findOne({ where: { name } });
    return res.dataValues.id;
  } catch (error) {
    return null;
  }
};

// function to find the index of a course within the nested class array
// provided the index of the year and the id of the course
const findCourseIdx = (courseId, schedule, yearIdx) => {
  const courseIdx = schedule[yearIdx].semesters[0].classes.findIndex(
    (classItem) => classItem.id === courseId
  );
  return courseIdx;
};

// function to fetch course object provided course index and year index
// used in conjunction with the function above
const findCourseDetails = (courseIdx, schedule, yearIdx) => {
  const courseInfo = schedule[yearIdx].semesters[0].classes[courseIdx];
  return courseInfo;
};

// function to find the index of the year whose nyear number matches
// the arg number
const findYearIdx = (number, schedule) => {
  const yearIdx = schedule.findIndex((year) => year.number === number);
  return yearIdx;
};

// create the course catalog adjacency list using class data
const generateAdjList = async (schoolClassesData) => {
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
    const dependentClassesData =
      isolateDataValsFromSequelizeData(dependentClasses);

    // add all classes current class is a pre-req for to adj list
    for (let j = 0; j < dependentClassesData.length; j++) {
      const dependentClass = dependentClasses[j];
      adjList[schoolClass.id].push(dependentClass.PostreqId);
    }
  }
  return adjList;
};

// provided a valid topological sort, attempt to generate a schedule
// in which classes are placed into specific years
// this algorithm is a greedy approach, and thus, may not always lead to
// the "optimal" schedule
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

// isolate date values from sequelize data
// sequelize raw data includes some additional fields that are not of interest
const isolateDataValsFromSequelizeData = (data) => {
  const dataValues = data.map((schoolClass) => schoolClass.dataValues);
  return dataValues;
};

// shift a course to a desired year by removing it from its original year
// and adding it to the desired year
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

// function to reverse the edges within an adjacency list
// s.t. an edge from a to b, is not an edge from b to a
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

// transform an array of course names to an array of course IDs
const transformCourseNameArrayToID = async (courseNames) => {
  const coursesIDs = [];
  for (let i = 0; i < courseNames.length; i++) {
    const courseName = courseNames[i];
    const courseId = await fetchCourseDataByName(courseName);
    coursesIDs.push(courseId);
  }
  return coursesIDs;
};

// sort the pre req paths object by converting into an iterable
// array of arrays where array[0] is an index and array[1] is the pre req path
// object containing the id of the root course as well as the pre leq path length
// and the set of classes in the path
const sortPreReqPaths = (preReqPaths) => {
  // create enumerable key-value type array to sort
  const preReqPathsEnumerable = Object.entries(preReqPaths);
  // since preReqPaths maps a class id to an object containing the count of classes in its prereq path and a set of the classes
  // sort by the object's count property
  const sortedPreReqPaths = preReqPathsEnumerable.sort(
    (a, b) => a[1].count - b[1].count
  );
  return sortedPreReqPaths;
};

// removes any course that has already been taken from the adjacency list
const pruneTakenCoursesFromAdjacencyList = (
  zeroList,
  takenClassSet,
  adjList
) => {
  for (let i = 0; i < zeroList.length; i++) {
    const currentClass = zeroList[i];
    if (takenClassSet.has(currentClass)) {
      dfsPrune(currentClass, adjList, takenClassSet);
    }
  }
};

// extracts IDs from sequelize data
const isolateClassIDsFromSequelizeData = (data) => {
  const IDs = data.map((dataItem) => dataItem.dataValues.ClassId);
  return IDs;
};

// fetches class data from sequelize and isolates class ids
const getTakenClassesIDs = async (StudentId) => {
  const takenClasses = await TakenClass.findAll({ where: { StudentId } });
  const takenClassesData = isolateClassIDsFromSequelizeData(takenClasses);
  return takenClassesData;
};

// fetches class data from sequelize and isolates class ids
const getRequiredClassesIDs = async (SchoolId) => {
  const requiredClasses = await RequiredClass.findAll({ where: { SchoolId } });
  const requiredClassesData = isolateClassIDsFromSequelizeData(requiredClasses);
  return requiredClassesData;
};

// delete any classes that have been taken or that are not required from adjacency list
const deleteTakenAndNonRequiredClassesFromAdjList = (
  adjList,
  takenClassSet,
  remainingClassSet
) => {
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
};

// call delete function to remove non-required and taken classes from adjList
// then add the remaining items to the newSchedule
const addRemainingRequiredCoursesToSchedule = (
  adjList,
  takenClassSet,
  remainingClassSet,
  newSchedule
) => {
  deleteTakenAndNonRequiredClassesFromAdjList(
    adjList,
    takenClassSet,
    remainingClassSet
  );
  for (const course in adjList) {
    newSchedule.add(parseInt(course));
  }
};

// calculate the number of remaining classes in valid schedule
const calculateNumberOfRemainingClassesInValidSchedule = (
  yearsLeft,
  numberOfPotentialClassesTaken
) => {
  const totalClassesLeft = classesPerYear * yearsLeft;
  const numberOfRemainingClasses =
    totalClassesLeft - numberOfPotentialClassesTaken;
  return numberOfRemainingClasses;
};

// using the newSchedule set containing all of the courses for the schedule,
// geenrate the final adjacency list
const generateFinalAdjList = (newSchedule, originalAdjList) => {
  const finalScheduleAdjList = {};
  for (const course of newSchedule) {
    finalScheduleAdjList[course] = originalAdjList[course].filter((neigbor) =>
      newSchedule.has(neigbor)
    );
  }
  return finalScheduleAdjList;
};

// Route for student schedule creation
router.post("/create", async (req, res) => {
  const SchoolId = req.body.SchoolId;
  const StudentId = req.body.StudentId;

  const preferredCoursesByName = req.body.preferredCourses;
  // transform preferredCourses to be an array of course id's
  const preferredCourses = await transformCourseNameArrayToID(
    preferredCoursesByName
  );

  let gradYear = null;
  if (req.body.gradYear) {
    gradYear = req.body.gradYear;
  }
  const newSchedule = new Set();
  try {
    const schoolClasses = await Class.findAll({ where: { SchoolId } });
    // isolating relevant data from response
    const schoolClassesData = isolateDataValsFromSequelizeData(schoolClasses);
    // generate adjancency list using school id
    const adjList = await generateAdjList(schoolClassesData);
    // save for later
    const originalAdjList = JSON.parse(JSON.stringify(adjList));
    const electiveAdditionAdjList = JSON.parse(JSON.stringify(adjList));

    //////////////////////////////////////////////////////
    // calculate indegrees
    //////////////////////////////////////////////////////
    let disjointComponents = [];
    determineDisjointComponents(disjointComponents, adjList);

    let inDegreeObject = {};
    initIndegreeObject(inDegreeObject, schoolClassesData);
    calculateInDegrees(inDegreeObject, disjointComponents, adjList);

    let zeroList = [];
    for (const classId in inDegreeObject) {
      if (inDegreeObject[classId] === 0) {
        zeroList.push(parseInt(classId));
      }
    }

    ///////////////////////////////////////////////////////
    // pruning adjacency list of anything that has been taken already
    //////////////////////////////////////////////////////
    const takenClassesData = await getTakenClassesIDs(StudentId);
    const takenClassSet = new Set(takenClassesData);

    pruneTakenCoursesFromAdjacencyList(zeroList, takenClassSet, adjList);

    //////////////////////////////////////////////////////
    // calculate indegrees of adjacency list with taken courss removed
    //////////////////////////////////////////////////////
    inDegreeObject = {};
    initIndegreeObject(inDegreeObject, schoolClassesData);
    calculateInDegrees(inDegreeObject, disjointComponents, adjList);

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
    // determine set of remaining classes and delete adjancency list of any
    // non-required core courses or taken courses (electives),
    // then add to new schedule
    //////////////////////////////////////////////////////
    const requiredClassesData = await getRequiredClassesIDs(SchoolId);
    const requiredClassesSet = new Set(requiredClassesData);

    const remainingClassArray = requiredClassesData.filter(
      (requiredClass) => !takenClassSet.has(requiredClass)
    );
    const remainingClassSet = new Set(remainingClassArray);

    addRemainingRequiredCoursesToSchedule(
      adjList,
      takenClassSet,
      remainingClassSet,
      newSchedule
    );

    //////////////////////////////////////////////////////
    // determine how many more classes can fit in the schedule
    //////////////////////////////////////////////////////
    const numberOfClasses = Object.getOwnPropertyNames(adjList).length;
    const student = await Student.findOne({ where: { id: StudentId } });

    const yearsLeft = calculateNumberOfYearsBeforeGrad(gradYear, student.year);
    let remainingClasses = calculateNumberOfRemainingClassesInValidSchedule(
      yearsLeft,
      numberOfClasses
    );
    if (remainingClasses <= 0) {
      // not possible to graduate in the current time frame
      return res.json({
        message: "Not possible to graduate with current time frame",
      });
    }

    //////////////////////////////////////////////////////
    // adding required number of electives
    //////////////////////////////////////////////////////
    const numberOfElectivesTaken = takenClassesData.filter(
      (takenClass) => !requiredClassesSet.has(takenClass)
    ); // everything in taken that is not required
    let numberOfRemainingElectives =
      numberOfElectives -
      Math.min(numberOfElectivesTaken.length, numberOfElectives);

    // need overall adjacency matrix again, remove all taken courses (including those in adjList), should be left with only the non-required courses
    for (const element in electiveAdditionAdjList) {
      // delete it, non-required
      if (
        remainingClassSet.has(parseInt(element)) ||
        takenClassSet.has(parseInt(element))
      ) {
        delete electiveAdditionAdjList[element];
      }
    }

    // reverse edges so that I can start at a preferred course, and traverse from post-req to pre-req to determine the longest path to complete each course
    let reversedAdjList = reverseAdjList(electiveAdditionAdjList);
    const saveReverseAdjList = JSON.parse(JSON.stringify(reversedAdjList));

    // determine pre-req path for all nodes in in reversedAdjList
    let preReqPaths = {};
    determinePrereqPaths(preReqPaths, reversedAdjList);
    let tooLongSet = new Set();
    deleteLengthyPrereqPaths(preReqPaths, tooLongSet, yearsLeft);

    // sort to find the smallest prereqpath courses
    let sortedPreReqPaths = sortPreReqPaths(preReqPaths);

    // then add until remaining number of electives is 0
    const addedElectiveCourses = new Set();
    while (
      sortedPreReqPaths.length !== 0 &&
      remainingClasses !== 0 &&
      numberOfRemainingElectives > 0
    ) {
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
      sortedPreReqPaths = sortPreReqPaths(preReqPaths);
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
      sortedPreReqPaths = sortPreReqPaths(preReqPaths);

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
        sortedPreReqPaths = sortPreReqPaths(preReqPaths);
        if (sortedPreReqPaths.length === 0 || remainingClasses === 0) {
          break;
        }
      }
    }
    //////////////////////////////////////////////////////
    // use additional space for preferred classes
    //////////////////////////////////////////////////////

    //////////////////////////////////////////////////////
    // add schedule elements to final adj list
    //////////////////////////////////////////////////////

    const finalScheduleAdjList = generateFinalAdjList(
      newSchedule,
      originalAdjList
    );

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

    calculateInDegrees(
      inDegreeObject,
      disjointComponents,
      finalScheduleAdjList
    );
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
    const reversedFinalAdjList = reverseAdjList(finalScheduleAdjList);

    const schedule = await generateSchedule(
      topologicalSort,
      reversedFinalAdjList,
      yearsLeft,
      student.year
    );

    res.json({ schedule, finalScheduleAdjList });
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
    const validForwardMove = isValidSchedule(
      scheduleObject,
      desiredYear,
      postReqsSet,
      false
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
    const validBackMove = isValidSchedule(
      scheduleObject,
      desiredYear,
      preReqsSet,
      true
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
      // find postReqs ////
      const postReqsSet = new Set();
      findAllPostrequisites(courseToChange.id, scheduleAdjList, postReqsSet);

      // now to check through the relevant years in scheduleObject for any of the postReqs
      const validForwardMove = isValidSchedule(
        scheduleObject,
        desiredYear,
        postReqsSet,
        false
      );

      // find preReqs ////
      const preReqsSet = new Set();
      findAllPrerequisites(course, reverseScheduleAdjList, preReqsSet);

      // now to check through the relevant years in scheduleObject for any of the postReqs //
      const validBackMove = isValidSchedule(
        scheduleObject,
        courseYear,
        preReqsSet,
        true
      );

      // if both flags still true, add it's name to array of valid options
      if (validForwardMove && validBackMove) {
        const yearIdx = findYearIdx(desiredYear, schedule);
        const courseIdx = findCourseIdx(course, schedule, yearIdx);
        const courseDetails = findCourseDetails(courseIdx, schedule, yearIdx);
        validMoves.push(courseDetails.name);
      }
    });
    return res.json({ validMoves });
  } else {
    // backward swap for courseToChange
    courseSet.forEach((course) => {
      // then do forward check for course
      // find postReqs ////
      const postReqsSet = new Set();
      findAllPostrequisites(course, scheduleAdjList, postReqsSet);

      // now to check through the relevant years in scheduleObject for any of the postReqs //
      const validForwardMove = isValidSchedule(
        scheduleObject,
        courseYear,
        postReqsSet,
        false
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
      const validBackMove = isValidSchedule(
        scheduleObject,
        desiredYear,
        preReqsSet,
        true
      );

      // if both flags true, swap is valid add it's name to array of valid options
      if (validBackMove && validForwardMove) {
        const yearIdx = findYearIdx(desiredYear, schedule);
        const courseIdx = findCourseIdx(course, schedule, yearIdx);
        const courseDetails = findCourseDetails(courseIdx, schedule, yearIdx);
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
