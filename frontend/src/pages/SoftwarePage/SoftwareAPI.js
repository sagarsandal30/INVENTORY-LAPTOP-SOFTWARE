import axios from "axios";
import { APIRoutes } from "../../../API/ApiRoutes";

const BASE_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

export const createSoftware = async (softwarelData) => {
  try {
    const result = await axios.post(
      `${BASE_URL}${APIRoutes.SOFTWAREMODEL}`,
      softwarelData,
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

//Get All SOFTWARE Model
export const getSoftware = async (page,limit,search,catFilter) => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.SOFTWAREMODEL}`,
      {
        headers:{
            Authorization:`Bearer ${token}`
        },
        params:{page,limit,search,catFilter}
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting All LaptopModel failed" };
  }
};

// Get Employyee by id
export const getSoftwareById = async (SoftwareId) => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.SOFTWAREMODEL}/${SoftwareId}`,
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
export const deleteSoftwareById = async (SoftwareId) => {
  try {
    const result = await axios.delete(
      `${BASE_URL}${APIRoutes.SOFTWAREMODEL}/${SoftwareId}`,
     
      {
        headers:{
            Authorization:`Bearer ${token}`
        }
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data  ;
  }
};


// Update
export const updateSoftwareById = async (SoftwareId,SoftwareData) => {
  try {
    const result = await axios.put (
      `${BASE_URL}${APIRoutes.SOFTWAREMODEL}/${SoftwareId}`,
      SoftwareData,
     
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


