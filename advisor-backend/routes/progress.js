// library imports
import express from "express";
// model imports
import { RequiredClass } from "../models/index.js";
import { TakenClass } from "../models/index.js";
import { Class } from "../models/index.js";

const numberElectivesForGraduation = 6;

const router = express.Router();

// endpoint for fetching student's graduation progress
router.post("/", async (req, res) => {
  const StudentId = req.body.StudentId;
  const SchoolId = req.body.SchoolId;
  try {
    // fetching all required classes and isolating relevant data
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

    // fetching courses a student has taken and isolating relevant data
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

    // identifying the number of electives student has taken (non-required courses)
    const electivesTaken = takenClassesData.filter(
      (takenClass) => !requiredClassesSet.has(takenClass.ClassId)
    );

    const numberElectives = electivesTaken.length;
    // handles the case that a student has taken more than the required number of electives
    takenClassesCount += Math.min(
      numberElectivesForGraduation,
      numberElectives
    );
    const electivesToAdd = Math.min(
      numberElectivesForGraduation,
      numberElectives
    );
    // add all up to 6
    for (let i = 0; i < electivesToAdd; i++) {
      const elective = electivesTaken[i];
      currentAcademicProgress.push({ ...elective, taken: "true" });
    }

    if (numberElectives < numberElectivesForGraduation) {
      for (
        let i = numberElectives + 1;
        i <= numberElectivesForGraduation;
        i++
      ) {
        const dummyElective = {
          Class: { name: `Elective ${i}` },
          taken: "false",
        };
        currentAcademicProgress.push(dummyElective);
      }
    }

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
