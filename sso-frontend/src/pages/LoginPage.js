import React from "react";
import "../App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

const LoginPage = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/github`;
  };

  return (
    <div id="login-page">
      <header id="login-header">
        <h1 id="login-title">Chào mừng đến với ứng dụng SSO Demo 🎯</h1>
      </header>

      <div id="login-content">
        <h2 id="login-subtitle">Đăng nhập để tiếp tục</h2>
        <p id="login-instruction">Chọn một phương thức đăng nhập:</p>

        <div id="login-buttons">
          <button id="google-login" onClick={handleGoogleLogin}>
            <i className="fab fa-google"></i> Đăng nhập với Google
          </button>

          <button id="github-login" onClick={handleGithubLogin}>
            <i className="fab fa-github"></i> Đăng nhập với GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
