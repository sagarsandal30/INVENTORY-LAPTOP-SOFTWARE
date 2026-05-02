import axios from "axios";
import { APIRoutes } from "../../API/ApiRoutes";

const BASE_URL = import.meta.env.VITE_API_URL;

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Run AI failure prediction for a specific laptop asset
 */
export const predictFailure = async (assetId) => {
  try {
    const res = await axios.post(
      `${BASE_URL}${APIRoutes.AI_PREDICT}/${assetId}`,
      {},
      { headers: getAuthHeader() }
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "AI Prediction failed" };
  }
};

/**
 * Fetch laptops with high or critical failure risk
 */
export const getHighRiskLaptops = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}${APIRoutes.AI_HIGH_RISK}`,
      { headers: getAuthHeader() }
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch high risk laptops" };
  }
};

/**
 * Fetch brand-wise failure analysis data
 */
export const getBrandFailureAnalysis = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}${APIRoutes.AI_BRAND_ANALYSIS}`,
      { headers: getAuthHeader() }
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch brand analysis" };
  }
};
