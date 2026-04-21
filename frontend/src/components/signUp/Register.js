import axios from "axios";
import { APIRoutes } from "../../../API/ApiRoutes";

const BASE_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (userData) => {
  try {
    const res = await axios.post(
      `${BASE_URL}${APIRoutes.USER_REGISTER}`,
      userData
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};