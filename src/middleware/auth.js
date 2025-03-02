const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log("token:", token); // Depuración
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica el token
    console.log("Token decodificado:", decoded); // Depuración
    console.log("Token expira en:", new Date(decoded.exp * 1000)); // Depuración
    req.user = decoded; // Asigna el usuario decodificado a req.user
    next(); // Continúa con la siguiente función middleware
  } catch (err) {
    console.error("Error al verificar el token:", err); // Depuración
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(400).json({ error: 'Invalid token' });
  }
};