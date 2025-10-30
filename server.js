// -----------------------------
// DEPENDENCIAS
// -----------------------------
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// -----------------------------
// CONFIGURACIÓN GENERAL
// -----------------------------
const app = express();
const DB_PATH = path.join(__dirname, "data", "db.sqlite");

// Permite leer JSON en las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// -----------------------------
// BASE DE DATOS
// -----------------------------
if (!fs.existsSync(path.join(__dirname, "data"))) fs.mkdirSync(path.join(__dirname, "data"));

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    price_per_day REAL,
    image TEXT
  )`);

  // Limpiamos productos y agregamos iniciales
  db.run("DELETE FROM products", [], (err) => {
    if (err) console.error(err);

    const seed = [
      ["Tacos normales", "Soporte", 300, "/imagenes/taconormal.png"],
      ["Tacos Largos", "Soporte ", 400, "/imagenes/tacolargo.png"],
      ["Cerchas", "Cerchas metálicas", 300, "/imagenes/cerchas.png"],
      ["Teleras de 90", "Teleras grandes", 600, "/imagenes/teleragrande.png"],
      ["Teleras de 45", "Teleras medianas", 400, "/imagenes/telerapequeña.png"],
      ["Andamios", "Andamios completos", 5000, "/imagenes/andamio.png"],
      ["Tijeras", "Tijeras de soporte", 0, "/imagenes/tijeras.png"],
      ["Canes", "Canes metálicos", 1000, "/imagenes/caness.png"],
      ["Formaletas", "Formaleta", 30000, "/imagenes/formaletas.png"],
      ["Concretadoras", "Concretadoras ", 80000, "/imagenes/concretadoras.png"],
      ["Ranas", "Ranas", 60000, "/imagenes/rana.png"],
      ["Canguros", "Apisonador", 80000, "/imagenes/canguro.png"],
      ["Taladro rotomartillo pequeño", "Pequeño", 70000, "/imagenes/demoledor.png"],
      ["Taladro rotomartillo grande", "Grande", 90000, "/imagenes/rotomartillogrande.png"],
      ["Vibros", "Vibradores de concreto", 60000, "/imagenes/vibros.png"],
      ["Coches", "Coches de transporte", 15000, "/imagenes/coches.png"],
      ["Bomba de agua", "Manejable", 70000, "/imagenes/bomba.png"],
      ["Escaleras de tijera", "Escaleras plegables", 15000, "/imagenes/escaleras.png"],
      ["Escalera grande de dos cuerpos", "Escalera alta", 25000, "/imagenes/escalerotas.png"]
    ];

    const stmt = db.prepare("INSERT INTO products (title, description, price_per_day, image) VALUES (?,?,?,?)");
    seed.forEach(p => stmt.run(...p));
    stmt.finalize();
  });
});

// -----------------------------
// API PRODUCTOS
// -----------------------------
app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// -----------------------------
// FRONTEND
// -----------------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -----------------------------
// INICIO DEL SERVIDOR
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en el puerto ${PORT}`));
