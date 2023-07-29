import "dotenv/config";
import cors from "cors";
import express from "express";
import session from "express-session";
import morgan from "morgan";
import { sequelize } from "./database.js";
import SequelizeStoreInit from "connect-session-sequelize";
import studentRoute from "./routes/students.js";
import eventRoute from "./routes/events.js";
import studentEventRoute from "./routes/studentevents.js";
import studentSignupRoute from "./routes/studentsignups.js";
import courseScheduleRoute from "./routes/schedule.js";
import {
  Prerequisite,
  TakenClass,
  Class,
  RequiredClass,
  School,
} from "./models/index.js";
import mapsRoute from "./routes/maps.js";

const port = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json()); // Middleware for parsing JSON bodies from HTTP requests
app.use(morgan());

const SequelizeStore = SequelizeStoreInit(session.Store);
const sessionStore = new SequelizeStore({
  db: sequelize,
});

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      sameSite: false,
      secure: false,
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year in milliseconds
    },
  })
);
sessionStore.sync();

app.use("/api/student", studentRoute);
app.use("/api/events", eventRoute);
app.use("/api/student-event", studentEventRoute);
app.use("/api/student-signup", studentSignupRoute);
app.use("/api/schedule", courseScheduleRoute);
app.use("/api/maps", mapsRoute);

sequelize
  .sync({ alter: true })
  .then(() => {
    app.listen(port, () => {
      console.log(`App is listening on PORT: ${port}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connet to the database", error);
  });
