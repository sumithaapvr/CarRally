import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Uhome from './components/Uhome';
import Uevents from './components/Uevents';
import Uwinners from './components/Uwinners';
import ContactUs from './components/ContactUs';
import './App.css';

const App = () => {
  return (
    <Router>
      <div>
        <nav className="nav">
          <ul>
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
            </li>
            <li>
              <NavLink to="/uevents" className={({ isActive }) => isActive ? 'active' : ''}>Events</NavLink>
            </li>
            <li>
              <NavLink to="/uwinners" className={({ isActive }) => isActive ? 'active' : ''}>Winners</NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact Us</NavLink>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Uhome />} />
          <Route path="/uevents" element={<Uevents />} />
          <Route path="/uwinners" element={<Uwinners />} />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
