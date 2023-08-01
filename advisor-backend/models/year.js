import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const Year = sequelize.define("Year", {
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});
