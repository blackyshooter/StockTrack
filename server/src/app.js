const express = require("express");
const cors = require("cors");
require("dotenv").config();
const categoryRoutes = require("./routes/category.routes");
const authRoutes = require("./routes/auth.routes");
const itemRoutes = require("./routes/item.routes");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API StockTrack funcionando correctamente",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/items", itemRoutes);

module.exports = app;