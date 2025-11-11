import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Please fill all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const username = localStorage.getItem("resetUsername");
    if (!username) {
      toast.error("Username not found. Please go back to Forgot Password.");
      navigate("/forgot-password");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/change-password", { username, newPassword });

      if (res.data.success) {
        toast.success("Password updated successfully!");
        localStorage.removeItem("resetUsername");
        localStorage.removeItem("resetToken");
        setTimeout(() => navigate("/login"), 2000); // ✅ Redirect to login after success
      } else {
        toast.error(res.data.message || "Failed to update password.");
      }
    } catch (err) {
      console.log("Error changing password:", err.response?.status, err.response?.data);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <ToastContainer position="top-right" autoClose={2000} />
      <h3 className="text-center mb-4">Change Password</h3>
      <form onSubmit={handleChangePassword}>
        <div className="mb-3">
          <label>New Password:</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Confirm New Password:</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-success w-100"
          disabled={loading}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
