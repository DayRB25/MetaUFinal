import { Sequelize } from "sequelize";
import "dotenv/config";

export const sequelize = new Sequelize(
  rocess.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: "localhost",
    dialect: "postgres",
  }
);
