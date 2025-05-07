import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Module from './components/Module';
import ResultCal from './components/ResultCal';
import Participants from './components/Participants';
import Winners from './components/Winners';
import Analysis from './components/Analysis';
import ViewEventParticipants from './components/ViewEventParticipants'; // Import the component

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/module" element={<Module />} />
          <Route path="/resultcal" element={<ResultCal />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/event-participants/:eventId" element={<ViewEventParticipants />} /> {/* Add this route */}
          <Route path="/winners/*" element={<WinnersRoutes />} /> {/* Use a nested route for Winners */}
          <Route path="/analysis" element={<Analysis />} />
        </Routes>
      </div>
    </Router>
  );
}

function WinnersRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Winners />} /> {/* Main Winners list */}
      <Route path="/add" element={<Winners />} /> {/* Route for adding a winner */}
      <Route path="/edit/:id" element={<Winners />} /> {/* Route for editing a winner */}
    </Routes>
  );
}

export default App;