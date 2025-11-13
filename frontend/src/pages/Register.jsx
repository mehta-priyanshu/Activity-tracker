import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "../assets/Registration.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const saveTokenAndRedirect = (token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setLoading(false);
    setTimeout(() => navigate("/dashboard"), 400);
  };

  const attemptLogin = async () => {
    try {
      const loginRes = await API.post("/login", { username, password });
      const loginToken =
        loginRes?.data?.token ||
        loginRes?.data?.data?.token ||
        loginRes?.data?.user?.token;
      if (loginToken) {
        saveTokenAndRedirect(loginToken);
        setMessage("Registered and logged in");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Auto-login failed:", err?.response || err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    // Enforce validation on the JS side so users cannot bypass via Inspect
    const cleanUsername = String(username || "").trim();
    const cleanPassword = String(password || "");
    if (!cleanUsername || !cleanPassword) {
      setMessage("Username and password are required.");
      return;
    }
    if (cleanUsername.length < 3) {
      setMessage("Username must be at least 3 characters.");
      return;
    }
    if (cleanPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/register", { username, password });

      // accept several possible token shapes
      const token =
        res?.data?.token ||
        res?.data?.data?.token ||
        res?.data?.user?.token;

      if (token) {
        saveTokenAndRedirect(token);
        setMessage("Registration successful");
        setUsername("");
        setPassword("");
        return;
      }

      // If no token returned, try automatic login as fallback
      const loggedIn = await attemptLogin();
      if (loggedIn) {
        setUsername("");
        setPassword("");
        return;
      }

      // If still no token, show server message
      setMessage(
        res?.data?.message ||
        res?.data?.error ||
        JSON.stringify(res?.data) ||
        "Registration failed. Please try again."
      );
    } catch (err) {
      console.error("Register error:", err?.response || err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        JSON.stringify(err?.response?.data) ||
        "Registration failed. Please try again.";
      setMessage(serverMsg);

      // cleanup partial state
      localStorage.removeItem("token");
      localStorage.removeItem("username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Your Account</h2>
        {message && <p className="message">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <input
            placeholder="Enter password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="redirect-text">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Register;