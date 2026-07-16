const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

// GET /api/news?q=india
// Proxies NewsData.io so the API key never has to live in frontend JS.
router.get("/", async (req, res) => {
  const query = req.query.q || "india";
  const apiKey = process.env.NEWSDATA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ message: "News API key is not configured on the server" });
  }

  const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=${encodeURIComponent(
    query
  )}&language=en`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({ message: "Failed to fetch news from upstream provider" });
  }
});

module.exports = router;
