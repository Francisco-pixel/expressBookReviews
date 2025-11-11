const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Configuración de sesión para /customer
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false } // Cambiar a true si usas HTTPS
}));

// Middleware de autenticación: solo para rutas /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
  // Verificar si hay sesión con token JWT
  if (req.session && req.session.jwt) {
    jwt.verify(req.session.jwt, "access_secret", (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      // Token válido → adjuntar usuario a la request
      req.user = decoded;
      next();
    });
  } else {
    return res.status(401).json({ message: "Authentication required. Please log in." });
  }
});

// Rutas
app.use("/customer", customer_routes);  // ← Debe ir DESPUÉS del middleware auth
app.use("/", genl_routes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});