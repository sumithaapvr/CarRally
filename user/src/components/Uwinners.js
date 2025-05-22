import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Uwinners.css";

const Winners = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN");
  };

  return (
    <div className="winner-container-user">
      <h1>🏆 Winners List</h1>

      <div className="search-bar-user">
        <input
          type="text"
          placeholder="🔍 Search by event, winner, or location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
      </div>

      <div className="winner-list-user">
        {events
          .filter(e =>
            e.name.toLowerCase().includes(searchTerm) ||
            e.location.toLowerCase().includes(searchTerm) ||
            e.first.toLowerCase().includes(searchTerm) ||
            e.second.toLowerCase().includes(searchTerm) ||
            e.third.toLowerCase().includes(searchTerm)
          )
          .map((event, index) => (
            <div className="event-card-user" key={event._id}>
              <div className="event-card-top-user">
                <h3>{event.name}</h3>
                <p><strong>📅 Date:</strong> {formatDate(event.date)}</p>
                <p><strong>📍 Location:</strong> {event.location}</p>
                <p><strong>👥 Participants:</strong> {event.participants}</p>
              </div>
              <div className="event-card-bottom-user">
                <p><strong>🥇 1st:</strong> {event.first}</p>
                <p><strong>🥈 2nd:</strong> {event.second}</p>
                <p><strong>🥉 3rd:</strong> {event.third}</p>
                <p><strong>⏱️ Least Penalty:</strong> {event.leastPenalty}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Winners;