const express = require('express');
const mongoose = require('mongoose');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes'); // Importar las rutas de autenticación
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000', // Para desarrollo local
  'https://task-manager-frontend-sepia.vercel.app', // Para producción
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite solicitudes sin origen (como herramientas de prueba o Postman)
    if (!origin) return callback(null, true);

    // Verifica si el origen está en la lista de permitidos
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  credentials: true, // Permite enviar cookies o credenciales
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI_DOS, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Task Manager API",
      version: "1.0.0",
      description: "API para la gestión de tareas",
    },
    servers: [
      {
        url: process.env.RENDER_EXTERNAL_URL || "http://localhost:5000",
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Ruta actualizada
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Ruta de prueba para la raíz
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Rutas
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes); // Usar las rutas de autenticación

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});