import express from "express";
import { EventDetail } from "../models/event.js";
import { Op } from "sequelize";
// number of elements to be displayed on the page
const pageLimit = 8;
const router = express.Router();

const parseAndCreateLocationQuery = (query) => {
  let cities = [];
  let states = [];
  const locations = query;
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    const [city, state] = location.split(",");
    cities.push(city);
    states.push(state);
  }

  return {
    city: {
      [Op.in]: cities,
    },
    state: {
      [Op.in]: states,
    },
  };
};

const parseAndCreateTimeCommitmentQuery = (query) => {
  const timeCommitment = query;
  return {
    time_commitment: {
      [Op.lte]: timeCommitment,
    },
  };
};

const parseAndCreateDateRangeQuery = (startDate, endDate) => {
  return {
    date: {
      [Op.between]: [startDate, endDate],
    },
  };
};

const parseAndCreateTimeRangeQuery = (startTime, endTime) => {
  return {
    time: {
      [Op.between]: [startTime, endTime],
    },
  };
};

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
    queries = {
      ...queries,
      ...parseAndCreateLocationQuery(req.query.location),
    };
  }

  if (req.query.time_commitment) {
    queries = {
      ...queries,
      ...parseAndCreateTimeCommitmentQuery(req.query.time_commitment),
    };
  }

  if (req.query.start_date && req.query.end_date) {
    const startDate = new Date(req.query.start_date);
    const endDate = new Date(req.query.end_date);
    queries = {
      ...queries,
      ...parseAndCreateDateRangeQuery(startDate, endDate),
    };
  }

  if (req.query.start_time && req.query.end_time) {
    const startTime = req.query.start_time;
    const endTime = req.query.end_time;
    queries = {
      ...queries,
      ...parseAndCreateTimeRangeQuery(startTime, endTime),
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
