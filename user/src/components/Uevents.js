import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import "./Uevents.css";
import "./Model.css"; // Modal styling

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
    bloodgroup: "",
    address: "",
    lisencenumber: "",
    eventId: "",
  });
  const [isEventRegistrable, setIsEventRegistrable] = useState(true); // Used only in modal

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

  const parseCustomDate = (dateString) => {
  const [day, month, year] = dateString.split(".");
  return new Date(`${year}-${month}-${day}`);
};

const handleRegisterClick = (eventId, eventDateStr) => {
  const eventDateObj = parseCustomDate(eventDateStr);

  const currentDateObj = new Date();
  currentDateObj.setHours(0, 0, 0, 0);

  // Add 2 days to current date
  const deadlineDate = new Date(currentDateObj);
  deadlineDate.setDate(deadlineDate.getDate() + 2);

  setIsEventRegistrable(eventDateObj > deadlineDate); // Register only if more than 2 days away

  setSelectedEventId(eventId);
  setNewParticipant({
    name: "",
    age: "",
    phone: "",
    email: "",
    bloodgroup: "",
    address: "",
    lisencenumber: "",
    eventId,
  });
  setShowModal(true);
};


  const handleInputChange = (e) => {
    setNewParticipant({ ...newParticipant, [e.target.name]: e.target.value });
  };

  const handleAddParticipant = async () => {
    try {
      await axios.post(API_URL_PARTICIPANTS, newParticipant);
      alert("✅ Registered successfully!");
      setShowModal(false);
    } catch (err) {
      if (err.response?.data?.message) {
        alert(`❌ ${err.response.data.message}`);
      } else {
        alert("❌ Error registering participant.");
      }
    }
  };

const filteredEvents = events.filter((event) => {
  const eventDate = parseCustomDate(event.date);
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  return eventDate > currentDate; // only future events
});


  return (
    <div className="participant-container-user">
      <h1>🗓️ Upcoming Events</h1>

      <div className="search-section-user">
        <input
          type="text"
          placeholder="🔍 Search by name, place"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
      </div>

      <div className="participant-list-user">
        {filteredEvents
          .filter((p) =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.place.toLowerCase().includes(searchTerm)
          )
          .map((p) => {
            const isRegistrable =
              new Date(p.date) > new Date(new Date().setHours(0, 0, 0, 0));
            return (
              <div className="participant-card-user" key={p._id}>
                <div className="left-section-user">
                  <h3>{p.name}</h3>
                  <p><strong>Date:</strong> {p.date}</p>
                  <p><FaMapMarkerAlt /> {p.place}</p>
                </div>
                <div className="right-section-user">
                  <p>Interested? Register Now!</p>
                  <div className="card-actions-user">
                    <button
                      onClick={() => handleRegisterClick(p._id, p.date)}
                      disabled={!isRegistrable}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Participant Registration</h2>
            {isEventRegistrable ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddParticipant();
                }}
              >
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
                <div className="modal-buttons">
                  <button type="submit">Submit</button>
                  <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="registration-closed-message">
                <p>Registration closed for this event. Try contacting the club for more details.</p>
                <button onClick={() => setShowModal(false)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;
