import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Activity Tracker</h1>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: '1rem 2rem',
            borderRadius: '8px',
            border: 'none',
            background: '#fff',
            color: '#ff7e5f',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          style={{
            padding: '1rem 2rem',
            borderRadius: '8px',
            border: 'none',
            background: '#ff7e5f',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
