import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from 'react-router-dom'; // Import Link
import { FaUser } from "react-icons/fa";
import "./ViewEventParticipants.css"; // Create this CSS file

const ViewEventParticipants = () => {
  const { eventId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    eventId: eventId, // Link participant to the event
  });
  const [file, setFile] = useState(null);
  const API_URL_PARTICIPANTS = "http://localhost:5000/api/participants"; // Backend URL for participants

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

  const handleAddParticipant = async () => {
    try {
      await axios.post(API_URL_PARTICIPANTS, newParticipant);
      setNewParticipant({ name: "", age: "", phone: "", email: "", eventId: eventId });
      fetchEventParticipants();
    } catch (err) {
      console.error("Error adding participant", err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId); // Send eventId with the file

    try {
      const res = await axios.post(`${API_URL_PARTICIPANTS}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Upload successful:", res.data);
      fetchEventParticipants(); // Refresh participant list
      setFile(null); // Clear the file input
    } catch (err) {
      console.error("Error uploading file", err);
    }
  };

  return (
    <div className="view-participants-container">
      <h1>Participants for Event ID: {eventId}</h1>

      <div className="add-participant-section">
        <h2>Add Participant Manually</h2>
        <input type="text" name="name" placeholder="Name" value={newParticipant.name} onChange={handleInputChange} />
        <input type="number" name="age" placeholder="Age" value={newParticipant.age} onChange={handleInputChange} />
        <input type="text" name="phone" placeholder="Phone" value={newParticipant.phone} onChange={handleInputChange} />
        <input type="email" name="email" placeholder="Email" value={newParticipant.email} onChange={handleInputChange} />
        <button onClick={handleAddParticipant}>Add</button>
      </div>

      <div className="upload-participants-section">
        <h2>Add Participants via File</h2>
        <input type="file" onChange={handleFileChange} accept=".csv, .xlsx" />
        <button onClick={handleUpload} disabled={!file}>Upload</button>
        <p>Supported formats: CSV, Excel</p>
      </div>

      <div className="participants-list">
        <h2>Current Participants ({participants.length})</h2> {/* Display the count here */}
        {participants.length === 0 ? (
          <p>No participants added yet for this event.</p>
        ) : (
          participants.map((participant) => (
            <div key={participant._id} className="participant-item">
              <FaUser className="user-icon" />
              <span>{participant.name}</span>
              {participant.age && <span>(Age: {participant.age})</span>}
              {participant.phone && <span>Phone: {participant.phone}</span>}
              {participant.email && <span>Email: {participant.email}</span>}
              {/* Add more participant details as needed */}
            </div>
          ))
        )}
      </div>
      <Link to="/participants">Back to Events</Link> {/* Corrected link to /participants */}
    </div>
  );
};

export default ViewEventParticipants;