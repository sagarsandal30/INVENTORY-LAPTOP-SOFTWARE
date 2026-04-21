import axios from "axios";
import { APIRoutes } from "../../../API/ApiRoutes";

const BASE_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

export const createEmployee = async (userData) => {
  try {
    const result = await axios.post(
      `${BASE_URL}${APIRoutes.EMPLOYEE}`,
      userData,
      {
        headers:{
            Authorization:`Bearer ${token}`
        }
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Creating Employee failed" };
  }
};

//Get All employees
export const getEmployees = async (page,limit,search,status) => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.EMPLOYEE}`,
      {
        headers:{
            Authorization:`Bearer ${token}`
        },
        params:{page,limit,search,status}
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting All Employees failed" };
  }
};
// Get Employyee by id
export const getEmployeeById = async (employeeId) => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.EMPLOYEE}/${employeeId}`,
      {
        headers:{
            Authorization:`Bearer ${token}`
        }
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting All Employees failed" };
  }
};
//Delete
export const deleteEmployeeById = async (EmployeeId) => {
  try {
    const result = await axios.delete(
      `${BASE_URL}${APIRoutes.EMPLOYEE}/${EmployeeId}`,
     
      {
        headers:{
            Authorization:`Bearer ${token}`
        }
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "  Employee deleted failed" };
  }
};


// Update
export const updateEmployeeById = async (EmployeeId,formData) => {
  try {
    const result = await axios.put (
      `${BASE_URL}${APIRoutes.EMPLOYEE}/${EmployeeId}`,
      formData,
     
      {
        headers:{
            Authorization:`Bearer ${token}`
        }
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: " Employees updated failed" };
  }
};


