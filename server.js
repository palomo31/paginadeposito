// -----------------------------
// DEPENDENCIAS
// -----------------------------
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const { Resend } = require("resend");

// -----------------------------
// CONFIGURACIÓN GENERAL
// -----------------------------
const app = express();
const DB_PATH = path.join(__dirname, "data", "db.sqlite");
const OWNER_EMAIL = "alquilerequipos224@gmail.com";

// Permite leer JSON en las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// -----------------------------
// CONFIGURAR RESEND API
// -----------------------------
const resend = new Resend(process.env.RESEND_API_KEY);
console.log("🔑 RESEND_API_KEY cargada:", process.env.RESEND_API_KEY ? "Sí ✅" : "No ❌");

// 🔹 Probar conexión automática con Resend
(async () => {
  try {
    await resend.emails.send({
      from: "Cotizaciones Web <onboarding@resend.dev>",
      to: OWNER_EMAIL,
      subject: "📬 Prueba directa desde Render",
      text: "✅ Si ves este correo, la conexión con Resend está funcionando correctamente.",
    });
    console.log("✅ Correo de prueba enviado correctamente a través de Resend");
  } catch (error) {
    console.error("❌ Error en la prueba de Resend:", error.message);
  }
})();

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

  db.run(`CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    product_title TEXT,
    quantity INTEGER,
    date_from TEXT,
    date_to TEXT,
    name TEXT,
    phone TEXT,
    email TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run("DELETE FROM products", [], (err) => {
    if (err) console.error(err);
    else console.log("🗑️ Productos antiguos borrados.");

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
    console.log("📦 Productos iniciales agregados correctamente.");
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
// API COTIZACIÓN
// -----------------------------
app.post("/api/quote", async (req, res) => {
  console.log("📨 /api/quote recibida:", JSON.stringify(req.body, null, 2).slice(0, 1000));

  const q = req.body;

  if (!q.products || !Array.isArray(q.products) || q.products.length === 0)
    return res.status(400).json({ error: "Faltan productos" });

  if (!q.name || !q.phone || !q.email)
    return res.status(400).json({ error: "Faltan datos del cliente" });

  const stmt = db.prepare(`INSERT INTO quotes 
    (product_id, product_title, quantity, date_from, date_to, name, phone, email, message)
    VALUES (?,?,?,?,?,?,?,?,?)`
  );

  let emailText = `📋 NUEVA COTIZACIÓN\n\nCliente: ${q.name}\nTeléfono: ${q.phone}\nEmail: ${q.email}\nMensaje: ${q.message || "-"}\n\nProductos:\n`;

  q.products.forEach(p => {
    stmt.run(
      p.id,
      p.title,
      p.qty || 1,
      p.date_from || "-",
      p.date_to || "-",
      q.name,
      q.phone,
      q.email,
      q.message || ""
    );

    emailText += `- ${p.title}\n  Cantidad: ${p.qty || 1}\n  Desde: ${p.date_from || "-"} Hasta: ${p.date_to || "-"}\n  Subtotal: $${p.subtotal?.toLocaleString() || "-"}\n`;
  });

  stmt.finalize();

  try {
    console.log("📧 Enviando correo a:", OWNER_EMAIL);

    await resend.emails.send({
      from: "Cotizaciones Web <onboarding@resend.dev>",
      to: OWNER_EMAIL,
      subject: `Nueva cotización de ${q.name}`,
      text: emailText,
    });

    console.log("✅ Correo enviado correctamente a", OWNER_EMAIL);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error al enviar correo:", err);
    res.status(500).json({ success: false, error: err.message });
  }
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
