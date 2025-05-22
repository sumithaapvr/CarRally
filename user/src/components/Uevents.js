import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import "./Uevents.css";
import "./Model.css"; // Add modal styling here

const Participants = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    eventId: ""
  });

  const API_URL_EVENTS = "http://localhost:5000/api/events";
  const API_URL_PARTICIPANTS = "http://localhost:5000/api/participants";

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

  const handleRegisterClick = (eventId) => {
    setSelectedEventId(eventId);
    setNewParticipant({ name: "", age: "", phone: "", email: "", eventId });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setNewParticipant({ ...newParticipant, [e.target.name]: e.target.value });
  };

  const handleAddParticipant = async () => {
    try {
      await axios.post(API_URL_PARTICIPANTS, newParticipant);
      alert("Registered successfully!");
      setShowModal(false);
    } catch (err) {
      console.error("Error adding participant", err);
    }
  };

  return (
    <div className="participant-container-user">
      <h1>🗓️ Event List</h1>

      <div className="search-section-user">
        <input
          type="text"
          placeholder="🔍 Search by name, place"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
      </div>

      <div className="participant-list-user">
        {events
          .filter((p) =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.place.toLowerCase().includes(searchTerm)
          )
          .map((p) => (
            <div className="participant-card-user" key={p._id}>
              <div className="left-section-user">
                <h3>{p.name}</h3>
                <p><strong>Date:</strong> {p.date}</p>
                <p><FaMapMarkerAlt /> {p.place}</p>
              </div>
              <div className="right-section-user">
                <p>Interested? Register Now!</p>
                <div className="card-actions-user">
                  <button onClick={() => handleRegisterClick(p._id)}>Register</button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Participant Registration</h2>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={newParticipant.name}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={newParticipant.age}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={newParticipant.phone}
              onChange={handleInputChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newParticipant.email}
              onChange={handleInputChange}
            />
            <div className="modal-buttons">
              <button onClick={handleAddParticipant}>Submit</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;
