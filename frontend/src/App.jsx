import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/AdminPage";
import LandingPage from "./pages/LandingPage";
import Activities from "./pages/Activities";
import AdminUserDetails from "./pages/AdminUserDetail";
//import AdminDashboard from "./pages/AdminDashboard";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/activities" element={<Activities />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/user/:username" element={<AdminUserDetails />} />
      </Routes>
  </Router>
);

export default App;
