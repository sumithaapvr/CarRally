import React from 'react';
import './Uhome.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="overlay-content">
        <h1 className="welcome-title">Welcome to Coimbatore Auto Sports Club</h1>
        <p className="quote">"Where Speed Meets Passion"</p>
        <div className="home-description">
          <p>
            The Car Rally organized by Coimbatore Auto Sports Club is one of the most exhilarating events in South India. 
            It combines speed, skill, and spectacular views through rugged terrains.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
