import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const StudentSignup = sequelize.define("StudentSignup", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});
