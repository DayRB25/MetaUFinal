import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const StudentEvent = sequelize.define("StudentEvent", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  hours: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
