import axios from "axios";
import { APIRoutes } from "../../../API/ApiRoutes";

const BASE_URL = import.meta.env.VITE_API_URL;
const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

// create Assignment
export const createAssignment = async (assignData) => {
  try {
    const result = await axios.post(
      `${BASE_URL}${APIRoutes.CREATE_ASSIGNMENT}`,
      assignData,
      {
       ...getConfig(),
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Creating Assignment failed" };
  }
};

//Get All Assignments
export const getAllAssignments = async (page,limit,search,assetType,assetStatus) => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.GET_ASSIGNMENTS}`,
      {
         ...getConfig(),
         params:{page,limit,search,assetType,assetStatus}
      },

    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting All Assignments failed" };
  }
};
// Get Assignment by id
export const getAssignmentById = async (assignId) => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.GET_ASSIGNMENT_BY_ID}/${assignId}`,
      {
         ...getConfig(),
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting Assignment By Id failed" };
  }
};
//Delete Assignment by ID
export const deleteAssignmentById = async (EmployeeId) => {
  try {
    const result = await axios.delete(
      `${BASE_URL}${APIRoutes.DELETE_ASSIGNMENT}/${EmployeeId}`,
     
      {
         ...getConfig(),
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "  Assignment deleted failed" };
  }
};


// Update Assignment by ID
export const updateAssignmentById = async (EmployeeId,formData) => {
  try {
    const result = await axios.put (
      `${BASE_URL}${APIRoutes.UPDATE_ASSIGNMENT_BY_ID}/${EmployeeId}`,
      formData,

      {
         ...getConfig(),
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: " Assignment updated failed" };
  }
};


// Return Assignment by ID
// Return Assignment by ID
export const returnAssignmentById = async (Id) => {
  try {
    console.log(Id);

    const result = await axios.patch(
      `${BASE_URL}${APIRoutes.RETURN_ASSIGNMENT}/${Id}`,
      {}, // body
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Assignment returned failed" };
  }
};



//Get All employees
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

//Get All Laptop Assets
export const getLaptopAssets = async () => {
  try {
    const result = await axios.get(`${BASE_URL}${APIRoutes.SINGLE_MODEL}`,
      {
        ...getConfig(),
        
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting All  Single Laptop failed" };
  }
};

// get all laptop model
export const getLaptopModels = async () => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.LAPTOPMODEL}`,
      {
        ...getConfig(),
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting All LaptopModel failed" };
  }
};
//Get All SOFTWARE Model
export const getSoftware = async () => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.SOFTWAREMODEL}`,
      {
         ...getConfig(),
        
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting All SoftwareModel failed" };
  }
};

// Get All Individual Software Licenses
export const getIndividualSoftware = async () => {
  try {
    const result = await axios.get(
      `${BASE_URL}${APIRoutes.SOFTWARE_LICENSE}`,
      {
        ...getConfig(),
      }
    );
    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Getting Individual Software failed" };
  }
};