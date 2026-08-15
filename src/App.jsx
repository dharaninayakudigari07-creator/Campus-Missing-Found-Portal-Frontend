import { Routes, Route, Navigate } from "react-router-dom";

// =====================================================
// AUTH PAGES
// =====================================================

import Login from "./pages/login";
import Signup from "./pages/signup";


// =====================================================
// STUDENT PAGES
// =====================================================

import Dashboard from "./pages/dashboard";
import Profile from "./pages/profile";
import ReportLostItem from "./pages/reportlostitem";
import ReportFoundItem from "./pages/reportfounditem";
import MyItems from "./pages/myitems";
import MyClaims from "./pages/myclaims";
import ItemDetails from "./pages/itemdetails";


// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from "./pages/admindashboard";
import AdminProfile from "./pages/adminprofile";


function App() {

  return (

    <Routes>


      {/* =================================================
          DEFAULT
      ================================================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* =================================================
          AUTH
      ================================================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />


      {/* =================================================
          DASHBOARD
      ================================================= */}

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />


      {/* =================================================
          REPORT LOST
      ================================================= */}

      <Route
        path="/report-lost"
        element={<ReportLostItem />}
      />


      {/* =================================================
          REPORT FOUND
      ================================================= */}

      <Route
        path="/report-found"
        element={<ReportFoundItem />}
      />


      {/* =================================================
          MY ITEMS
      ================================================= */}

      <Route
        path="/my-items"
        element={<MyItems />}
      />


      {/* =================================================
          MY CLAIMS
      ================================================= */}

      <Route
        path="/my-claims"
        element={<MyClaims />}
      />


      {/* =================================================
          PROFILE
      ================================================= */}

      <Route
        path="/profile"
        element={<Profile />}
      />


      {/* =================================================
          ADMIN
      ================================================= */}

      <Route
        path="/admin"
        element={<AdminDashboard />}
      />

      <Route
        path="/admin/profile"
        element={<AdminProfile />}
      />


      {/* =================================================
          ITEM DETAILS
      ================================================= */}

      <Route
        path="/item-details/:id"
        element={<ItemDetails />}
      />


      {/* =================================================
          INVALID URL
      ================================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>

  );

}


export default App;


