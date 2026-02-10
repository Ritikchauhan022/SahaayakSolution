import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import  "./App.css";


const AuthForm = ({ role }) => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(isLogin ? "Sign In Successful" : "Sign Up Successful");
  };

  return (
    <div className="auth-box">
      <h2>{role === "owner" ? "Bakery Owner" : "Bakery Professional"}</h2>

      <div className="toggle-btns">
        <button
          className={isLogin ? "active" : ""}
          onClick={() => setIsLogin(true)}
        >
          Sign In
        </button>
        <button
          className={!isLogin ? "active" : ""}
          onClick={() => setIsLogin(false)}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input type="text" placeholder="Full Name" required />
        )}
        <input type="email" placeholder="Email Address" required />
        <input type="password" placeholder="Password" required />
        {!isLogin && (
          <input type="password" placeholder="Confirm Password" required />
        )}

        <button type="submit" className="submit-btn">
          {isLogin ? "Sign In" : "Sign Up"}
        </button>

        <p className="back-link" onClick={() => navigate("/")}>
          ← Back to Home
        </p>
      </form>
    </div>
  );
};

export default AuthForm;
