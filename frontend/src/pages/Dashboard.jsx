import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../assets/Dashboard.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activityCount, setActivityCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const dropdownRef = useRef(null);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Fetch today's activity count from backend
  useEffect(() => {
    const fetchCount = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, redirecting to login");
        navigate("/login");
        return;
      }
      try {
        const res = await API.get("/activities/today-count");
        setActivityCount(res.data.count);
      } catch (err) {
        console.log("Error fetching activity count:", err.response?.status, err.response?.data);
        if (err.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    fetchCount();
  }, [navigate]);

  // ✅ Add activity
  const addActivity = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Invalid token. Please log in again.");
      navigate("/login");
      return;
    }
    try {
      await API.post("/activities", { title, description });

      setTitle("");
      setDescription("");
      setActivityCount(activityCount + 1);
      toast.success("Activity added successfully!");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Error adding activity");
      }
    }
  };

  // ✅ Logout Handlers
  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    setTimeout(() => navigate("/login"), 1500);
  };
  const cancelLogout = () => setShowLogoutModal(false);

  return (
    <div className="dashboard-container">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* ✅ Logout Popup with Blur Overlay */}
      {showLogoutModal && (
        <>
          <div className="logout-overlay" onClick={cancelLogout}></div>
          <div className="logout-popup">
            <h4>Are you sure you want to logout?</h4>
            <div className="logout-actions">
              <button className="btn-modern btn-ok" onClick={confirmLogout}>
                Yes, Logout
              </button>
              <button className="btn-modern btn-cancel" onClick={cancelLogout}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Dropdown */}
      <div className="dropdown-container" ref={dropdownRef}>
        <button className="dropdown-btn" onClick={toggleDropdown}>
          ☰ Menu
        </button>
        {dropdownOpen && (
          <div className="dropdown-menu-custom">
            <button
              className="dropdown-item-custom"
              onClick={() => {
                navigate("/activities");
                setDropdownOpen(false);
              }}
            >
              View Activities
            </button>
            <button
              className="dropdown-item-custom text-danger"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="dashboard-heading">📋 Dashboard</h2>
        <p className="dashboard-subtext">Add your daily tasks below</p>
      </div>

      {/* ✅ Show count */}
      <div
        style={{ textAlign: "center", marginBottom: "10px", fontWeight: "bold" }}
      >
        You added {activityCount}/2 activities today ✅
      </div>

      {/* Main Card */}
      <div className="dashboard-main-card">
        <h3 style={{ marginBottom: "1.5rem" }}>Add New Task</h3>

        <form onSubmit={addActivity}>
          <div className="dashboard-form-group">
            <input
              type="text"
              className="dashboard-input"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              className="dashboard-input"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
            />

            {/* ✅ Disable button if limit reached */}
            <button
              type="submit"
              className="btn btn-success dashboard-add-btn"
              disabled={activityCount >= 2}
            >
              {activityCount >= 2 ? "Limit Reached" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
