import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const getConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchMyAssets = async () => {
  try {
    const response = await axios.get(`${BASE_URL}my-assets`, getConfig());
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch your assets" };
  }
};
