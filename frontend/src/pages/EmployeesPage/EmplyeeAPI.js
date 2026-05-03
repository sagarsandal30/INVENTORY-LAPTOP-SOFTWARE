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

export const createEmployee = async (userData) => {
  try {
    const result = await axios.post(
      `${BASE_URL}/${APIRoutes.EMPLOYEE}`,
      userData,
      getConfig()
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Creating Employee failed" };
  }
};

export const getEmployees = async (page, limit, search, status) => {
  try {
    const result = await axios.get(
      `${BASE_URL}/${APIRoutes.EMPLOYEE}`,
      {
        ...getConfig(),
        params: { page, limit, search, status }
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting All Employees failed" };
  }
};
export const getEmployeeById = async (employeeId) => {
  try {
    const result = await axios.get(
      `${BASE_URL}/${APIRoutes.EMPLOYEE}/${employeeId}`,
      getConfig()
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting Employee details failed" };
  }
};
export const deleteEmployeeById = async (EmployeeId) => {
  try {
    const result = await axios.delete(
      `${BASE_URL}/${APIRoutes.EMPLOYEE}/${EmployeeId}`,
      getConfig()
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Employee deletion failed" };
  }
};


export const updateEmployeeById = async (EmployeeId, formData) => {
  try {
    const result = await axios.put(
      `${BASE_URL}/${APIRoutes.EMPLOYEE}/${EmployeeId}`,
      formData,
      getConfig()
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Employee update failed" };
  }
};


