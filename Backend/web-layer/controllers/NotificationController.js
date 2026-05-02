const {getNotifications, deleteNotificationById,markAllNotificationsRead,markNotificationRead,deleteAllNotif} =
require("../../service-layer/services/NotificationService");

const getMyNotifications = async (req, res) => {
  try {
    const search=req.query.search;
    const page = Number(req.query.page) ;
    const limit = Number(req.query.limit) ;  
    const category=req.query.category;
    const filter=req.query.filter;
      const notifications = await getNotifications(page,limit,search,category,filter);


    res.status(200).json({
      success: true,
      message: "All Notifications fetched successfully",
     ...notifications,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};


const deleteNotification = async (req, res) => {
  try {
     const {id}=req.params;

      const notifications = await deleteNotificationById(id);

    res.status(200).json({
      success: true,
      message: " Notification deleted successfully",
     notifications,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};
const markAllRead = async (req, res) => {
  try {
    await markAllNotificationsRead();

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const markRead = async (req, res) => {
  try {
    const {id}=req.params;
    const updated=await markNotificationRead(id);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      updated,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const deleteAllNotification = async (req, res) => {
  try {
    const updated=await deleteAllNotif();

    res.status(200).json({
      success: true,
      message: "All notifications deleted Successfully",
   
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports={getMyNotifications,deleteNotification,markAllRead,markRead,deleteAllNotification};