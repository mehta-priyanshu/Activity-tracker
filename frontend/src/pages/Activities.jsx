import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import "../assets/Activity.css";

const Activities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [filtered, setFiltered] = useState([]);

  // Popup states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [currentActivity, setCurrentActivity] = useState({
    _id: "",
    title: "",
    description: "",
    date: "",
    editCount: 0, // 🆕 track edit count
  });

  const ONE_HOUR = 60 * 60 * 1000; // 1 hour in ms

  // 🟢 Fetch activities
  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must login first!");
        navigate("/login");
        return;
      }

      const res = await API.get("/activities");
      setActivities(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching activities. Please login again.");
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    if (searchDate === "") {
      setFiltered(activities);
    } else {
      setFiltered(activities.filter((a) => a.date === searchDate));
    }
  }, [searchDate, activities]);

  const openDeletePopup = (id) => {
    setDeleteId(id);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/activities/${deleteId}`);
      setShowDeletePopup(false);
      alert("Activity deleted successfully");
      fetchActivities();
    } catch (err) {
      console.error(err);
      alert("Error deleting activity");
    }
  };

  // 🟢 Automatically fill date when editing
  const openEditModal = (activity) => {
    setCurrentActivity({
      _id: activity._id,
      title: activity.title || "",
      description: activity.description || "",
      date: activity.date
        ? new Date(activity.date).toISOString().split("T")[0]
        : new Date(activity.createdAt).toISOString().split("T")[0],
      editCount: activity.editCount || 0, // 🆕 ensure edit count is stored
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setCurrentActivity({ ...currentActivity, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const { _id, title, description, date, editCount } = currentActivity;
    if (!title || !description || !date) {
      alert("All fields are required");
      return;
    }

    // 🟢 Prevent more than 2 edits within 1 hour
    if (editCount >= 2) {
      alert("You can only edit this activity twice within 1 hour.");
      setShowEditModal(false);
      return;
    }

    try {
      await API.put(`/activities/${_id}`, {
        title,
        description,
        date,
        editCount: editCount + 1, // 🆕 increase edit count
      });
      setShowEditModal(false);
      alert("Activity updated successfully");
      fetchActivities();
    } catch (err) {
      console.error(err);
      alert("Error updating activity");
    }
  };

  // 🟢 Check if Edit/Delete allowed (<1 hour & <2 edits)
  const isEditable = (activity) => {
    if (!activity.createdAt) return false;
    const now = new Date();
    const createdTime = new Date(activity.createdAt);
    const withinOneHour = now - createdTime < ONE_HOUR;
    const editCount = activity.editCount || 0;
    return withinOneHour && editCount < 2;
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Activities</h2>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="mb-4">
        <input
          type="date"
          className="form-control w-25 d-inline-block me-2"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
      </div>

      <div className="activities-container">
        <ul className="list-group">
          {filtered.map((a) => {
            const editable = isEditable(a);

            return (
              <li key={a._id} className="list-group-item mb-3 activity-item">
                <div className="activity-content">
                  <h5 className="fw-bold">{a.title}</h5>
                  <p className="activity-desc">{a.description}</p>
                  <small className="text-muted">
                    {a.createdAt
                      ? new Date(a.createdAt).toISOString().split("T")[0]
                      : "N/A"}
                  </small>
                </div>

                <div className="activity-actions">
                  {editable && (
                    <>
                      <button
                        className="activity-btn activity-edit-btn me-2"
                        onClick={() => openEditModal(a)}
                      >
                        Edit
                      </button>
                      <button
                        className="activity-btn activity-delete-btn"
                        onClick={() => openDeletePopup(a._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {showDeletePopup && (
        <div className="custom-popup">
          <div className="popup-box">
            <h5>Confirm Delete</h5>
            <p>Are you sure you want to delete this activity?</p>
            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-secondary me-2"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="edit-popup-box">
          <div className="edit-modal-content p-4 shadow-lg rounded">
            <h4>Edit Activity</h4>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Title"
                name="title"
                value={currentActivity.title}
                onChange={handleEditChange}
              />
            </div>
            <div className="mb-3">
              <textarea
                className="form-control"
                placeholder="Description"
                name="description"
                value={currentActivity.description}
                onChange={handleEditChange}
              ></textarea>
            </div>
            <div className="mb-3">
              <input
                type="date"
                className="form-control"
                name="date"
                value={currentActivity.date}
                onChange={handleEditChange}
              />
            </div>
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-secondary me-2"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleUpdate}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
