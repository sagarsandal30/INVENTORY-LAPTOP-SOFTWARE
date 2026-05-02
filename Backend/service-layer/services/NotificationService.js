const Notification =require("../models/Notification");

const getNotifications= async(page,limit,search,category,filterType)=>{


  const totalNotifications=await Notification.countDocuments();

  const totalPages=Math.ceil(totalNotifications/limit);
  const skip=(page-1)*limit;

    const filter={};
if(filterType==="Unread"){
    const UnreadNotify= await Notification.find({read:false});
    return UnreadNotify;
}

    if(filterType&&filterType!=="All"){
        filter.type=filterType;
    }
    if(search&&search.trim()!==""){
        filter.$or=[
            {title:{$regex:search,$options:"i"}},
        ];
    }
    if(category && category!=="All"){
        filter.category=category;
    }

   const allNotifications= await Notification.find(filter).sort({createdAt:-1}).skip(skip).limit(limit);
   if(!allNotifications){
    throw new Error("No notifications found");
   }
    return {
        allNotifications,
    totalNotifications,
    totalPages,
    };
}



const deleteNotificationById= async(id)=>{

   const deleteNotifsById= await Notification.findByIdAndDelete(id);

   if(!deleteNotifsById){
    throw new Error("No  notification deleted");
   }
    return deleteNotifsById;
}
//Mark Read All
const markAllNotificationsRead = async () => {
  await Notification.updateMany({}, 
    { 
        read: true
     });
};
const markNotificationRead = async (id) => {
  const updated= await Notification.findByIdAndUpdate(id, 
    { 
        read: true
    },
    { 
        returnDocument: "after" 

    } // important
     );
     return updated;
};

const deleteAllNotif = async () => {
await Notification.deleteMany({});
};
module.exports={getNotifications, deleteNotificationById, markAllNotificationsRead,markNotificationRead,deleteAllNotif};