import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from 'react-router-dom';
import { FaUser } from "react-icons/fa";
import "./ViewEventParticipants.css";

const ViewEventParticipants = () => {
  const { eventId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    bloodgroup: "",
    address: "",
    lisencenumber: "",
    eventId: eventId,
  });

  const API_URL_PARTICIPANTS = "http://localhost:5000/api/participants";

  useEffect(() => {
    fetchEventParticipants();
  }, [eventId]);

  const fetchEventParticipants = async () => {
    try {
      const res = await axios.get(`${API_URL_PARTICIPANTS}/event/${eventId}`);
      setParticipants(res.data);
    } catch (err) {
      console.error("Error fetching participants", err);
    }
  };

  const handleInputChange = (e) => {
    setNewParticipant({ ...newParticipant, [e.target.name]: e.target.value });
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(API_URL_PARTICIPANTS, newParticipant);
      alert("✅ Participant added successfully.");
      setNewParticipant({
        name: "",
        age: "",
        phone: "",
        email: "",
        bloodgroup: "",
        address: "",
        lisencenumber: "",
        eventId
      });
      fetchEventParticipants();
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert(`❌ ${err.response.data.message}`); // Duplicate license number
      } else {
        alert("❌ Error adding participant. Please try again.");
      }
    }
  };

  return (
    <div className="view-participants-container">
      <h1>Participants for Event ID: {eventId}</h1>

      <div className="add-participant-section">
        <h2>Add Participant Manually</h2>
        <form onSubmit={handleAddParticipant}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newParticipant.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={newParticipant.age}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={newParticipant.phone}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newParticipant.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="bloodgroup"
            placeholder="Blood Group"
            value={newParticipant.bloodgroup}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={newParticipant.address}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="lisencenumber"
            placeholder="License Number"
            value={newParticipant.lisencenumber}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Add</button>
        </form>
      </div>

      <div className="participants-list">
        <h2>Current Participants ({participants.length})</h2>
        {participants.length === 0 ? (
          <p>No participants added yet for this event.</p>
        ) : (
          participants.map((participant) => (
            <div key={participant._id} className="participant-item">
              <FaUser className="user-icon" />
              <span>{participant.name}</span>
              {participant.age && <span>Age: {participant.age}</span>}
              {participant.phone && <span>Phone: {participant.phone}</span>}
              {participant.email && <span>Email: {participant.email}</span>}
              {participant.bloodgroup && <span>Blood Group: {participant.bloodgroup}</span>}
              {participant.address && <span>Address: {participant.address}</span>}
              {participant.lisencenumber && <span>License no: {participant.lisencenumber}</span>}
            </div>
          ))
        )}
      </div>

      <Link to="/participants">Back to Events</Link>
    </div>
  );
};

export default ViewEventParticipants;
