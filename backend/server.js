const express = require("express");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.send("Learning Dashboard API is running!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});