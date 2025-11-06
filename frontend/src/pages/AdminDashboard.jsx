import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../assets/Admin.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/admin/all");
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    fetchUsers();
  }, []);

  // Logout with confirmation
const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem("token");
    toast.success("You have been logged out successfully.");
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="admin-page">
      {showLogoutModal && (
        <div className="logout-popup">
          <h4>Are you sure you want to logout?</h4>
          <div className="logout-actions">
            <button className="btn-modern btn-ok" onClick={confirmLogout}>
              OK
            </button>
            <button className="btn-modern btn-cancel" onClick={cancelLogout}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <header className="admin-header">
        <h2>👑 Admin Dashboard</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <div className="admin-content">
        {users.length === 0 ? (
          <p style={{ textAlign: "center" }}>No users found.</p>
        ) : (
          <ul className="user-list">
            {users.map((user, idx) => (
              <li
                key={user.username + idx}
                className="user-list-item"
                onClick={() => navigate(`/admin/user/${user.username}`)}
                style={{ cursor: "pointer" }}
              >
                <span className="user-name">{user.username}</span>
                <span
                  className={`role-badge ${
                    user.role === "admin" ? "admin-role" : "user-role"
                  }`}
                >
                  {user.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
