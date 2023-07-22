import express from "express";
import { EventDetail } from "../models/event.js";
import { Op } from "sequelize";
import { sequelize } from "../database.js";
import Sequelize from "sequelize";
import { Student } from "../models/index.js";
// number of elements to be displayed on the page
const pageLimit = 8;
// number of elements to be recommended
const recommendationLimit = 8;

const router = express.Router();

const parseAndCreateLocationQueryString = (query) => {
  let queryString = "(";
  const locations = query;
  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    const [city, state] = location.split(",");
    if (i === locations.length - 1) {
      queryString += `('${city}', '${state}'))`;
    } else {
      queryString += `('${city}', '${state}'),`;
    }
  }
  return queryString;
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

// TO DO IN DIFFERENT COMMIT: ADJUST THIS ROUTE BY REMOVING parseAndCreate methods..., REVERT BACK TO GENERAL PAGINATED QUERIES
router.get("/page/:page", async (req, res) => {
  const page = req.params.page;
  let queries = {};
  if (req.query.location) {
    queries = {
      ...queries,
      ...parseAndCreateLocationQueryString(req.query.location),
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

router.get("/recommended", async (req, res) => {
  const studentId = req.body.studentId;

  try {
    // fetch student coords
    const student = await Student.findOne({ where: { id: studentId } });
    const studentLatitude = student.latitude;
    const studentLongitude = student.longitude;

    const query = `
    WITH EventScores AS (
      SELECT
      id,
      city,
        state,
        description,
        admin,
        date,
        title,
        time,
        time_commitment,
        latitude,
        longitude,
        CASE
          WHEN ST_Distance(
           ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, ST_SetSRID(ST_MakePoint(${studentLongitude}, ${studentLatitude}), 4326)::geography) / 1000 < '${req.query.distance}' THEN 4
          ELSE 0
        END AS distance_score,
        CASE
          WHEN ST_Distance(
           ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, ST_SetSRID(ST_MakePoint(${studentLongitude}, ${studentLatitude}), 4326)::geography) / 1000 < '${req.query.distance}' THEN (1 - (CAST((ST_Distance(
            ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, ST_SetSRID(ST_MakePoint(${studentLongitude}, ${studentLatitude}), 4326)::geography) / 1000) AS float) / CAST(${req.query.distance} AS float)))
          ELSE 0
        END AS bonus_proximity_score,
        CASE
          WHEN (time >= '${req.query.start_time}' AND time < '${req.query.end_time}') THEN 2
          WHEN (time < '${req.query.start_time}' AND '${req.query.start_time}' - time <= interval '1 hour') THEN (1-((EXTRACT(EPOCH FROM ('${req.query.start_time}' - time)) / 60::integer) / CAST(60 as float)))
          WHEN (time >= '${req.query.end_time}' AND time - '${req.query.end_time}' <= interval '1 hour') THEN (1-((EXTRACT(EPOCH FROM (time - '${req.query.end_time}')) / 60::integer) / CAST(60 as float)))
          ELSE 0
        END AS starttime_score,
        CASE
          WHEN time_commitment <= '${req.query.time_commitment}' THEN 2
          WHEN (time_commitment > '${req.query.time_commitment}' AND time_commitment - '${req.query.time_commitment}' <= 60) THEN (1 - (CAST((time_commitment - '${req.query.time_commitment}') AS float) / CAST(60 AS float)))
          ELSE 0
        END AS commitment_score,
        CASE
          WHEN date >= '${req.query.start_date}' and date < '${req.query.end_date}' THEN 2
          ELSE 0
        END AS date_score
      FROM "public"."EventDetails"
      WHERE date > CURRENT_DATE
    )
    
    SELECT
    id,
    city,
      state,
      description,
      admin,
      date,
      title,
      bonus_proximity_score,
      (distance_score + starttime_score + commitment_score + date_score + bonus_proximity_score) AS total_score
    FROM EventScores
    ORDER BY total_score DESC
    LIMIT ${recommendationLimit};
    `;

    const events = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
      model: EventDetail,
      mapToModel: true,
    });

    return res.json({ events });
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
