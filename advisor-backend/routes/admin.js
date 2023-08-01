import express from "express";
import { Admin } from "../models/index.js";

const router = express.Router();

// Route for admin info
router.get("/:adminId", async (req, res) => {
  const adminId = req.params.adminId;

  try {
    const admin = await Admin.findOne({
      where: { id: adminId },
      attributes: ["firstname", "lastname", "email"],
    });
    res.status(200).json({ admin });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
