const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

// register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });
    const user = await User.create({ email, password, name });
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    res.status(400).json({ error: 'Could not register, email may be used' });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.verifyPassword(password))) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
