const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// Configura il database PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Usa CORS e JSON parser
app.use(cors());
app.use(express.json());

// Funzione per creare le tabelle
const createTables = async () => {
  const queryArticoli = `
    CREATE TABLE IF NOT EXISTS articoli (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      quantita INT NOT NULL DEFAULT 0,
      codice_barre VARCHAR(255) UNIQUE NOT NULL
    );
  `;
  
  const queryOperazioni = `
    CREATE TABLE IF NOT EXISTS operazioni (
      id SERIAL PRIMARY KEY,
      articolo_id INT REFERENCES articoli(id) ON DELETE CASCADE,
      tipo_operazione VARCHAR(10) CHECK (tipo_operazione IN ('carico', 'scarico')),
      quantita INT NOT NULL,
      data_operazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(queryArticoli);
    await pool.query(queryOperazioni);
    console.log("Tabelle create correttamente");
  } catch (err) {
    console.error("Errore nella creazione delle tabelle:", err);
  }
};

// Chiamata alla funzione di creazione tabelle
createTables();

// Rotte API

// 1. Visualizza tutti gli articoli
app.get("/articoli", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM articoli");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Aggiungi un articolo
app.post("/articoli", async (req, res) => {
  const { nome, quantita, codice_barre } = req.body;

  if (!nome || !quantita || !codice_barre) {
    return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO articoli (nome, quantita, codice_barre) VALUES ($1, $2, $3) RETURNING *",
      [nome, quantita, codice_barre]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Modifica la quantità di un articolo (carico/scarico)
app.put("/articoli/:id", async (req, res) => {
  const id = req.params.id;
  const { quantita } = req.body;

  if (!quantita) {
    return res.status(400).json({ error: "Quantità richiesta" });
  }

  try {
    const result = await pool.query(
      "UPDATE articoli SET quantita = quantita + $1 WHERE id = $2 RETURNING *",
      [quantita, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Articolo non trovato" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Registra un'operazione di carico/scarico
app.post("/operazioni", async (req, res) => {
  const { articolo_id, tipo_operazione, quantita } = req.body;

  if (!articolo_id || !tipo_operazione || !quantita) {
    return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
  }

  if (!["carico", "scarico"].includes(tipo_operazione)) {
    return res.status(400).json({ error: "Tipo operazione non valido" });
  }

  try {
    // Verifica che l'articolo esista
    const articolo = await pool.query("SELECT * FROM articoli WHERE id = $1", [articolo_id]);
    if (articolo.rows.length === 0) {
      return res.status(404).json({ error: "Articolo non trovato" });
    }

    // Aggiorna la quantità dell'articolo
    let updateQuery = "";
    if (tipo_operazione === "carico") {
      updateQuery = "UPDATE articoli SET quantita = quantita + $1 WHERE id = $2";
    } else if (tipo_operazione === "scarico") {
      updateQuery = "UPDATE articoli SET quantita = quantita - $1 WHERE id = $2";
    }
    await pool.query(updateQuery, [quantita, articolo_id]);

    // Registra l'operazione
    const result = await pool.query(
      "INSERT INTO operazioni (articolo_id, tipo_operazione, quantita) VALUES ($1, $2, $3) RETURNING *",
      [articolo_id, tipo_operazione, quantita]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Visualizza tutte le operazioni
app.get("/operazioni", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM operazioni");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
