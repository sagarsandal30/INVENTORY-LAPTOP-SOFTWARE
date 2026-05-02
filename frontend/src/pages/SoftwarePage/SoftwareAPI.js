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

export const createSoftware = async (softwareData) => {
  try {
    const result = await axios.post(
      `${BASE_URL}${APIRoutes.SOFTWAREMODEL}`,
      softwareData,
      getConfig()
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Creating software failed" };
  }
};

export const getSoftware = async (page, limit, search, catFilter) => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.SOFTWAREMODEL}`,
      {
        ...getConfig(),
        params: { page, limit, search, catFilter }
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting software list failed" };
  }
};

export const getSoftwareById = async (softwareId) => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.SOFTWAREMODEL}/${softwareId}`,
      getConfig()
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting software details failed" };
  }
};

export const deleteSoftwareById = async (softwareId) => {
  try {
    const result = await axios.delete(
      `${BASE_URL}${APIRoutes.SOFTWAREMODEL}/${softwareId}`,
      getConfig()
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Deleting software failed" };
  }
};

export const updateSoftwareById = async (softwareId, softwareData) => {
  try {
    const result = await axios.put(
      `${BASE_URL}${APIRoutes.SOFTWAREMODEL}/${softwareId}`,
      softwareData,
      getConfig()
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Updating software failed" };
  }
};
