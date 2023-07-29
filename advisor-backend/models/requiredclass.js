import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const RequiredClass = sequelize.define("RequiredClass", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
