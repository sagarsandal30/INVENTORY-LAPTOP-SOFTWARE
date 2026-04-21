import axios from "axios";
import { APIRoutes } from "../../../API/ApiRoutes";

const BASE_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

export const showDashboard = async () => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.DASHBOARD}`,
      {
        headers:{
            Authorization:`Bearer ${token}`
        }
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting Dashboard failed" };
  }
};