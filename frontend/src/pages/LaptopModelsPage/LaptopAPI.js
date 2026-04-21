import axios from "axios";
import { APIRoutes } from "../../../API/ApiRoutes";

const BASE_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

export const createLaptopModel = async (laptopModelData) => {
  try {
    const result = await axios.post(
      `${BASE_URL}${APIRoutes.LAPTOPMODEL}`,
      laptopModelData,
      {
        headers:{
            Authorization:`Bearer ${token}`
        }
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Creating LaptopModel failed" };
  }
};

//Get All Laptop Model
export const getLaptopModels = async (page,limit,search) => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.LAPTOPMODEL}`,
      {
        headers:{
            Authorization:`Bearer ${token}`
        },
        params:{page,limit,search,status}
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting All LaptopModel failed" };
  }
};
// Get Employyee by id
export const getLaptopModelById = async (laptopModelId) => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.LAPTOPMODEL}/${laptopModelId}`,
      {
        headers:{
            Authorization:`Bearer ${token}`
        }
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting  LaptopModel By Id failed" };
  }
};
//Delete
export const deleteLaptopModelById = async (laptopModelId) => {
  try {
    const result = await axios.delete(
      `${BASE_URL}${APIRoutes.LAPTOPMODEL}/${laptopModelId}`,
     
      {
        headers:{
            Authorization:`Bearer ${token}`
        }
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "  LaptopModel deleted failed" };
  }
};


// Update
export const updateLaptopModelById = async (laptopModelId,laptopModelData) => {
  try {
    const result = await axios.put (
      `${BASE_URL}${APIRoutes.LAPTOPMODEL}/${laptopModelId}`,
      laptopModelData,
     
      {
        headers:{
            Authorization:`Bearer ${token}`
        }
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: " LaptopModel updated failed" };
  }
};


