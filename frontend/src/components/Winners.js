import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Winners.css";
import { useNavigate, useLocation } from 'react-router-dom';

const Winners = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location; // Get state passed from navigate

  const [formData, setFormData] = useState({
    name: state?.eventName || "",
    date: "",
    location: "",
    participants: "",
    first: state?.potentialWinners?.[0]?.driver || "",
    second: state?.potentialWinners?.[1]?.driver || "",
    third: state?.potentialWinners?.[2]?.driver || "",
    leastPenalty: state?.potentialWinners?.[0]?.penalty || "", // Assuming the first winner has the least penalty
  });

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/winners");
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch winners:", err);
      }
    };

    fetchWinners();

    // Fetch event details if navigated with eventName in state and it's an add operation
    if (state?.eventName && location.pathname === '/winners/add') {
      fetchEventDetails(state.eventName);
    } else if (location.pathname.startsWith('/winners/edit/')) {
      setIsEditMode(true);
      const id = location.pathname.split('/').pop();
      setEditId(id);
      fetchWinnerDetails(id);
    } else {
      setIsEditMode(false);
      setEditId(null);
      resetForm();
    }
  }, [location, state?.eventName]);

  const fetchEventDetails = async (eventName) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events/name/${eventName}`);
      if (response.data) {
        setFormData(prevFormData => ({
          ...prevFormData,
          name: response.data.name || "",
          date: response.data.date ? response.data.date.substring(0, 10) : "",
          location: response.data.location || "",
          participants: response.data.participants || "",
        }));
      } else {
        console.warn(`Event details not found for name: ${eventName}`);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const fetchWinnerDetails = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/winners/${id}`);
      if (response.data) {
        setFormData(response.data);
      } else {
        console.warn(`Winner details not found for ID: ${id}`);
        navigate('/winners');
      }
    } catch (error) {
      console.error("Error fetching winner details:", error);
      navigate('/winners');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      date: "",
      location: "",
      participants: "",
      first: "",
      second: "",
      third: "",
      leastPenalty: "",
    });
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode && editId) {
        await axios.put(`http://localhost:5000/api/winners/${editId}`, formData);
      } else if (location.pathname === '/winners/add') {
        await axios.post("http://localhost:5000/api/winners", formData);
      }
      // After successful submission, refetch winners and navigate back
      const res = await axios.get("http://localhost:5000/api/winners");
      setEvents(res.data);
      navigate('/winners');
      resetForm();
    } catch (err) {
      console.error("Error saving data:", err);
    }
  };

  const handleAddClick = () => {
    navigate('/winners/add');
  };

  const handleEdit = (event) => {
    console.log("Edit button clicked", event._id); // Debug log
    navigate(`/winners/edit/${event._id}`); // Pass the event's _id in the route
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`http://localhost:5000/api/winners/${id}`);
        const res = await axios.get("http://localhost:5000/api/winners");
        setEvents(res.data);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN");
  };

  const handleExportCSV = () => {
    const csvRows = [
      ["Event Name", "Date", "Location", "Participants", "1st Place", "2nd Place", "3rd Place", "Least Penalty"],
      ...events.map(e => [
        e.name,
        formatDate(e.date),
        e.location,
        e.participants,
        e.first,
        e.second,
        e.third,
        e.leastPenalty,
      ])
    ];

    const csvContent = csvRows
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "winners_list.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCancelModal = () => {
    navigate('/winners');
    resetForm();
  };

  return (
    <div className="winner-container">
      <h1>🏆 Winners List</h1>

      <div className="top-buttons">
        <button onClick={handleAddClick} className="add-btn">➕ Add Winner</button>
        <button onClick={handleExportCSV} className="export-btn">📥 Export CSV</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search by event, winner, or location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
      </div>

      <div className="winner-list">
        {events
          .filter(e =>
            e.name.toLowerCase().includes(searchTerm) ||
            e.location.toLowerCase().includes(searchTerm) ||
            e.first.toLowerCase().includes(searchTerm) ||
            e.second.toLowerCase().includes(searchTerm) ||
            e.third.toLowerCase().includes(searchTerm)
          )
          .map((event, index) => (
            <div className="event-card" key={event._id}>
              <div className="event-card-top">
                <h3>{event.name}</h3>
                <p><strong>📅 Date:</strong> {formatDate(event.date)}</p>
                <p><strong>📍 Location:</strong> {event.location}</p>
                <p><strong>👥 Participants:</strong> {event.participants}</p>
              </div>
              <div className="event-card-bottom">
                <p><strong>🥇 1st:</strong> {event.first}</p>
                <p><strong>🥈 2nd:</strong> {event.second}</p>
                <p><strong>🥉 3rd:</strong> {event.third}</p>
                <p><strong>⏱️ Least Penalty:</strong> {event.leastPenalty}</p>
                <div className="button-group">
                  <button className="edit-btn" onClick={() => handleEdit(event)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(event._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {(location.pathname === '/winners/add' || location.pathname.startsWith('/winners/edit/')) && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{isEditMode ? "Edit Winner Details" : "Add Winner Details"}</h2>
            <input type="text" name="name" placeholder="Event Name" value={formData.name} onChange={handleChange} />
            <input type="date" name="date" value={formData.date} onChange={handleChange} />
            <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
            <input type="number" name="participants" placeholder="Total Participants" value={formData.participants} onChange={handleChange} />
            <input type="text" name="first" placeholder="First Place" value={formData.first} onChange={handleChange} />
            <input type="text" name="second" placeholder="Second Place" value={formData.second} onChange={handleChange} />
            <input type="text" name="third" placeholder="Third Place" value={formData.third} onChange={handleChange} />
            <input type="text" step="1" name="leastPenalty" placeholder="Least Penalty (HH:MM:SS)" value={formData.leastPenalty} onChange={handleChange} />
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={handleCancelModal}>Cancel</button>
              <button className="submit-btn" onClick={handleSubmit}>{isEditMode ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Winners;