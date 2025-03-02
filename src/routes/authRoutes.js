const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log("Datos de registro recibidos:", { username, password }); // Depuración
  try {
    // Verifica si el usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Si el usuario no existe, créalo
    const user = new User({ username, password });
    await user.save();

    // Genera el token JWT con un tiempo de expiración
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }); // 7 días
    console.log("Token generado:", token); // Depuración

    // Envía el token como respuesta
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    console.error("Error en /api/auth/register:", err); // Depuración
    res.status(500).json({ error: 'Error registering user', details: err.message });
  }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log('Buscando usuario:', username); // Depuración
    const user = await User.findOne({ username });
    console.log("user", user); // Depuración
    if (!user) {
      console.log('Usuario no encontrado:', username); // Depuración
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Comparando contraseña para el usuario:', username); // Depuración
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Contraseña incorrecta para el usuario:', username); // Depuración
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Generando token JWT para el usuario:', username); // Depuración
    console.log("process.env.JWT_SECRET", process.env.JWT_SECRET); // Depuración
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("Token generado:", token); // Depuración
    res.json({ token }); // Envía el token al frontend
  } catch (err) {
    console.error('Error en /api/auth/login:', err); // Depuración
    res.status(500).json({ error: 'Error logging in' });
  }
});

module.exports = router;