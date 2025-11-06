import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "../assets/Admin.css"; // We'll update styles after
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Admin = () => {
  const [usersData, setUsersData] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/admin/all");
        setUsersData(res.data);
      } catch (err) {
        console.error("Failed to load admin data", err);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    toast.success("Logged out successfully.");
    setTimeout(() => {
      navigate("/login");
    }, 1200);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleUserClick = (username) => {
    navigate(`/admin/user/${username}`);
  };

  return (
    <div className="admin-glass-container">
      <ToastContainer position="top-right" autoClose={2000} />

      <aside className="admin-sidebar">
        <h2 className="logo">Admin Panel</h2>
        <ul className="sidebar-menu">
          <li className="active">Users</li>
        </ul>
        <button className="logout-btn-glass" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="admin-glass-main">
        <h3 className="page-title">User List</h3>

        <div className="glass-list-container">
          {usersData.length === 0 ? (
            <p>No users found.</p>
          ) : (
            usersData.map((user) => (
              <div
                key={user.username}
                className="glass-user-card"
                onClick={() => handleUserClick(user.username)}
              >
                <span className="user-avatar">{user.username.charAt(0).toUpperCase()}</span>
                <div className="user-info">
                  <strong>{user.username}</strong>
                  {/*<small>{user.role || "user"}</small>*/}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {showLogoutModal && (
        <div className="glass-modal">
          <div className="glass-modal-box">
            <h4>Logout Confirmation</h4>
            <p>Are you sure you want to logout?</p>
            <div className="glass-modal-actions">
              <button onClick={confirmLogout} className="confirm-btn">Logout</button>
              <button onClick={cancelLogout} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
