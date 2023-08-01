import express from "express";
import { Schedule } from "../models/index.js";
import { Year } from "../models/index.js";
import { Semester } from "../models/index.js";
import { SemesterClass } from "../models/index.js";
import { Class } from "../models/index.js";

const pageLimit = 1;

const router = express.Router();

// create schedule -
// bottom up creation, start w/ available courses, piece up to the semester, then to year, then to scheduke
router.post("/create", async (req, res) => {
  const schedule = req.body.schedule;
  const StudentId = req.body.StudentId;
  const newSchedule = await Schedule.create({ StudentId });

  try {
    for (let i = 0; i < schedule.length; i++) {
      const yearSemesters = schedule[i].semesters;
      const yearNumber = schedule[i].number;
      const newYear = await Year.create({
        ScheduleId: newSchedule.id,
        number: yearNumber,
      });
      for (let j = 0; j < yearSemesters.length; j++) {
        const semesterClasses = yearSemesters[j].classes;
        const semesterNumber = yearSemesters[j].number;
        const newSemester = await Semester.create({
          YearId: newYear.id,
          number: semesterNumber,
        });
        for (let k = 0; k < semesterClasses.length; k++) {
          // need id from each class
          const classItem = semesterClasses[k];
          const ClassId = classItem.id;
          const newSemesterClass = await SemesterClass.create({
            SemesterId: newSemester.id,
            ClassId,
          });
        }
      }
    }

    res.status(200).json({ message: "Save successful" });
  } catch (error) {
    res.status(500).json({ error: "Save unsuccessful. Internal server error" });
  }
});

// fetch page count
router.get("/:studentId/page-count", async (req, res) => {
  const StudentId = req.params.studentId;
  try {
    const count = await Schedule.count({
      where: {
        StudentId,
      },
    });
    const pageCount = Math.ceil(count / pageLimit);
    res.status(200).json({ pageCount });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// fetch schedules associated with provided studentId
router.get("/:studentId/:page", async (req, res) => {
  const StudentId = req.params.studentId;
  const page = req.params.page;
  const schedulesArray = [];

  try {
    const schedules = await Schedule.findAll({
      where: {
        StudentId,
      },
      limit: pageLimit,
      offset: (page - 1) * pageLimit,
    });

    const schedulesDataIDs = schedules.map(
      (schedule) => schedule.dataValues.id
    );

    for (let i = 0; i < schedulesDataIDs.length; i++) {
      const ScheduleId = schedulesDataIDs[i];
      const schedule = [];
      const years = await Year.findAll({ where: { ScheduleId } });
      // check if years is empty, if its empty, no ScheduleId
      if (years.length === 0) {
        return res.status(400).json({ message: "Schedule does not exist" });
      }

      for (let i = 0; i < years.length; i++) {
        const year = years[i];
        const semesters = [];

        const yearSemesters = await Semester.findAll({
          where: { YearId: year.id },
        });

        for (let j = 0; j < yearSemesters.length; j++) {
          const semester = yearSemesters[j];
          const classes = [];

          const semesterClasses = await SemesterClass.findAll({
            where: { SemesterId: semester.id },
          });
          for (let k = 0; k < semesterClasses.length; k++) {
            const classId = semesterClasses[k].ClassId;
            const classItem = await Class.findOne({ where: { id: classId } });

            // create class object and add to classes array
            const classObject = {
              id: classId,
              description: classItem.description,
              units: classItem.units,
              name: classItem.name,
            };
            classes.push(classObject);
          }
          // create semester object and add to semesters array
          const semesterObject = { number: semester.number, classes: classes };
          semesters.push(semesterObject);
        }
        // create year objects and add to schedule array
        const yearObject = { number: year.number, semesters: semesters };
        schedule.push(yearObject);
      }
      schedulesArray.push(schedule);
    }

    res.status(200).json({ schedules: schedulesArray });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Fetch unsuccessful. Internal server error" });
  }
});

export default router;
