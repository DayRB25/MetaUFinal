import express from "express";
import { Schedule } from "../models/index.js";
import { Year } from "../models/index.js";
import { Semester } from "../models/index.js";
import { SemesterClass } from "../models/index.js";

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

export default router;
