import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = (e) => {
    e.preventDefault();

    const defaultEmail = 'adminrr@gmail.com';
    const defaultPassword = 'adMIN@rr404';

    if (email === defaultEmail && password === defaultPassword) {
      navigate('/module');  
    } else {
      setErrorMessage('Invalid login credentials');
      alert('Invalid login credentials. Please try again.');
    }
  };

  return (
    <div className="Login">
      {/* Floating Shapes */}
      <div className="decorative-shape shape1"></div>
      <div className="decorative-shape shape2"></div>
      <div className="decorative-shape shape3"></div>

      <div className="login-image"></div>
      <div className="login-wrapper">
        <div className="login-container">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
