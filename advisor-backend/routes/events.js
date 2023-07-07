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

router.get("/:eventId", async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await EventDetails.findByPk(eventId);
    if (!event) {
      res.status(404).json({ error: "Resource not found" });
      return;
    } else {
      res.json({ event });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
