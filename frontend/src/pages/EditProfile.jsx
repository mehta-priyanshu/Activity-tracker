import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/Login.css";

const contactRegex = /^(?:6[3-9]|[7-9]\d)\d{8}$/;

const EditProfile = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [contact, setContact] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/users/me");
        const user = res.data || {};
        setUsername(user.username || "");
        setContact(user.contact || "");
      } catch (err) {
        console.error("Fetch profile error:", err?.response || err);
        toast.error("Unable to load profile. Please login again.");
        setTimeout(() => navigate("/login"), 900);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUsername = String(username || "").trim();
    const cleanContact = String(contact || "").replace(/\D/g, "");

    if (cleanUsername.length < 3) {
      toast.error("Username must be at least 3 characters.");
      return;
    }
    if (!contactRegex.test(cleanContact)) {
      toast.error("Contact must be 10 digits and start with 63–99.");
      return;
    }

    // Validate password if provided
    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        username: cleanUsername,
        contact: cleanContact,
      };
      if (newPassword) payload.newPassword = newPassword;

      const res = await API.put("/users/me", payload);
      toast.success(res.data?.message || "Profile updated successfully");

      // Update localStorage with new username
      if (cleanUsername) localStorage.setItem("username", cleanUsername);
      if (cleanContact) localStorage.setItem("contact", cleanContact);

      // Notify Dashboard of profile update
      window.dispatchEvent(
        new CustomEvent("profileUpdated", {
          detail: { username: cleanUsername, contact: cleanContact },
        })
      );

      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      console.error("Update profile error:", err?.response || err);
      const msg = err?.response?.data?.message || "Error updating profile";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ justifyContent: "center" }}>
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="login-card" style={{ maxWidth: 520 }}>
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <input
            placeholder="Contact number (e.g. 639XXXXXXXX)"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            disabled={loading}
            maxLength={14}
          />
          <input
            type="password"
            placeholder="New Password "
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <p className="redirect-text" style={{ marginTop: 12 }}>
          <span onClick={() => navigate("/dashboard")}>Back to Dashboard</span>
        </p>
      </div>
    </div>
  );
};

export default EditProfile;