import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const Semester = sequelize.define("Semester", {
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
