import axios from "axios";

// Use relative path in production, absolute in development
const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

export const chargingDataAPI = {
  // Get daily charging data
  getDailyData: () => api.get("/charging-data/daily"),

  // Get weekly charging data
  getWeeklyData: () => api.get("/charging-data/weekly"),

  // Get summary statistics
  getSummaryStats: (view) => api.get(`/charging-data/summary/${view}`),

  // Get specific day/week data
  getSpecificData: (view, identifier) =>
    api.get(`/charging-data/specific/${view}/${identifier}`),

  // Health check
  healthCheck: () => api.get("/health"),
};

export default api;
