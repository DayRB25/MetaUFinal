import express from "express";
import { Student } from "../models/index.js";
import { EventDetail } from "../models/index.js";
import { StudentSignup } from "../models/index.js";

const router = express.Router();

// Route for student signup creation
router.post("/create", async (req, res) => {
  const StudentId = req.body.studentId;
  const EventDetailId = req.body.eventDetailId;

  try {
    // Check if student with id exists
    const student = await Student.findOne({ where: { id: StudentId } });

    if (!student) {
      return res.status(400).json({ error: "Student does not exist" });
    }
    // Check if the event with id exists
    const eventDetail = await EventDetail.findOne({
      where: { id: EventDetailId },
    });
    if (!eventDetail) {
      return res.status(400).json({ error: "Event does not exist" });
    }

    const existingSignup = await StudentSignup.findOne({
      where: { StudentId, EventDetailId },
    });

    if (existingSignup) {
      return res
        .status(403)
        .json({ error: "You are already signed up for this event." });
    }

    // create student event
    const newStudentSignup = await StudentSignup.create({
      StudentId,
      EventDetailId,
    });

    // Return the student signup data in the response
    res.json({ newStudentSignup });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
