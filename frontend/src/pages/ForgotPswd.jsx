import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUsername = String(username || "").trim();

    if (!cleanUsername) {
      toast.error("Please enter a valid username.");
      return;
    }

    if (cleanUsername.length < 3) {
      toast.error("Username must be at least 3 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/check-username", { username: cleanUsername });
      const data = res?.data || {};

      // Accept multiple shapes: { exists:true }, { success:true, token }, etc.
      if (data.exists === true || data.success === true || data.token) {
        // store username + token (if provided) for the change-password flow
        sessionStorage.setItem("resetUsername", cleanUsername);
        if (data.token) sessionStorage.setItem("resetToken", data.token);

        toast.success(data.message || "Reset token generated successfully");

        // redirect to change-password where user will submit new password + token
        setTimeout(() => {
          navigate("/change-password", { state: { username: cleanUsername } });
        }, 800);
        return;
      }

      toast.error(data.message || "Username not found.");
    } catch (err) {
      console.error("Error checking username:", err?.response ?? err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.statusText ||
        "Something went wrong. Please try again.";
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <ToastContainer position="top-right" autoClose={2000} />
      <h3 className="text-center mb-4">Forgot Password</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="fp-username">Enter Username:</label>
          <input
            id="fp-username"
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            placeholder="your username"
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
