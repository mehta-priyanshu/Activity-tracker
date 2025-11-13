import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateContact = (raw) => {
    const digits = String(raw || "").replace(/\D/g, "");
    // 10 digits, starts with 63-99
    const contactRegex = /^(?:6[3-9]|[7-9]\d)\d{8}$/;
    return contactRegex.test(digits) ? digits : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanContact = validateContact(contact);
    if (!cleanContact) {
      // user-visible message for invalid format / wrong input
      toast.error("Please enter a valid registered number.");
      return;
    }

    setLoading(true);
    try {
      // send contact field to backend (backend should accept contact)
      const res = await API.post("/check-username", { contact: cleanContact });
      const data = res?.data || {};

      // accept several shapes: { success:true, token }, { exists:true }, ...
      if (data.exists === true || data.success === true || data.token) {
        localStorage.setItem("resetContact", cleanContact);
        if (data.token) localStorage.setItem("resetToken", data.token);

        toast.success(data.message || "Reset token generated successfully");

        setTimeout(() => {
          navigate("/change-password", { state: { contact: cleanContact } });
        }, 700);
        return;
      }

      // backend says not found or ambiguous -> show the unified message
      toast.error("Please enter a valid registered number.");
    } catch (err) {
      console.error("Error checking contact:", err?.response ?? err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.statusText ||
        "Something went wrong. Please try again.";

      // If server explicitly says not found, show unified message
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
    <div className="container mt-5" style={{ maxWidth: "420px" }}>
      <ToastContainer position="top-right" autoClose={2000} />
      <h3 className="text-center mb-4">Forgot Password</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="fp-contact">Registered Mobile Number:</label>
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
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Checking..." : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
