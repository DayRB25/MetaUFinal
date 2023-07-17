import express from "express";
import { EventDetail } from "../models/event.js";
// number of elements to be displayed on the page
const pageLimit = 8;
const router = express.Router();

router.get("/page-count", async (req, res) => {
  try {
    const count = await EventDetail.count();
    const pageCount = Math.ceil(count / pageLimit);
    res.status(200).json({ pageCount });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:page", async (req, res) => {
  const page = req.params.page;
  try {
    const events = await EventDetail.findAll({
      limit: pageLimit,
      offset: (page - 1) * pageLimit,
    });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:eventId", async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await EventDetail.findByPk(eventId);
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
