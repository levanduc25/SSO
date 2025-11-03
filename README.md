## Hệ thống SSO (Single Sign-On) – Backend (Node.js/Express) & Frontend (React)

### 1) Giới thiệu ngắn gọn
Dự án minh họa cơ chế đăng nhập một lần (Single Sign-On – SSO) sử dụng Passport OAuth (Google, GitHub). Backend cung cấp API xác thực và phiên người dùng; Frontend (React) điều hướng người dùng qua luồng đăng nhập và hiển thị trạng thái sau khi xác thực.

### 2) Công nghệ sử dụng
- **Ngôn ngữ**: JavaScript (Node.js cho backend), JavaScript/JSX (React cho frontend)
- **Backend**: Express, Passport, passport-google-oauth20, passport-github2, express-session, jsonwebtoken, cors, dotenv, mongoose
- **Frontend**: React, react-router-dom, react-scripts (CRA)
- **CSDL (tùy chọn)**: Chưa bắt buộc trong repo này. Có thể tích hợp MongoDB/MySQL nếu cần lưu người dùng/phiên lâu dài

### 3) Cấu trúc thư mục dự án
```
SSO/
├─ sso-backend/               # Mã nguồn backend (Node.js/Express)
│  ├─ app.js                  # Điểm vào server Express
│  ├─ config/
│  │  ├─ db.js                 # Kết nối MongoDB bằng mongoose
│  │  └─ passport-setup.js    # Cấu hình Passport strategies (Google/GitHub/JWT)
│  ├─ routes/
│  │  ├─ api-routes.js        # API endpoints dùng trong ứng dụng
│  │  └─ auth-routes.js       # Routes xác thực (điểm bắt đầu/redirect OAuth)
│  ├─ models/
│  │  └─ User.js              # Mongoose model người dùng
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

### 4) Yêu cầu môi trường
- **Node.js**: khuyến nghị >= 18.x (tương thích React 19 và Express 5)
- **npm**: đi kèm với Node (hoặc dùng `pnpm`/`yarn` nếu quen)
- **CSDL (tùy chọn)**: MongoDB hoặc MySQL nếu bạn cần lưu dữ liệu người dùng

### 5) Cấu hình biến môi trường
```
PORT=8080
BACKEND_URL=http://localhost:8080
CLIENT_URL=http://localhost:3000

# Session/JWT
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Database (MongoDB)
MONGODB_URI=mongodb://localhost:27017/sso

```

Tạo file `.env` trong `sso-frontend/` (nếu cần gọi API qua biến môi trường):
```
REACT_APP_API_URL=http://localhost:8080
```

Lưu ý: Tên biến bắt đầu bằng `REACT_APP_` để được React (CRA) expose vào runtime.

### 6) Cách import database
Không bắt buộc import trước. Khi người dùng đăng nhập, bản ghi sẽ tự động được tạo/cập nhật (upsert) trong collection `users`.

- Nếu cần import mẫu, bạn có thể tạo file `seed.json` và import:
  - `mongoimport --uri "mongodb://localhost:27017/sso" --collection users --file seed.json --jsonArray`


### 7) Cách cấu hình file kết nối DB
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

### 8) Lưu người dùng vào MongoDB
Khi người dùng đăng nhập qua Google/GitHub, backend sẽ upsert bản ghi người dùng theo cặp khóa duy nhất `(provider, provider_id)` và cập nhật `last_login`.

| Trường        | Mô tả                              |
| ------------- | ---------------------------------- |
| `id`          | ID nội bộ (MongoDB ObjectId)       |
| `provider`    | `google` hoặc `github`             |
| `provider_id` | ID mà Google/GitHub cấp (duy nhất theo provider) |
| `email`       | Email xác thực từ provider         |
| `name`        | Tên hiển thị                       |
| `avatar_url`  | Ảnh đại diện                       |
| `created_at`  | Thời gian tạo                      |
| `last_login`  | Lần đăng nhập gần nhất             |

- Model: `sso-backend/models/User.js`
- Index duy nhất: `userSchema.index({ provider: 1, provider_id: 1 }, { unique: true })`
- JWT `sub` có dạng: `mongo:<_id>` và được xác thực lại từ DB ở chiến lược JWT.

### 9) Hướng dẫn cài đặt & chạy chương trình

1) Cài dependencies
```
cd sso-backend
npm install

cd ../sso-frontend
npm install
```

2) Chạy backend (mặc định port 8080 nếu không đặt PORT)
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
- Backend API: `http://localhost:8080` (hoặc theo PORT bạn đặt)

### 10) Gợi ý tích hợp OAuth Providers
- Tạo OAuth App trên Google/GitHub, cấu hình callback URL về backend, ví dụ:
  - Google: `http://localhost:8080/auth/google/callback` (hoặc `${BACKEND_URL}/auth/google/callback`)
  - GitHub: `http://localhost:8080/auth/github/callback` (hoặc `${BACKEND_URL}/auth/github/callback`)
- Điền các `CLIENT_ID`/`CLIENT_SECRET` tương ứng vào `sso-backend/.env`

### 11) Tài khoản demo
- Hệ thống dùng OAuth (Google/GitHub), không có đăng nhập username/password nội bộ.
- Demo: dùng tài khoản Google/GitHub cá nhân của bạn đã được phép truy cập ứng dụng OAuth.
- Phân quyền vai trò: chưa áp dụng (toàn bộ người dùng là "User"). Có thể mở rộng lưu `role` trong model nếu cần.

### 12) Troubleshooting nhanh
- Lỗi CORS: đảm bảo `CLIENT_URL` trùng domain/port frontend, bật `cors` trên backend
- 404 callback OAuth: kiểm tra đúng đường dẫn callback và URL trong trang cấu hình provider
- Biến môi trường không nhận: khởi động lại server sau khi thêm/chỉnh `.env`

---
Nếu cần tích hợp DB thật hoặc triển khai production, bạn có thể mở rộng phần cấu hình DB, bảo mật session/JWT, và tách cấu hình theo môi trường (`.env.development`, `.env.production`).
## 13) Kết quả (hình ảnh minh họa)
- Google
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/66d582b5-7712-4463-b9da-e1a23d45c32b" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f9382f65-8862-4e7f-bd53-ef6b008c93cc" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/4ba472a0-cc49-40ca-b8f1-209b6f654fef" />
- Github
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1fc61484-99ca-4221-9b70-f847d353db8c" />


