require('dotenv').config();
const express = require('express');
const passport = require('passport');
const cors = require('cors');

const PORT = process.env.PORT || 8080;

// --- Import cấu hình Passport ---
require('./config/passport-setup');

// --- Import routes ---
const authRoutes = require('./routes/auth-routes');
const apiRoutes = require('./routes/api-routes');

const app = express();

// --- Cho phép frontend (React) gọi API ---
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// --- Parse JSON (nếu bạn có API POST) ---
app.use(express.json());

// --- Khởi tạo Passport ---
app.use(passport.initialize());


// --- Kiểm tra server ---
app.get('/', (req, res) => {
  res.send('🚀 Server hoạt động bình thường!');
});

// --- Sử dụng các routes ---
console.log('🔄 Server đang thiết lập các routes...');
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// --- Lắng nghe cổng ---
app.listen(PORT, () => {
  console.log(`✅ Backend server đang chạy tại: http://localhost:${PORT}`);
});
