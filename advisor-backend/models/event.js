import { DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export const EventDetail = sequelize.define("EventDetail", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  admin_firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  admin_lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  time_commitment: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  AdminId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});
