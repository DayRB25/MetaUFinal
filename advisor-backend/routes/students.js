import express from "express";
import bcrypt from "bcrypt";
import { Student } from "../models/student.js";
import { Op } from "sequelize";

const router = express.Router();

// Route for student account creation
router.post("/create", async (req, res) => {
  const { username, password, email, ...otherFields } = req.body;

  try {
    // Check if username or email already exists
    const existingStudent = await Student.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingStudent) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new student
    const newStudent = await Student.create({
      username,
      password: hashedPassword,
      email,
      ...otherFields,
    });

    // Set the student in the session
    req.session.user = newStudent;

    // Return the student data in the response
    res.json({ user: newStudent });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
