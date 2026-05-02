import "./App.css";
import Navbar from "./components/navBar/NavBar";
import SideBar from "./components/sideBar/SideBar";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./pages/DashboardPage/DashBoard";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import LaptopModels from "./pages/LaptopModelsPage/Laptopmodels";
import Software from "./pages/SoftwarePage/Software";
import Notification from "./pages/NotificationPage/Notification";
import Employees from "./pages/EmployeesPage/Employees";
import Assignments from "./pages/AssignmentsPage/Assignments";
import SignUp from "./components/signUp/SignUp"
import Report from "./pages/ReportsPage/Report";
import Settings from "./pages/SettingsPage/Settings";
import LaptopAssets from "./pages/PhysicalLaptop/LaptopAssets";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoutes";
import EmployeeQueriesPage from "./pages/QueryPage/EmployeeQueryPage";
import ViewAssets from "./pages/ViewAssets/ViewAssets";
import AIDashboard from "./pages/AIDashboard/AIDashboard";
import IndividualSoftware from "./pages/IndividualSoftware/IndividualSoftware.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<SignUp />} />
        <Route path="/navbar" element={<Navbar />}></Route>
        <Route
          path="/IT-Operation/notifications"
          element={
            <ProtectedRoute allowedRoles={["Admin", "IT Operations"]}>
              <Notification />
            </ProtectedRoute>
          }
        />

        <Route path="/sidebar" element={<SideBar />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/laptops"
          element={
            <ProtectedRoute allowedRoles={["Admin", "IT Operations"]}>
              <LaptopModels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laptop-assets/:modelId"
          element={
            <ProtectedRoute allowedRoles={["Admin", "IT Operations"]}>
              <LaptopAssets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/software"
          element={
            <ProtectedRoute allowedRoles={["Admin", "IT Operations"]}>
              <Software />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <ProtectedRoute allowedRoles={["Admin", "IT Operations"]}>
              <Assignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <Report />
            </ProtectedRoute>
          }
        />
        <Route path="/profileSettings" element={<Settings />} />

        <Route
          path="/queries"
          element={
            <ProtectedRoute allowedRoles={["Employee"]}>
              <EmployeeQueriesPage />
            </ProtectedRoute>
          }
        />
        
        <Route
  path="/viewAssets"
  element={
    <ProtectedRoute allowedRoles={["Employee"]}>
      <ViewAssets />
    </ProtectedRoute>
  }
/>
<Route
  path="/ai-maintenance"
  element={
    <ProtectedRoute allowedRoles={["Admin", "IT Operations"]}>
      <AIDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/software-licenses/:softwareId"
  element={
    <ProtectedRoute allowedRoles={["Admin", "IT Operations"]}>
      <IndividualSoftware />
    </ProtectedRoute>
  }
/>
      </Routes>
    </>
  );
}

export default App;
