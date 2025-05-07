import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMapMarkerAlt, FaUsers } from "react-icons/fa"; // Import FaUsers
import "./Participants.css";
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Participants = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    place: "",
  });

  // Backend URL for events
  const API_URL_EVENTS = "http://localhost:5000/api/events";

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(API_URL_EVENTS);
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events", err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      date: "",
      place: "",
    });
    setIsEditMode(false);
    setEditId(null);
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        await axios.put(`${API_URL_EVENTS}/${editId}`, formData);
      } else {
        await axios.post(API_URL_EVENTS, formData);
      }
      fetchEvents();
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error("Error submitting form", err);
    }
  };

  const handleEdit = (event) => {
    setFormData(event);
    setIsEditMode(true);
    setEditId(event._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this event?");
    if (confirm) {
      try {
        await axios.delete(`${API_URL_EVENTS}/${id}`);
        fetchEvents();
      } catch (err) {
        console.error("Error deleting event", err);
      }
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Name", "Date (YYYY-MM-DD)", "Place"],
      ...events.map((p) => [
        p.name, p.date, p.place,
      ]),
    ]
      .map((row) => row.map((field) => `"${field?.toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "event_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="participant-container">
      <h1>🗓️ Event List</h1>

      <div className="top-bar">
        <button className="add-button" onClick={() => { setShowModal(true); resetForm(); }}>
          ➕ Add Event
        </button>
        <button className="export-button" onClick={handleExportCSV}>
          📥 Export CSV
        </button>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="🔍 Search by name, place"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
      </div>

      <div className="participant-list">
        {events
          .filter((p) =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.place.toLowerCase().includes(searchTerm)
          )
          .map((p, index) => (
            <div className="participant-card" key={p._id}>
              <div className="left-section">
                <h3>{p.name}</h3>
                <p><strong>Date:</strong> {p.date}</p>
                <p><FaMapMarkerAlt /> {p.place}</p>
              </div>
              <div className="right-section">
                <div className="card-actions">
                  <Link to={`/event-participants/${p._id}`} className="view-participants-button">
                    <button className="view-button"><FaUsers /> View Participants</button>
                  </Link>
                  <button className="edit-button" onClick={() => handleEdit(p)}>✏️ Edit</button>
                  <button className="delete-button" onClick={() => handleDelete(p._id)}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>{isEditMode ? "Edit Event" : "Add New Event"}</h2>
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
            <input type="date" name="date" placeholder="Date" value={formData.date} onChange={handleChange} />
            <input type="text" name="place" placeholder="Place" value={formData.place} onChange={handleChange} />
            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="submit-button" onClick={handleSubmit}>
                {isEditMode ? "Save Changes" : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;