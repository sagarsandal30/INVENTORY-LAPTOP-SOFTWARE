import  axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL;
import { APIRoutes } from "../../../API/ApiRoutes";


export const getAllNotifications = async (page,limit,search,category,filter) => {
  try {
    const token = localStorage.getItem("token");

    const result = await axios.get(
      `${BASE_URL}${APIRoutes.NOTIFICATIONS}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params:{page,limit,search,category,filter},
      }
    );

    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "Fetching NOTIFICATIONS failed" };
  }
};


export const deleteNotification = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const result = await axios.delete(
      `${BASE_URL}${APIRoutes.NOTIFICATIONS}/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "deleting NOTIFICATION failed" };
  }
};
// Mark all Notification  Mark As Read
export const markAllReadAPI = async () => {
  try {
    const token = localStorage.getItem("token");

    const result = await axios.patch(
      `${BASE_URL}${APIRoutes.NOTIFICATIONS}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "deleting NOTIFICATION failed" };
  }
};


// Mark Single Notification  Mark As Read
export const markReadAPI = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const result = await axios.patch(
      `${BASE_URL}${APIRoutes.NOTIFICATIONS}/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "deleting NOTIFICATION failed" };
  }
};


export const deleteAllNotif = async () => {
  try {
    const token = localStorage.getItem("token");

    const result = await axios.delete(
      `${BASE_URL}${APIRoutes.NOTIFICATIONS}/deleteAllNotif`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return result.data;
  } catch (error) {
    throw error.response?.data || { message: "deleting NOTIFICATION failed" };
  }
};