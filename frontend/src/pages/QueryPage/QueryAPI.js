import axios from "axios";
import { APIRoutes } from "../../../API/ApiRoutes";
const BASE_URL = import.meta.env.VITE_API_URL;

export const submitQuery = async (queryData) => {
  try {
    const token = localStorage.getItem("token");

    const result = await axios.post(
      `${BASE_URL}${APIRoutes.QUERIES}`,
      queryData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Submitting query failed" };
  }
};

export const getMyQueries = async (page,limit,status) => {
  try {
    const token = localStorage.getItem("token");

    const result = await axios.get(
      `${BASE_URL}${APIRoutes.MY_QUERIES}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params:{page,limit,status},
      }
    );

    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Fetching queries failed" };
  }
};