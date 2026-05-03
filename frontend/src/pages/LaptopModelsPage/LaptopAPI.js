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

export const createLaptopModel = async (laptopModelData) => {
  try {
    const result = await axios.post(
      `${BASE_URL}/${APIRoutes.LAPTOPMODEL}`,
      laptopModelData,
      getConfig()
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Creating LaptopModel failed" };
  }
};

export const getLaptopModels = async (page, limit, search) => {
  try {
    const result = await axios.get(
      `${BASE_URL}/${APIRoutes.LAPTOPMODEL}`,
      {
        ...getConfig(),
        params: { page, limit, search }
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting Laptop Models failed" };
  }
};
export const getLaptopModelById = async (laptopModelId) => {
  try {
    const result = await axios.get(
      `${BASE_URL}/${APIRoutes.LAPTOPMODEL}/${laptopModelId}`,
      getConfig()
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting Laptop Model details failed" };
  }
};
export const deleteLaptopModelById = async (laptopModelId) => {
  try {
    const result = await axios.delete(
      `${BASE_URL}/${APIRoutes.LAPTOPMODEL}/${laptopModelId}`,
      getConfig()
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Laptop Model deletion failed" };
  }
};


export const updateLaptopModelById = async (laptopModelId, laptopModelData) => {
  try {
    const result = await axios.put(
      `${BASE_URL}/${APIRoutes.LAPTOPMODEL}/${laptopModelId}`,
      laptopModelData,
      getConfig()
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Laptop Model update failed" };
  }
};


