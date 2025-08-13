const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET } = require('../middleware/auth');


const demoUser = {
  id: 1,
  username: 'admin',
  // password: 'admin123'
  passwordHash: bcrypt.hashSync('admin123', 10)
};

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (username !== demoUser.username) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, demoUser.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: demoUser.id, username: demoUser.username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

module.exports = router;
