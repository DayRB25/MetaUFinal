import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const TakenClass = sequelize.define("TakenClass", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});
