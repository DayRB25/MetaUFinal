import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const Prerequisite = sequelize.define("Prerequisite", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});
