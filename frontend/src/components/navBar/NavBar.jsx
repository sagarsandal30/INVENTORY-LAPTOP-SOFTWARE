import { Link } from "react-router-dom";
import "./Navbar.css";
import { Bell, Mail, Globe, Settings as SettingsIcon,LogOut  } from "lucide-react";
import {getAllNotifications} from "../../pages/NotificationPage/NotificationAPI"
import { useEffect, useState } from "react";


const handleLogout = () => {
  localStorage.removeItem("token");   // remove JWT
  localStorage.removeItem("User");    // remove user info
  window.location.href = "/login";    // redirect
};

const Navbar = () => {
    const user = JSON.parse(localStorage.getItem("User"));
  const role = user?.role;
  const[totalNotif,setTotalNotif]=useState(null);

  const totalNotifications= async()=>{
    try {
      const data= await getAllNotifications();
      console.log("Notifi",data.totalNotifications)
      setTotalNotif(data.totalNotifications);
    }
    catch(error){
      console.error("Error fetching total notifications:", error);
    }
  }
useEffect(() => {
  totalNotifications();
}, []);

 const data=JSON.parse(localStorage.getItem("User"));

  return (
    <nav className="navbar">
      <div className="nav-left">
      
        <div className="logo">
          <div className="logo-icon">i</div>
          <span className="logo-text">InventoryHub</span>
          </div>
            
      </div>

      <div className="nav-right">
        <button className="icon-btn">
          <Mail size={20} />
        </button>

        <button className="icon-btn">
          <Globe size={20} />
        </button>

        {role !== "Employee" && (
          <Link to="/IT-Operation/notifications" className="icon-btn" >
            <button className="icon-btn">
              <div className="notification-wrapper">
                <Bell size={20} />
                <span className="badge">{totalNotif || 0}</span>
              </div>
            </button>
          </Link>
        )}

<Link to="/profileSettings">
        <div className="user-profile">
          <img
            src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff"
            alt="User"
            className="avatar"
          />
          <div className="user-info">
            <span className="user-name">{`${data.firstName}`}</span>
            <span className="user-role">{`${data.role}`}</span>
          </div>
        </div>
        </Link>
        <Link to="/profileSettings">
          {" "}
          <button className="nv-settings-btn">
            <SettingsIcon size={20} />
          </button>{" "}
        </Link>

        <button className="nv-logout-btn" onClick={handleLogout}>
  <LogOut  size={20}/>
</button>
      </div>
    </nav>
  );
};

export default Navbar;
