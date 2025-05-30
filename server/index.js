const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

// Serve static files from React
app.use(express.static(path.join(__dirname, "../client/build")));

// Fallback for React Router (serve frontend for non-API GET requests)
app.get("*", (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Mock data
const mockEVChargerData = [
  { date: "2025-05-01", sessions: 45, energy: 900, revenue: 180, peakHour: 28 },
  {
    date: "2025-05-02",
    sessions: 52,
    energy: 1040,
    revenue: 208,
    peakHour: 32,
  },
  { date: "2025-05-03", sessions: 38, energy: 760, revenue: 152, peakHour: 22 },
  { date: "2025-05-04", sessions: 41, energy: 820, revenue: 164, peakHour: 25 },
  {
    date: "2025-05-05",
    sessions: 67,
    energy: 1340,
    revenue: 268,
    peakHour: 42,
  },
  {
    date: "2025-05-06",
    sessions: 73,
    energy: 1460,
    revenue: 292,
    peakHour: 48,
  },
  {
    date: "2025-05-07",
    sessions: 58,
    energy: 1160,
    revenue: 232,
    peakHour: 35,
  },
  { date: "2025-05-08", sessions: 49, energy: 980, revenue: 196, peakHour: 31 },
  {
    date: "2025-05-09",
    sessions: 55,
    energy: 1100,
    revenue: 220,
    peakHour: 34,
  },
  {
    date: "2025-05-10",
    sessions: 61,
    energy: 1220,
    revenue: 244,
    peakHour: 38,
  },
  { date: "2025-05-11", sessions: 44, energy: 880, revenue: 176, peakHour: 27 },
  {
    date: "2025-05-12",
    sessions: 69,
    energy: 1380,
    revenue: 276,
    peakHour: 43,
  },
  {
    date: "2025-05-13",
    sessions: 71,
    energy: 1420,
    revenue: 284,
    peakHour: 45,
  },
  {
    date: "2025-05-14",
    sessions: 63,
    energy: 1260,
    revenue: 252,
    peakHour: 39,
  },
  {
    date: "2025-05-15",
    sessions: 57,
    energy: 1140,
    revenue: 228,
    peakHour: 36,
  },
];

const weeklyData = [
  { week: "Week 1", sessions: 343, energy: 6860, revenue: 1372 },
  { week: "Week 2", sessions: 385, energy: 7700, revenue: 1540 },
  { week: "Week 3", sessions: 260, energy: 5200, revenue: 1040 },
];

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "EV Charger API is running" });
});

// Get daily charging data
app.get("/api/charging-data/daily", (req, res) => {
  try {
    res.json({
      success: true,
      data: mockEVChargerData,
      message: "Daily charging data retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving daily data",
      error: error.message,
    });
  }
});

// Get weekly charging data
app.get("/api/charging-data/weekly", (req, res) => {
  try {
    res.json({
      success: true,
      data: weeklyData,
      message: "Weekly charging data retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving weekly data",
      error: error.message,
    });
  }
});

// Get summary statistics
app.get("/api/charging-data/summary/:view", (req, res) => {
  try {
    const { view } = req.params;
    let data, stats;

    if (view === "daily") {
      data = mockEVChargerData;
      const totalSessions = data.reduce((sum, day) => sum + day.sessions, 0);
      const totalEnergy = data.reduce((sum, day) => sum + day.energy, 0);
      const totalRevenue = data.reduce((sum, day) => sum + day.revenue, 0);
      const peakUsage = Math.max(...data.map((d) => d.sessions));

      stats = {
        totalSessions,
        totalEnergy,
        totalRevenue,
        peakUsage,
        avgSessions: Math.round(totalSessions / data.length),
        avgEnergy: Math.round(totalEnergy / data.length),
        avgRevenue: Math.round(totalRevenue / data.length),
      };
    } else if (view === "weekly") {
      data = weeklyData;
      const totalSessions = data.reduce((sum, week) => sum + week.sessions, 0);
      const totalEnergy = data.reduce((sum, week) => sum + week.energy, 0);
      const totalRevenue = data.reduce((sum, week) => sum + week.revenue, 0);
      const peakUsage = Math.max(...data.map((w) => w.sessions));

      stats = {
        totalSessions,
        totalEnergy,
        totalRevenue,
        peakUsage,
        avgSessions: Math.round(totalSessions / data.length),
        avgEnergy: Math.round(totalEnergy / data.length),
        avgRevenue: Math.round(totalRevenue / data.length),
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid view parameter. Use "daily" or "weekly"',
      });
    }

    res.json({
      success: true,
      data: stats,
      message: `${view} summary statistics retrieved successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving summary statistics",
      error: error.message,
    });
  }
});

// Get specific day/week data
app.get("/api/charging-data/specific/:view/:identifier", (req, res) => {
  try {
    const { view, identifier } = req.params;
    let data, result;

    if (view === "daily") {
      data = mockEVChargerData;
      result = data.find((item) => item.date === identifier);
    } else if (view === "weekly") {
      data = weeklyData;
      result = data.find((item) => item.week === identifier);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid view parameter. Use "daily" or "weekly"',
      });
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: `No data found for ${identifier}`,
      });
    }

    res.json({
      success: true,
      data: result,
      message: `Data for ${identifier} retrieved successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving specific data",
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 EV Charger API server running on port ${PORT}`);
  console.log(`📊 Dashboard API available at http://localhost:${PORT}/api`);
});
