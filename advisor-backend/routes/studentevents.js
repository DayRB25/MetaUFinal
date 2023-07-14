import express from "express";
import { Student } from "../models/index.js";
import { EventDetails } from "../models/index.js";
import { StudentEvent } from "../models/index.js";

const router = express.Router();

// Route for student event creation
router.post("/create", async (req, res) => {
  const StudentId = req.body.studentId;
  const EventDetailId = req.body.eventDetailId;
  const hours = req.body.hours;

  try {
    // Check if student with id exists
    const student = await Student.findOne({ where: { id: StudentId } });

    if (!student) {
      return res.status(400).json({ error: "Student does not exist" });
    }
    // Check if the event with id exists
    const eventDetail = await EventDetails.findOne({
      where: { id: EventDetailId },
    });
    if (!eventDetail) {
      return res.status(400).json({ error: "Event does not exist" });
    }

    // create student event
    const newStudentEvent = await StudentEvent.create({
      StudentId,
      EventDetailId,
      hours,
    });

    // Return the student data in the response
    res.json({ newStudentEvent });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
