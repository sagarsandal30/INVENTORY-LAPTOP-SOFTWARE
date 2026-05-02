import axios from "axios";
import { APIRoutes } from "../../../API/ApiRoutes";
const BASE_URL = import.meta.env.VITE_API_URL;

const token = localStorage.getItem("token");

export const getProfileDetails = async () => {
  try {
    const result = await axios.get(`${BASE_URL}${APIRoutes.SETTINGS}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to get profile" };
  }
};

export const updateProfileDetails = async (data) => {
  try {
    const result = await axios.put(`${BASE_URL}${APIRoutes.SETTINGS}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update profile" };
  }
};
export const updateProfilePassword = async (data) => {
  try {
    const result = await axios.put(`${BASE_URL}${APIRoutes.SETTINGS_PASSWORD}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update profile Password" };
  }
};
