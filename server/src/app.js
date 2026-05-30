const express = require("express");
const cors = require("cors");
require("dotenv").config();
const categoryRoutes = require("./routes/category.routes");
const authRoutes = require("./routes/auth.routes");
const itemRoutes = require("./routes/item.routes");
const branchRoutes = require("./routes/branch.routes");
const stockRoutes = require("./routes/stock.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
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
app.use("/api/branches", branchRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/dashboard", dashboardRoutes);

module.exports = app;