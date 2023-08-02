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

// number of points available
const maxPoints = 12;

// general point
const pointValue = 1;

// weight definition
const propertyMatchWeight = 2;
const distanceMatchWeight = 2;

// matching point criteria
const highMatch = 9;
const mediumMatch = 5;

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

// endpoint for fetching volunteer events by page
router.get("/page/:page", async (req, res) => {
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

router.get("/recommended/:studentId", async (req, res) => {
  const studentId = req.params.studentId;

  try {
    // fetch student coords
    const student = await Student.findOne({ where: { id: studentId } });
    const studentLatitude = student.latitude;
    const studentLongitude = student.longitude;

    const query = `
    WITH EventScores AS (
      SELECT
      id,
      "AdminId",
      city,
        state,
        description,
        admin_firstname,
        admin_lastname,
        date,
        title,
        time,
        time_commitment,
        latitude,
        longitude,
        CASE
          WHEN ST_Distance(
           ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, ST_SetSRID(ST_MakePoint(${studentLongitude}, ${studentLatitude}), 4326)::geography) / 1000 < '${
      req.query.distance
    }' THEN ${propertyMatchWeight * distanceMatchWeight * pointValue}
          ELSE 0
        END AS distance_score,
        CASE
          WHEN ST_Distance(
           ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, ST_SetSRID(ST_MakePoint(${studentLongitude}, ${studentLatitude}), 4326)::geography) / 1000 < '${
      req.query.distance
    }' THEN (1 - (CAST((ST_Distance(
            ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, ST_SetSRID(ST_MakePoint(${studentLongitude}, ${studentLatitude}), 4326)::geography) / 1000) AS float) / CAST(${
      req.query.distance
    } AS float)))
          ELSE 0
        END AS bonus_proximity_score,
        CASE
          WHEN (time >= '${req.query.start_time}' AND time < '${
      req.query.end_time
    }') THEN ${propertyMatchWeight * pointValue}
          WHEN (time < '${req.query.start_time}' AND '${
      req.query.start_time
    }' - time <= interval '1 hour') THEN (1-((EXTRACT(EPOCH FROM ('${
      req.query.start_time
    }' - time)) / 60::integer) / CAST(60 as float)))
          WHEN (time >= '${req.query.end_time}' AND time - '${
      req.query.end_time
    }' <= interval '1 hour') THEN (1-((EXTRACT(EPOCH FROM (time - '${
      req.query.end_time
    }')) / 60::integer) / CAST(60 as float)))
          ELSE 0
        END AS starttime_score,
        CASE
          WHEN time_commitment <= '${req.query.time_commitment}' THEN ${
      propertyMatchWeight * pointValue
    }
          WHEN (time_commitment > '${
            req.query.time_commitment
          }' AND time_commitment - '${
      req.query.time_commitment
    }' <= 60) THEN (1 - (CAST((time_commitment - '${
      req.query.time_commitment
    }') AS float) / CAST(60 AS float)))
          ELSE 0
        END AS commitment_score,
        CASE
          WHEN date >= '${req.query.start_date}' and date < '${
      req.query.end_date
    }' THEN ${propertyMatchWeight * pointValue}
          ELSE 0
        END AS date_score
      FROM "public"."EventDetails"
      WHERE date > CURRENT_DATE
    ),

    SignupCountByEvent AS (
      SELECT "EventDetailId", COUNT(*) AS signup_count
      FROM "public"."StudentSignups"
      GROUP BY "EventDetailId"
    ),

    AttendanceCountByEvent AS (
      SELECT "EventDetailId", COUNT(*) AS attendance_count
      FROM "public"."StudentEvents"
      GROUP BY "EventDetailId"
    ),

    TurnoutDetailsByEvent AS (
      SELECT s."EventDetailId", s.signup_count, a.attendance_count
      FROM SignupCountByEvent AS s
      LEFT JOIN AttendanceCountByEvent AS a
      ON s."EventDetailId" = a."EventDetailId"
    ),

    TurnoutDetailsAllPastEvents AS (
      SELECT ed.id AS "EventDetailId", COALESCE(t.signup_count, 0) AS signup_count, COALESCE(t.attendance_count, 0) AS attendance_count
      FROM "public"."EventDetails" AS ed
      LEFT JOIN TurnoutDetailsByEvent AS t
      ON ed."id" = t."EventDetailId"
      WHERE ed.date < CURRENT_DATE
    ),
  
    TurnoutPercentageByEvent AS (
      SELECT "EventDetailId", attendance_count, signup_count, 
      CASE 
        WHEN (signup_count = 0 OR attendance_count = 0) THEN 0
        ELSE ((CAST(attendance_count AS float))/(CAST(signup_count AS float))) * 100
      END AS turnout_percentage
      FROM TurnoutDetailsAllPastEvents
    ),
  
    AverageTurnoutPercentage AS (
      SELECT AVG(turnout_percentage) AS avg_turnout_pcg
      FROM TurnoutPercentageByEvent
    ), 
  
    AverageTurnoutPercentageByAdmin AS (
      SELECT e."AdminId",
      AVG(t.turnout_percentage) AS avg_admin_turnout_pcg
      FROM "public"."EventDetails" AS e
      LEFT JOIN TurnoutPercentageByEvent AS t
      ON e.id = t."EventDetailId"
      GROUP BY e."AdminId"
    ),

    MaxAverageTurnout AS (
      SELECT MAX(avg_admin_turnout_pcg) as max_avg_turnout_pcg 
      FROM AverageTurnoutPercentageByAdmin
    ),

    MinAverageTurnout AS (
      SELECT MIN(avg_admin_turnout_pcg) as min_avg_turnout_pcg 
      FROM AverageTurnoutPercentageByAdmin
    )
  
    SELECT
    id,
    e."AdminId" as AdminId,
    city,
      state,
      description,
      admin_firstname,
      admin_lastname,
      date,
      title,
      latitude,
      longitude,
      bonus_proximity_score,
      (SELECT avg_turnout_pcg FROM AverageTurnoutPercentage) as avg_turnout_pcg,
      avg_admin_turnout_pcg,
      CASE
          WHEN (avg_admin_turnout_pcg IS NOT NULL and avg_admin_turnout_pcg > (SELECT avg_turnout_pcg FROM AverageTurnoutPercentage)) THEN (1 - (CAST(((SELECT max_avg_turnout_pcg FROM MaxAverageTurnout) - avg_admin_turnout_pcg) AS float) / CAST(((SELECT max_avg_turnout_pcg FROM MaxAverageTurnout) - (SELECT avg_turnout_pcg FROM AverageTurnoutPercentage)) AS float)))
          WHEN (avg_admin_turnout_pcg IS NOT NULL and avg_admin_turnout_pcg < (SELECT avg_turnout_pcg FROM AverageTurnoutPercentage)) THEN (-1 + (CAST((avg_admin_turnout_pcg - (SELECT min_avg_turnout_pcg FROM MinAverageTurnout)) AS float) / CAST(((SELECT avg_turnout_pcg FROM AverageTurnoutPercentage) - (SELECT min_avg_turnout_pcg FROM MinAverageTurnout)) AS float)))
          ELSE 0
        END AS admin_turnout_bonus,
      (distance_score + starttime_score + commitment_score + date_score + bonus_proximity_score + (
        CASE
          WHEN (avg_admin_turnout_pcg IS NOT NULL and avg_admin_turnout_pcg > (SELECT avg_turnout_pcg FROM AverageTurnoutPercentage)) THEN (1 - (CAST(((SELECT max_avg_turnout_pcg FROM MaxAverageTurnout) - avg_admin_turnout_pcg) AS float) / CAST(((SELECT max_avg_turnout_pcg FROM MaxAverageTurnout) - (SELECT avg_turnout_pcg FROM AverageTurnoutPercentage)) AS float)))
          WHEN (avg_admin_turnout_pcg IS NOT NULL and avg_admin_turnout_pcg < (SELECT avg_turnout_pcg FROM AverageTurnoutPercentage)) THEN (-1 + (CAST((avg_admin_turnout_pcg - (SELECT min_avg_turnout_pcg FROM MinAverageTurnout)) AS float) / CAST(((SELECT avg_turnout_pcg FROM AverageTurnoutPercentage) - (SELECT min_avg_turnout_pcg FROM MinAverageTurnout)) AS float)))
          ELSE 0
        END
      )) AS total_score
    FROM EventScores AS e
    LEFT JOIN AverageTurnoutPercentageByAdmin AS a
    ON e."AdminId" = a."AdminId"
    ORDER BY total_score DESC
    LIMIT ${recommendationLimit};


    `;

    const events = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
      model: EventDetail,
      mapToModel: true,
    });

    const eventsWithMatchTags = events.map((event) => {
      const eventData = event.dataValues;
      if (eventData.total_score >= highMatch) {
        return { ...eventData, match: "high" };
      } else if (
        eventData.total_score >= mediumMatch &&
        eventData.total_score < highMatch
      ) {
        return { ...eventData, match: "medium" };
      } else {
        return { ...eventData, match: "low" };
      }
    });

    return res.json({ events: eventsWithMatchTags });
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
