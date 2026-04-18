require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("./db");

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
