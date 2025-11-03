import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 🔹 Khi component load → kiểm tra token và lấy thông tin user
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("⚠️ Không có token → chuyển hướng về login");
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Token không hợp lệ hoặc đã hết hạn");

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("❌ Lỗi khi tải thông tin người dùng:", err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  // 🔸 Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // 🔸 Hiển thị khi chưa có user
  if (!user) {
    return (
      <div id="homepage">
        <header id="header">
          <h1 id="title">Trang chủ</h1>
        </header>
        <div id="content">
          <h2 id="welcome">Đang tải thông tin người dùng...</h2>
        </div>
      </div>
    );
  }

  // 🔹 Lấy ảnh đại diện (ưu tiên photo, rồi photos[0].value)
  const avatarUrl =
    user.photo ||
    (user.photos && user.photos.length > 0 ? user.photos[0].value : null) ||
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // ✅ Giao diện chính
  return (
    <div id="homepage">
      <header id="header">
        <h1 id="title">Trang chủ</h1>
      </header>

      <div id="content">
        <h2 id="welcome">
          Chào mừng, {user.displayName || user.username || "Người dùng"}!
        </h2>

        <img id="avatar" src={avatarUrl} alt="User Avatar" className="avatar" />

        <p id="login-success">Bạn đã đăng nhập thành công 🎉</p>

        <button id="logout-btn" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default HomePage;
