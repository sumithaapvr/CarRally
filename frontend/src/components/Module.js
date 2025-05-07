import React from 'react';
import { Link } from 'react-router-dom'; 
import './Module.css';

function Module() {
  return (
    <div className="module-page">
      <div className="image-side"></div>
      <div className="module-container">
        <div className="module-card">
          <Link to="/resultcal" className="module-link">
            <h2>Result Calculation</h2>
          </Link>
        </div>
        <div className="module-card">
          <Link to="/participants" className="module-link">
            <h2>Participants Record</h2>
          </Link>
        </div>
        <div className="module-card">
          <Link to="/winners" className="module-link">
            <h2>Winners Record</h2>
          </Link>
        </div>
        <div className="module-card">
          <Link to="/analysis" className="module-link">
            <h2>Analysis</h2>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Module;
