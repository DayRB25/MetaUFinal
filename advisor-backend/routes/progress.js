import express from "express";
import { RequiredClass } from "../models/index.js";
import { TakenClass } from "../models/index.js";
import { Class } from "../models/index.js";

const numberElectivesForGraduation = 6;

const router = express.Router();

// Route for
router.post("/", async (req, res) => {
  const StudentId = req.body.StudentId;
  const SchoolId = req.body.SchoolId;
  try {
    // fetching all required classes
    const requiredClasses = await RequiredClass.findAll({
      where: { SchoolId },
      include: Class,
    });
    const requiredClassesData = requiredClasses.map(
      (requiredClass) => requiredClass.dataValues
    );
    const requiredClassesSet = new Set(
      requiredClassesData.map((requiredClass) => requiredClass.ClassId)
    );

    // fetching courses a student has taken
    const takenClasses = await TakenClass.findAll({
      where: { StudentId },
      include: Class,
    });
    const takenClassesData = takenClasses.map(
      (takenClass) => takenClass.dataValues
    );
    const takenClassesIDs = takenClasses.map(
      (takenClass) => takenClass.dataValues.ClassId
    );
    const takenClassesSet = new Set(takenClassesIDs);

    // identifying and counting the number of requirements that have been taken
    let takenClassesCount = 0;
    const currentAcademicProgress = requiredClassesData.map((requiredClass) => {
      if (takenClassesSet.has(requiredClass.ClassId)) {
        takenClassesCount += 1;
        return { ...requiredClass, taken: "true" };
      } else {
        return { ...requiredClass, taken: "false" };
      }
    });

    res.json({
      takenClassesCount,
      requiredClassesCount:
        requiredClassesSet.size + numberElectivesForGraduation,
      currentAcademicProgress,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
