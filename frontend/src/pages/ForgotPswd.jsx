import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "../assets/Frgtpswd.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateContact = (raw) => {
    const digits = String(raw || "").replace(/\D/g, "");
    const contactRegex = /^(?:6[3-9]|[7-9]\d)\d{8}$/;
    return contactRegex.test(digits) ? digits : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanContact = validateContact(contact);
    if (!cleanContact) {
      toast.error("Please enter a valid registered number.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/check-username", { contact: cleanContact });
      const data = res?.data || {};

      if (data.exists === true || data.success === true || data.token) {
        sessionStorage.setItem("resetContact", cleanContact);
        if (data.token) sessionStorage.setItem("resetToken", data.token);

        toast.success(data.message || "Reset token generated successfully");
        setTimeout(() => navigate("/change-password", { state: { contact: cleanContact } }), 700);
        return;
      }

      toast.error("Please enter a valid registered number.");
    } catch (err) {
      console.error("Error checking contact:", err?.response ?? err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.statusText ||
        "Something went wrong. Please try again.";

      if (err?.response?.status === 404 || /not found|no user/i.test(String(serverMsg))) {
        toast.error("Please enter a valid registered number.");
      } else {
        toast.error(serverMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <ToastContainer position="top-right" autoClose={2000} />
      <button
        type="button"
        className="fp-back-btn"
        onClick={() => navigate("/login")}
      >
        ← Back to Login
      </button>

      <div className="forgot-card">
        <h3>Forgot Password</h3>
        <p className="lead">Enter your registered mobile number to reset your password.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fp-contact">Registered Mobile Number</label>
            <input
              id="fp-contact"
              type="tel"
              className="form-control"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g. 639XXXXXXXX"
              maxLength={14}
            />
          
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
