import React from 'react';
import { Link } from 'react-router-dom'; 
import './Home.css';
import logo from './assets/logo.jpg'; 

function Home() {
  return (
    <div className="Home">
      <div className="home-container">
        <div className="circle-image">
          <img src={logo} alt="RallyRoar Logo" />
        </div>

        <header className="App-header">
          <h1>RallyRoar</h1>
          <p>"Unleash the thrill, conquer every curve!"</p>
          <Link to="/login">
            <button>Get Started</button>
          </Link>
        </header>
      </div>
    </div>
  );
}

export default Home;
