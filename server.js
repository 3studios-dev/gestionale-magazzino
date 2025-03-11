const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(cors());
app.use(express.json());

// Test connessione al DB
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Importa le rotte
const articoloRoutes = require('./routes/articoloRoutes');
const operazioneRoutes = require('./routes/operazioneRoutes');

app.use('/api/articoli', articoloRoutes);
app.use('/api/operazioni', operazioneRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
