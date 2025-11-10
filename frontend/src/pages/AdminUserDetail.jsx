import React, { useEffect, useState } from "react";
import API from "../api";
import "../assets/AdminUserDetail.css"
import { useParams, useNavigate } from "react-router-dom";

const UserActivities = () => {
  const { username } = useParams();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await API.get(`/admin/user/${username}`);
        setActivities(res.data.activities || []);
      } catch (err) {
        console.error("Failed to load user activities", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [username]);

  // format date safely
  const formatDate = (value) => {
    if (!value) return "No date";
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    // show date and time; change to toLocaleDateString() to show only date
    return d.toLocaleString();
  };

  return (
    <div className="user-activities-page">
      <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
        &larr; Back
      </button>
      <h2>Activities for {username}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : activities.length === 0 ? (
        <p>No activities found.</p>
      ) : (
        <ul>
          {activities.map((act) => (
            <li key={act._id}>
              <strong>{act.title}</strong> - {act.description} (
              {formatDate(act.date || act.createdAt || act.timestamp)}
              )
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserActivities;
