import express from "express";
import { EventDetails } from "../models/event.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const events = await EventDetails.findAll();
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
