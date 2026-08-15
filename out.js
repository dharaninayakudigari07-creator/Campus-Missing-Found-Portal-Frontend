(() => {
  // src/App.jsx
  ```jsx
import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import Profile from "./pages/profile";
import ReportLostItem from "./pages/reportlostitem";
import ReportFoundItem from "./pages/reportfounditem";
import MyItems from "./pages/myitems";
import MyClaims from "./pages/myclaims";
import ItemDetails from "./pages/itemdetails";
import AddItem from "./pages/additem";
import Payment from "./pages/Payment";
import LocationTracking from "./pages/locationtracking";
import AdminDashboard from "./pages/admindashboard";
import AdminProfile from "./pages/adminprofile";
import Reports from "./pages/reports";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/report-lost" element={<ReportLostItem />} />
            <Route path="/report-found" element={<ReportFoundItem />} />
            <Route path="/my-items" element={<MyItems />} />
            <Route path="/my-claims" element={<MyClaims />} />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/location-tracking" element={<LocationTracking />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-profile" element={<AdminProfile />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
```;
})();
