## Hệ thống SSO (Single Sign-On) – Backend (Node.js/Express) & Frontend (React)

### Giới thiệu ngắn gọn
Dự án minh họa cơ chế đăng nhập một lần (Single Sign-On – SSO) sử dụng Passport OAuth (Google, GitHub). Backend cung cấp API xác thực và phiên người dùng; Frontend (React) điều hướng người dùng qua luồng đăng nhập và hiển thị trạng thái sau khi xác thực.

### Công nghệ sử dụng
- **Ngôn ngữ**: JavaScript (Node.js cho backend), JavaScript/JSX (React cho frontend)
- **Backend**: Express, Passport, passport-google-oauth20, passport-github2, express-session, jsonwebtoken, cors, dotenv
- **Frontend**: React, react-router-dom, react-scripts (CRA)
- **CSDL (tùy chọn)**: Chưa bắt buộc trong repo này. Có thể tích hợp MongoDB/MySQL nếu cần lưu người dùng/phiên lâu dài

### Cấu trúc thư mục dự án
```
SSO/
├─ sso-backend/               # Mã nguồn backend (Node.js/Express)
│  ├─ app.js                  # Điểm vào server Express
│  ├─ config/
│  │  └─ passport-setup.js    # Cấu hình Passport strategies (Google/GitHub/JWT)
│  ├─ routes/
│  │  ├─ api-routes.js        # API endpoints dùng trong ứng dụng
│  │  └─ auth-routes.js       # Routes xác thực (điểm bắt đầu/redirect OAuth)
│  ├─ package.json            # Script chạy, dependencies backend
│  └─ .env (tạo mới)          # Biến môi trường backend (không commit)
│
└─ sso-frontend/              # Mã nguồn frontend (React)
   ├─ src/
   │  ├─ pages/
   │  │  ├─ HomePage.js       # Trang chủ
   │  │  ├─ LoginPage.js      # Trang đăng nhập (gọi tới backend SSO)
   │  │  └─ LoginSuccessPage.js # Trang sau khi đăng nhập thành công
   │  ├─ App.js, index.js     # Khởi tạo ứng dụng React
   │  └─ App.css              # Styles
   ├─ public/                 # Tài nguyên tĩnh
   ├─ package.json            # Script chạy, dependencies frontend
   └─ .env (tạo mới)          # Biến môi trường frontend (không commit)
```

### Yêu cầu môi trường
- **Node.js**: khuyến nghị >= 18.x (tương thích React 19 và Express 5)
- **npm**: đi kèm với Node (hoặc dùng `pnpm`/`yarn` nếu quen)
- **CSDL (tùy chọn)**: MongoDB hoặc MySQL nếu bạn cần lưu dữ liệu người dùng

### Cấu hình biến môi trường

Tạo file `.env` trong `sso-backend/` với các biến sau (ví dụ):
```
PORT=5000
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000

# Session/JWT
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Database (tùy chọn)
MONGODB_URI=mongodb://localhost:27017/sso
# Hoặc MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=sso
MYSQL_USER=root
MYSQL_PASSWORD=your_password
```

Tạo file `.env` trong `sso-frontend/` (nếu cần gọi API qua biến môi trường):
```
REACT_APP_API_URL=http://localhost:5000
```

Lưu ý: Tên biến bắt đầu bằng `REACT_APP_` để được React (CRA) expose vào runtime.

### Cách import database (tùy chọn)
Repo hiện tại không bắt buộc CSDL. Nếu bạn muốn lưu người dùng/phiên lâu dài, có thể chọn một trong các cách sau:

- **MongoDB**
  - Cài đặt và chạy MongoDB Community Server
  - Cập nhật `MONGODB_URI` trong `sso-backend/.env`
  - (Tùy chọn) Tạo collection `users` nếu bạn sẽ lưu hồ sơ người dùng
  - Tích hợp mã ORM/driver (ví dụ: mongoose) vào `sso-backend/app.js` và nơi cần thiết

- **MySQL**
  - Cài MySQL Server, tạo database `sso`
  - Cập nhật biến `MYSQL_*` trong `sso-backend/.env`
  - Import schema nếu có: `mysql -u root -p sso < schema.sql`
  - Tích hợp thư viện (ví dụ: `mysql2`/`sequelize`) vào backend

### Cách cấu hình kết nối DB
- Thêm thư viện phù hợp vào backend (ví dụ: `npm i mongoose` cho MongoDB, hoặc `npm i mysql2` cho MySQL)
- Đọc biến môi trường từ `.env` (đã có `dotenv`)
- Khởi tạo kết nối trong `sso-backend/app.js` hoặc tách riêng `sso-backend/config/db.js`, sau đó import vào `app.js`

Ví dụ khởi tạo MongoDB (đề xuất tách file `config/db.js`):
```js
// config/db.js
const mongoose = require('mongoose');

async function connectMongo(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('MongoDB connected');
}

module.exports = { connectMongo };
```

```js
// app.js (trích đoạn)
require('dotenv').config();
const { connectMongo } = require('./config/db');
connectMongo(process.env.MONGODB_URI);
```

### Hướng dẫn cài đặt & chạy chương trình

1) Cài dependencies
```
cd sso-backend
npm install

cd ../sso-frontend
npm install
```

2) Chạy backend (mặc định port 5000)
```
cd sso-backend
npm start
```

3) Chạy frontend (mặc định port 3000)
```
cd sso-frontend
npm start
```

4) Truy cập ứng dụng
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

### Gợi ý tích hợp OAuth Providers
- Tạo OAuth App trên Google/GitHub, cấu hình callback URL về backend, ví dụ:
  - Google: `http://localhost:5000/auth/google/callback`
  - GitHub: `http://localhost:5000/auth/github/callback`
- Điền các `CLIENT_ID`/`CLIENT_SECRET` tương ứng vào `sso-backend/.env`

### Troubleshooting nhanh
- Lỗi CORS: đảm bảo `CLIENT_URL` trùng domain/port frontend, bật `cors` trên backend
- 404 callback OAuth: kiểm tra đúng đường dẫn callback và URL trong trang cấu hình provider
- Biến môi trường không nhận: khởi động lại server sau khi thêm/chỉnh `.env`

---
Nếu cần tích hợp DB thật hoặc triển khai production, bạn có thể mở rộng phần cấu hình DB, bảo mật session/JWT, và tách cấu hình theo môi trường (`.env.development`, `.env.production`).


