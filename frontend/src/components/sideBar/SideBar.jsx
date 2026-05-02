import { useLocation, Link } from "react-router-dom";
import "./Sidebar.css";
import {
  LayoutDashboard,
  Laptop,
  Package,
  Users,
  ClipboardList,
  FileText,
  Settings,
  UserPlus,
  CircleQuestionMark,
  Airplay,
  BrainCircuit,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("User"));
  const role = user?.role;

  const currentPath = location.pathname.replace("/", "") || "dashboard";

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["Admin", "Manager"],
    },
    {
      id: "laptops",
      label: "Laptops",
      icon: Laptop,
      roles: ["Admin", "IT Operations"],
    },
    {
      id: "software",
      label: "Software",
      icon: Package,
      roles: ["Admin", "IT Operations"],
    },
    {
      id: "employees",
      label: "Employees",
      icon: Users,
      roles: ["Admin"],
    },
    {
      id: "viewAssets",
      label: " View Assets",
      icon: Airplay,
      roles: ["Employee"],
    },
    {
      id: "queries",
      label: " Query",
      icon: CircleQuestionMark,
      roles: ["Employee"],
    },
    {
      id: "assignments",
      label: "Assignments",
      icon: ClipboardList,
      roles: ["Admin", "IT Operations"],
    },
    {
      id: "ai-maintenance",
      label: "AI Maintenance",
      icon: BrainCircuit,
      roles: ["Admin", "IT Operations"],
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      roles: ["Admin", "Manager"],
    },
    {
      id: "profileSettings",
      label: "Settings",
      icon: Settings,
      roles: ["Admin", "IT Operations", "Employee", "Manager"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(role),
  );

  return (
    <div className="sidebar-outer">
      <div className="sidebar-inner">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              to={`/${item.id}`}
              key={item.id}
              style={{ textDecoration: "none" }}
            >
              <button
                type="button"
                className={`menu-btn ${
                  currentPath === item.id ? "active" : ""
                }`}
              >
                <Icon className="menu-icon" size={24} />
                <span className="menu-label">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;