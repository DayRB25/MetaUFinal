import express from "express";
import { Class } from "../models/index.js";
import { Prerequisite } from "../models/index.js";

const router = express.Router();

// Route for student schedule creation
router.post("/create", async (req, res) => {
  const SchoolId = req.body.SchoolId;

  try {
    const schoolClasses = await Class.findAll({ where: { SchoolId } });
    // isolating relevant data from response
    const schoolClassesData = schoolClasses.map(
      (schoolClass) => schoolClass.dataValues
    );

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
      const dependentClassesData = dependentClasses.map(
        (dependentClass) => dependentClass.dataValues
      );

      // add all classes current class is a pre-req for to adj list
      for (let j = 0; j < dependentClassesData.length; j++) {
        const dependentClass = dependentClasses[j];
        adjList[schoolClass.id].push(dependentClass.PostreqId);
      }
    }

    res.json({ adjList });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
