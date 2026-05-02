import axios from "axios";
import { APIRoutes } from "../../../API/ApiRoutes";

const BASE_URL = import.meta.env.VITE_API_URL;
const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

export const createLaptopAsset = async (laptopData) => {
  try {
    const result = await axios.post(
      `${BASE_URL}${APIRoutes.SINGLE_MODEL}`,
      laptopData,
     {
        ...getConfig(),
        
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Creating Single Laptop failed" };
  }
};

//Get All Laptop Assets
export const getLaptopAssets = async (page,limit,modelId,search,statusFilter,conditionFilter) => {
  try {
    const result = await axios.get(`${BASE_URL}${APIRoutes.SINGLE_MODEL}`,
      {
        ...getConfig(),
        params: { page, limit,modelId,search,statusFilter,conditionFilter }
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting All  Single Laptop failed" };
  }
};
// Get LaptopAsset by id
export const getLaptopAssetById = async (laptopId) => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.SINGLE_MODEL}/${laptopId}`,
      {
        ...getConfig(),
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting Single Laptop By Id failed" };
  }
};
//Delete
export const deleteLaptopAssetById = async (laptopId) => {
  try {
    const result = await axios.delete(
      `${BASE_URL}${APIRoutes.SINGLE_MODEL}/${laptopId}`,
     
      {
        ...getConfig(),
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: " Single Laptop delete failed" };
  }
};


// Update
export const updateLaptopAssetById = async (laptopId,laptopData) => {
  try {
    const result = await axios.put (
      `${BASE_URL}${APIRoutes.SINGLE_MODEL}/${laptopId}`,
      laptopData,
     
     {
        ...getConfig(),
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "  Single Laptop updated failed" };
  }
};


export const getLaptopModels = async(page, limit)=>{
    try{
        const response = await axios.get(`${BASE_URL}${APIRoutes.LAPTOPMODEL}`,{
        ...getConfig(),
        params: { page, limit }
      });
return response.data;
    }catch(error){
     throw error.response?.data || { message: "Fetching laptop models failed" };
    }
}

export const getEmployees = async () => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.AVALIABLE_EMPLOYEE}`,
      {
         ...getConfig(),
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting All Employees failed" };
  }
};