// library imports
import express from "express";
import bcrypt from "bcrypt";
import axios from "axios";
import { Op } from "sequelize";
// model imports
import { Student } from "../models/student.js";
// helper imports
import { abbreviationLookup } from "../abbreviationLookup.js";

const router = express.Router();

// Route for student login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the student by username
    const student = await Student.findOne({ where: { username } });

    if (!student) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Compare the password
    const isValidPassword = await bcrypt.compare(password, student.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Set the student in the session
    req.session.user = student;

    // Return the student data in the response
    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Route for student account creation
router.post("/create", async (req, res) => {
  const {
    username,
    password,
    email,
    firstname,
    lastname,
    year,
    city,
    state,
    address,
  } = req.body;

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

    // get lat and long from address
    const stateAbbreviation = abbreviationLookup[state];
    const locationInfo = await axios.get(
      `https://dev.virtualearth.net/REST/v1/Locations/US/${stateAbbreviation}/${city}/${encodeURIComponent(
        address
      )}?key=${process.env.LOC_KEY}`
    );
    const locationGeoPoints =
      locationInfo.data.resourceSets[0].resources[0].geocodePoints[1]
        .coordinates;
    const latitude = locationGeoPoints[0];
    const longitude = locationGeoPoints[1];

    // Create a new student
    const newStudent = await Student.create({
      username,
      password: hashedPassword,
      email,
      firstname,
      lastname,
      year,
      city,
      state,
      address,
      latitude,
      longitude,
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
