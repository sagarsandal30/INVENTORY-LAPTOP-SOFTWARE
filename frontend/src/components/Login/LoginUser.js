import axios from "axios";
import { APIRoutes } from "../../../API/ApiRoutes";

const BASE_URL = import.meta.env.VITE_API_URL;

export const loginUser = async (userData) => {
  try {
    const res = await axios.post(
      `${BASE_URL}${APIRoutes.USER_LOGIN}`,
      userData
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || { message:"Login failed "  };
  }
};

export const verifyUser = async () => {
  try {
    const res = await axios.post(
      `${BASE_URL}${APIRoutes.USER_LOGIN}`,
      
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || { message:"Login failed "  };
  }
};