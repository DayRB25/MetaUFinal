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
    if (preReqPaths[course].count > yearsLeft - 2) {
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

module.exports = { initIndegreeObject };
