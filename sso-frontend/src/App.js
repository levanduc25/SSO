import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LoginSuccessPage from "./pages/LoginSuccessPage";
import HomePage from "./pages/HomePage";


const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<PrivateRoute><HomePage /></PrivateRoute>}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/success" element={<LoginSuccessPage />} />
    </Routes>
  );
}

export default App;
