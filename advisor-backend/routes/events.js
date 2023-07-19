import express from "express";
import { EventDetail } from "../models/event.js";
import { Op } from "sequelize";
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
  let queries = {};
  if (req.query.location) {
    let cities = [];
    let states = [];
    const locations = req.query.location;
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      const splitLocation = location.split(",");
      const city = splitLocation[0];
      const state = splitLocation[1];
      cities.push(city);
      states.push(state);
    }
    queries.city = {
      [Op.in]: cities,
    };
    queries.state = {
      [Op.in]: states,
    };
  }

  if (req.query.time_commitment) {
    const timeCommitment = req.query.time_commitment;
    queries.time_commitment = {
      [Op.lte]: timeCommitment,
    };
  }

  if (req.query.start_date && req.query.end_date) {
    const startDate = new Date(req.query.start_date);
    const endDate = new Date(req.query.end_date);
    queries.date = {
      [Op.between]: [startDate, endDate],
    };
  }
  try {
    const events = await EventDetail.findAll({
      where: {
        ...queries,
      },
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
    const event = await EventDetail.findOne({ where: { id: eventId } });
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
