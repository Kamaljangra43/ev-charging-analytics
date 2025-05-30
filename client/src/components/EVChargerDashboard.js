"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  Tooltip,
  Cell,
} from "recharts";
import { Zap, TrendingUp, DollarSign, Clock } from "lucide-react";
import { chargingDataAPI } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

// Enhanced Custom Tooltip with detailed data
const EcoTooltip = ({ active, payload, label, labelFormatter }) => {
  if (active && payload && payload.length) {
    const formattedLabel = labelFormatter ? labelFormatter(label) : label;
    const data = payload[0]?.payload;

    return (
      <div className="eco-tooltip">
        <p className="font-semibold mb-3 eco-title">{formattedLabel}</p>
        {data && (
          <div className="text-sm">
            <div className="flex items-center justify-between mb-2 gap-4">
              <span className="eco-text-muted">Sessions:</span>
              <span className="font-semibold" style={{ color: "#22c55e" }}>
                {data.sessions}
              </span>
              <span className="eco-text-muted">Energy:</span>
              <span className="font-semibold" style={{ color: "#0ea5e9" }}>
                {data.energy} kWh
              </span>
              <span className="eco-text-muted">Revenue:</span>
              <span className="font-semibold" style={{ color: "#f59e0b" }}>
                ${data.revenue}
              </span>
              {data.peakHour && (
                <>
                  <span className="eco-text-muted">Peak Hours:</span>
                  <span className="font-semibold" style={{ color: "#ef4444" }}>
                    {data.peakHour} sessions
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Simple tooltip for other charts
const SimpleTooltip = ({ active, payload, label, labelFormatter }) => {
  if (active && payload && payload.length) {
    const formattedLabel = labelFormatter ? labelFormatter(label) : label;
    return (
      <div className="eco-tooltip">
        <p className="font-semibold mb-2 eco-title">{formattedLabel}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="mb-1 text-sm"
            style={{ color: entry.color }}
          >
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function EVChargerDashboard() {
  const [chartType, setChartType] = useState("bar");
  const [dataView, setDataView] = useState("daily");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [currentData, setCurrentData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalSessions: 0,
    totalEnergy: 0,
    totalRevenue: 0,
    peakUsage: 0,
    avgSessions: 0,
    avgEnergy: 0,
    avgRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isViewSwitching, setIsViewSwitching] = useState(false);

  const dateKey = dataView === "daily" ? "date" : "week";

  // Fetch initial data only once
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [dataResponse, summaryResponse] = await Promise.all([
          chargingDataAPI.getDailyData(),
          chargingDataAPI.getSummaryStats("daily"),
        ]);

        setCurrentData(dataResponse.data);
        setSummaryStats(summaryResponse.data);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        console.error("Error fetching initial data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Update summary stats when data is selected
  useEffect(() => {
    if (selectedData) {
      setSummaryStats({
        totalSessions: selectedData.sessions,
        totalEnergy: selectedData.energy,
        totalRevenue: selectedData.revenue,
        peakUsage: selectedData.peakHour || selectedData.sessions,
        avgSessions: selectedData.sessions,
        avgEnergy: selectedData.energy,
        avgRevenue: selectedData.revenue,
      });
    } else {
      // Fetch summary stats for current view
      const fetchSummary = async () => {
        try {
          const response = await chargingDataAPI.getSummaryStats(dataView);
          setSummaryStats(response.data);
        } catch (err) {
          console.error("Error fetching summary:", err);
        }
      };
      fetchSummary();
    }
  }, [selectedData, dataView]);

  const formatTooltipLabel = (value) => {
    if (dataView === "daily") {
      return new Date(value).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return value;
  };

  const handleChartClick = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedData = data.activePayload[0].payload;
      setSelectedData(clickedData);
    }
  };

  const handleChartHover = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const hoveredData = data.activePayload[0].payload;
      setSelectedData(hoveredData);
    }
  };

  const resetSelection = () => {
    setSelectedData(null);
    setHoveredIndex(null);
  };

  const handleDataViewChange = async (newView) => {
    if (newView === dataView) return; // Prevent unnecessary updates

    try {
      // Store current scroll position
      const currentScrollY = window.scrollY;

      setIsViewSwitching(true);
      setError(null);
      setSelectedData(null);
      setHoveredIndex(null);

      // Fetch new data without page reload
      let dataResponse, summaryResponse;

      if (newView === "daily") {
        [dataResponse, summaryResponse] = await Promise.all([
          chargingDataAPI.getDailyData(),
          chargingDataAPI.getSummaryStats("daily"),
        ]);
      } else {
        [dataResponse, summaryResponse] = await Promise.all([
          chargingDataAPI.getWeeklyData(),
          chargingDataAPI.getSummaryStats("weekly"),
        ]);
      }

      setCurrentData(dataResponse.data);
      setSummaryStats(summaryResponse.data);
      setDataView(newView);

      // Restore scroll position after a brief delay to ensure DOM updates
      setTimeout(() => {
        window.scrollTo(0, currentScrollY);
      }, 50);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
      console.error("Error switching data view:", err);
    } finally {
      setIsViewSwitching(false);
    }
  };

  const renderChart = () => {
    const commonProps = {
      data: currentData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart
            {...commonProps}
            onClick={handleChartClick}
            onMouseMove={handleChartHover}
            onMouseLeave={resetSelection}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={dateKey}
              tickFormatter={(value) =>
                dataView === "daily"
                  ? new Date(value).getDate().toString()
                  : value
              }
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              content={<SimpleTooltip labelFormatter={formatTooltipLabel} />}
            />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={{ fill: "#22c55e", strokeWidth: 2, r: 3 }}
              activeDot={{
                r: 5,
                stroke: "#22c55e",
                strokeWidth: 2,
                fill: "white",
              }}
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart
            {...commonProps}
            onClick={handleChartClick}
            onMouseMove={handleChartHover}
            onMouseLeave={resetSelection}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={dateKey}
              tickFormatter={(value) =>
                dataView === "daily"
                  ? new Date(value).getDate().toString()
                  : value
              }
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              content={<SimpleTooltip labelFormatter={formatTooltipLabel} />}
            />
            <Area
              type="monotone"
              dataKey="sessions"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.2}
            />
          </AreaChart>
        );

      default:
        return (
          <BarChart
            {...commonProps}
            cursor="default"
            onClick={handleChartClick}
            onMouseMove={(state) => {
              if (state && state.activeTooltipIndex !== undefined) {
                setHoveredIndex(state.activeTooltipIndex);
                const hoveredData = currentData[state.activeTooltipIndex];
                setSelectedData(hoveredData);
              }
            }}
            onMouseLeave={resetSelection}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={dateKey}
              tickFormatter={(value) =>
                dataView === "daily"
                  ? new Date(value).getDate().toString()
                  : value
              }
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              content={<EcoTooltip labelFormatter={formatTooltipLabel} />}
              cursor={{ fill: "transparent" }}
            />
            <Bar
              dataKey="sessions"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            >
              {currentData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={hoveredIndex === index ? "#16a34a" : "#22c55e"}
                  style={{
                    transition: "fill 0.2s ease",
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  // Get the appropriate data for the peak usage chart
  const getPeakUsageData = () => {
    if (dataView === "daily") {
      return currentData.slice(-7);
    } else {
      // For weekly data, we need to add peakHour data since it's not in the original weekly data
      return currentData.map((week, index) => ({
        ...week,
        peakHour: Math.floor(week.sessions * 0.6), // Simulate peak hours as 60% of total sessions
      }));
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "12px 16px" }}>
      <div className="container">
        {/* Clean Header */}
        <div className="text-center" style={{ padding: "48px 0" }}>
          <h1 className="text-4xl font-semibold eco-title mb-4">
            EV Charging Analytics
          </h1>
          <p
            className="text-lg eco-subtitle"
            style={{ maxWidth: "500px", margin: "0 auto" }}
          >
            Clean energy monitoring with sustainable insights
          </p>
        </div>

        {/* Clean Summary Cards - Compact Row Layout */}
        <div className="summary-cards-row mb-12">
          {/* Card: Total Sessions */}
          <div className="summary-card eco-card-green">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h6 className="text-green-100 text-xs font-medium mb-1">
                    {selectedData ? "Selected" : "Total"} Sessions
                  </h6>
                  <h2 className="text-2xl font-semibold">
                    {summaryStats.totalSessions}
                  </h2>
                </div>
                <div className="eco-icon-small">
                  <Zap size={16} />
                </div>
              </div>
              <small className="text-green-100 text-xs">
                {selectedData
                  ? `On ${selectedData.date || selectedData.week}`
                  : `${summaryStats.avgSessions} avg/${
                      dataView === "daily" ? "day" : "week"
                    }`}
              </small>
            </div>
          </div>

          {/* Card: Total Energy */}
          <div className="summary-card eco-card-blue">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h6 className="text-blue-100 text-xs font-medium mb-1">
                    {selectedData ? "Selected" : "Total"} Energy
                  </h6>
                  <h2 className="text-2xl font-semibold">
                    {summaryStats.totalEnergy.toLocaleString()}
                  </h2>
                </div>
                <div className="eco-icon-small">
                  <TrendingUp size={16} />
                </div>
              </div>
              <small className="text-blue-100 text-xs">
                {selectedData
                  ? `kWh delivered`
                  : `${summaryStats.avgEnergy} kWh avg/${
                      dataView === "daily" ? "day" : "week"
                    }`}
              </small>
            </div>
          </div>

          {/* Card: Total Revenue */}
          <div className="summary-card eco-card-amber">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h6 className="text-amber-100 text-xs font-medium mb-1">
                    {selectedData ? "Selected" : "Total"} Revenue
                  </h6>
                  <h2 className="text-2xl font-semibold">
                    ${summaryStats.totalRevenue}
                  </h2>
                </div>
                <div className="eco-icon-small">
                  <DollarSign size={16} />
                </div>
              </div>
              <small className="text-amber-100 text-xs">
                {selectedData
                  ? `revenue generated`
                  : `$${summaryStats.avgRevenue} avg/${
                      dataView === "daily" ? "day" : "week"
                    }`}
              </small>
            </div>
          </div>

          {/* Card: Peak Usage */}
          <div className="summary-card eco-card-green">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h6 className="text-green-100 text-xs font-medium mb-1">
                    {selectedData ? "Peak Hours" : "Peak Usage"}
                  </h6>
                  <h2 className="text-2xl font-semibold">
                    {summaryStats.peakUsage}
                  </h2>
                </div>
                <div className="eco-icon-small">
                  <Clock size={16} />
                </div>
              </div>
              <small className="text-green-100 text-xs">
                {selectedData
                  ? `peak hour sessions`
                  : `sessions in one ${dataView === "daily" ? "day" : "week"}`}
              </small>
            </div>
          </div>
        </div>

        {/* Clean Main Chart */}
        <div className="eco-card mb-12">
          <div className="eco-header p-6">
            <div
              className="flex flex-col lg:flex-row justify-between items-start lg:items-center"
              style={{ gap: "16px" }}
            >
              <div>
                <h5 className="text-xl font-semibold eco-title mb-1">
                  Charging Activity
                </h5>
                <p className="eco-text-muted text-sm">
                  {dataView === "daily" ? "Daily" : "Weekly"} session patterns
                  {selectedData && (
                    <span style={{ color: "#0ea5e9", marginLeft: "8px" }}>
                      (Showing: {selectedData.date || selectedData.week})
                    </span>
                  )}
                  {isViewSwitching && (
                    <span style={{ color: "#f59e0b", marginLeft: "8px" }}>
                      (Loading...)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col" style={{ gap: "12px" }}>
                {/* Clean Data View Toggle */}
                <div className="eco-toggle-group">
                  <button
                    className={`eco-toggle ${
                      dataView === "daily" ? "active" : ""
                    }`}
                    onClick={() => handleDataViewChange("daily")}
                    disabled={isViewSwitching}
                  >
                    Daily
                  </button>
                  <button
                    className={`eco-toggle ${
                      dataView === "weekly" ? "active" : ""
                    }`}
                    onClick={() => handleDataViewChange("weekly")}
                    disabled={isViewSwitching}
                  >
                    Weekly
                  </button>
                </div>

                {/* Clean Chart Type Toggle */}
                <div className="eco-toggle-group">
                  <button
                    className={`eco-toggle ${
                      chartType === "bar" ? "active" : ""
                    }`}
                    onClick={() => setChartType("bar")}
                  >
                    Bar
                  </button>
                  <button
                    className={`eco-toggle ${
                      chartType === "line" ? "active" : ""
                    }`}
                    onClick={() => setChartType("line")}
                  >
                    Line
                  </button>
                  <button
                    className={`eco-toggle ${
                      chartType === "area" ? "active" : ""
                    }`}
                    onClick={() => setChartType("area")}
                  >
                    Area
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="eco-chart">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clean Additional Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 mb-12">
          {/* Energy vs Sessions */}
          <div className="eco-card">
            <div className="eco-header-blue p-6">
              <h5 className="text-xl font-semibold eco-title mb-1">
                Energy & Sessions
              </h5>
              <p className="eco-text-muted text-sm">
                Last {dataView === "daily" ? "7 days" : "3 weeks"} comparison
              </p>
            </div>
            <div className="eco-chart-small">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    dataView === "daily" ? currentData.slice(-7) : currentData
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey={dateKey}
                    tickFormatter={(value) =>
                      dataView === "daily"
                        ? new Date(value).getDate().toString()
                        : value
                    }
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis yAxisId="left" stroke="#22c55e" fontSize={12} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#0ea5e9"
                    fontSize={12}
                  />
                  <Tooltip
                    content={
                      <SimpleTooltip labelFormatter={formatTooltipLabel} />
                    }
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="sessions"
                    fill="#22c55e"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="energy"
                    fill="#0ea5e9"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak Hours Analysis */}
          <div className="eco-card">
            <div className="eco-header-amber p-6">
              <h5 className="text-xl font-semibold eco-title mb-1">
                Peak Usage Patterns
              </h5>
              <p className="eco-text-muted text-sm">
                <span
                  className="flex items-center"
                  style={{ display: "inline-flex" }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#22c55e",
                      borderRadius: "50%",
                      marginRight: "4px",
                    }}
                  ></span>
                  Regular sessions
                </span>
                <span style={{ margin: "0 8px" }}>|</span>
                <span
                  className="flex items-center"
                  style={{ display: "inline-flex" }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#f59e0b",
                      borderRadius: "50%",
                      marginRight: "4px",
                    }}
                  ></span>
                  Peak hour sessions
                </span>
              </p>
            </div>
            <div className="eco-chart-small">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getPeakUsageData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey={dateKey}
                    tickFormatter={(value) =>
                      dataView === "daily"
                        ? new Date(value).getDate().toString()
                        : value
                    }
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    content={
                      <SimpleTooltip labelFormatter={formatTooltipLabel} />
                    }
                    cursor={{ stroke: "transparent" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.2}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="peakHour"
                    stackId="2"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.4}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Clean Footer */}
        <div className="text-center p-4">
          <p className="eco-text-muted text-sm">
            Sustainable energy monitoring for a cleaner future
          </p>
        </div>
      </div>
    </div>
  );
}
