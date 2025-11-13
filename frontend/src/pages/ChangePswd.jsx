import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const getResetContact = () =>
    location?.state?.contact ||
    sessionStorage.getItem("resetContact") ||
    localStorage.getItem("resetContact") ||
    "";

  const getResetToken = () =>
    location?.state?.token ||
    sessionStorage.getItem("resetToken") ||
    localStorage.getItem("resetToken") ||
    null;

  useEffect(() => {
    // compute contact inline to avoid referencing getResetContact (prevents missing-deps ESLint error)
    const contact =
      location?.state?.contact ||
      sessionStorage.getItem("resetContact") ||
      localStorage.getItem("resetContact") ||
      "";
    if (!contact) {
      toast.error("No reset contact found. Please start the forgot-password flow again.");
      setTimeout(() => navigate("/forgot-password"), 1000);
    }
  }, [location, navigate]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const rawContact = getResetContact();
    const cleanContact = String(rawContact || "").replace(/\D/g, "");
    const contactRegex = /^(?:6[3-9]|[7-9]\d)\d{8}$/;

    if (!contactRegex.test(cleanContact)) {
      toast.error("Invalid registered number. Start forgot-password again.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const token = getResetToken();
      const payload = { contact: cleanContact, newPassword };
      if (token) payload.token = token;

      console.log("Change-password payload:", payload); // debug line

      const res = await API.post("/change-password", payload);

      if (res?.data?.success) {
        toast.success(res.data.message || "Password changed successfully");
        // cleanup
        sessionStorage.removeItem("resetContact");
        sessionStorage.removeItem("resetToken");
        localStorage.removeItem("resetContact");
        localStorage.removeItem("resetToken");
        setTimeout(() => navigate("/login"), 900);
        return;
      }
      toast.error(res?.data?.message || "Error changing password");
    } catch (err) {
      console.error("Error changing password:", err?.response || err);
      const serverMsg = err?.response?.data?.message || `Error: ${err?.response?.status || ""}`;
      if (err?.response?.status === 400 && /Contact and newPassword required|Invalid contact/i.test(String(serverMsg))) {
        toast.error("Please use the same registered number you used to request reset.");
      } else {
        toast.error(serverMsg || "Error changing password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <ToastContainer position="top-right" autoClose={2000} />
      <h3 className="mb-3">Change Password</h3>

      <form onSubmit={handleChangePassword}>
        <div className="mb-3">
          <label>Registered Mobile Number</label>
          <input type="tel" className="form-control" value={getResetContact()} readOnly />
        </div>

        <div className="mb-3">
          <label>New Password</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="mb-3">
          <label>Confirm Password</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button className="btn btn-primary w-100" type="submit" disabled={loading}>
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
