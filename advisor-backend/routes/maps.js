// library imports
import express from "express";
import axios from "axios";

const router = express.Router();

// encode image into base 64
function image_encode(data) {
  return new Buffer(data).toString("base64");
}

// Route for fetching map from BingAPI, use "arraybuffer" to handle transfer of raw binary data
router.get("/:latitude/:longitude", async (req, res) => {
  const latitude = req.params.latitude;
  const longitude = req.params.longitude;

  try {
    const response = await axios.get(
      `https://dev.virtualearth.net/REST/V1/Imagery/Map/Road/${latitude},${longitude}/16?mapSize=600%2C600&format=png&pushpin=${latitude},${longitude};64&key=${process.env.LOC_KEY}`,
      {
        responseType: "arraybuffer",
      }
    );
    // prepend data URI scheme header
    res.json({
      response: "data:image/png;base64," + image_encode(response.data),
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
