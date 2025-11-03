console.log('✅ File api-routes.js đã được nạp!');
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Middleware xác thực JWT
const authCheck = passport.authenticate('jwt', { session: false });

// Route được bảo vệ
router.get('/user', authCheck, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  res.status(200).json({ user: req.user });
});

module.exports = router;
