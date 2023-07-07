import express from "express";
import bcrypt from "bcrypt";
import { Student } from "../models/student.js";
import { Op } from "sequelize";

const router = express.Router();

export default router;
