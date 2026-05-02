import axios from "axios";
import { APIRoutes } from "../../../API/ApiRoutes";

const BASE_URL = import.meta.env.VITE_API_URL;

const getConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const fetchReportData = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}${APIRoutes.REPORTS}`,
      getConfig()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch report data" };
  }
};
