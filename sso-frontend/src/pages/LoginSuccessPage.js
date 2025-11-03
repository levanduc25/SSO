import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginSuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 🔹 Lấy token từ URL sau khi redirect từ backend
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Lưu token vào localStorage
      localStorage.setItem("token", token);
      console.log("✅ Token đã được lưu. Đang chuyển hướng...");
      // Chuyển hướng ngay lập tức về trang chủ
      navigate("/");
    } else {
      // Không có token => trở về trang Login
      navigate("/");
    }
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>🔄 Đang xử lý đăng nhập...</h2>
      <p>Vui lòng đợi trong giây lát...</p>
    </div>
  );
};

export default LoginSuccessPage;
