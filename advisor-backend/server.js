const port = process.env.PORT || 5000;
import express from "express";
import session from "express-session";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import { sequelize } from "./database.js";
import studentRoute from "./routes/students.js";
import eventRoute from "./routes/events.js";
import SequelizeStoreInit from "connect-session-sequelize";

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
