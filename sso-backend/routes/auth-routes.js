const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ Lỗi: JWT_SECRET chưa được định nghĩa trong file .env");
  process.exit(1);
}

// --- GOOGLE AUTH ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login/failed', session: false }),
  (req, res) => {
    console.log("🧩 [Google Callback] Thông tin user sau khi login:", req.user);
    const token = jwt.sign({ sub: req.user.uniqueId }, JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`${CLIENT_URL}/login/success?token=${token}`);
  }
);


// --- GITHUB AUTH ---
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/login/failed', session: false }),
  (req, res) => {
    console.log("🧩 [GitHub Callback] Thông tin user sau khi login:", req.user);
    const token = jwt.sign({ sub: req.user.uniqueId }, JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`${CLIENT_URL}/login/success?token=${token}`);
  }
);


// --- LOGIN STATUS ---
router.get('/login/success', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Đăng nhập thành công',
  });
});

router.get('/login/failed', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Đăng nhập thất bại. Vui lòng thử lại.',
  });
});

// --- LOGOUT ---
router.get('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Đăng xuất thành công. Vui lòng xoá token ở client.',
  });
});

module.exports = router;
