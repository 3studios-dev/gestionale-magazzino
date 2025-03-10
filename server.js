const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// Configura il database PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Necessario per Railway
  application_name: 'gestionale-magazzino',
  timezone: 'Europe/Rome', // Imposta il fuso orario corretto
});

// Middleware
app.use(cors());
app.use(express.json());

// Test API
app.get("/", (req, res) => {
  res.send("Gestionale Magazzino API");
});

// Test connessione database
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Visualizzare tutti gli articoli
app.get("/articoli", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM articoli");
    res.json(result.rows);
  } catch (err) {
    console.error("Errore nel recupero degli articoli:", err);
    res.status(500).json({ error: "Errore nel recupero degli articoli" });
  }
});

// Aggiungere un nuovo articolo
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
    console.error("Errore nell'aggiunta dell'articolo:", err);
    res.status(500).json({ error: "Errore nell'aggiunta dell'articolo" });
  }
});

// Eseguire operazioni di carico/sgarico
app.post("/operazioni", async (req, res) => {
  const { articolo_id, quantita, tipo_operazione } = req.body;
  
  if (!articolo_id || !quantita || !tipo_operazione) {
    return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
  }
  
  try {
    // Recupera l'articolo
    const result = await pool.query("SELECT * FROM articoli WHERE id = $1", [articolo_id]);
    const articolo = result.rows[0];
    
    if (!articolo) {
      return res.status(404).json({ error: "Articolo non trovato" });
    }

    let newQuantita;
    if (tipo_operazione === "carico") {
      newQuantita = articolo.quantita + quantita;
    } else if (tipo_operazione === "scarico") {
      newQuantita = articolo.quantita - quantita;
    } else {
      return res.status(400).json({ error: "Tipo operazione non valido" });
    }

    // Aggiorna l'articolo nel database
    const updateResult = await pool.query(
      "UPDATE articoli SET quantita = $1 WHERE id = $2 RETURNING *",
      [newQuantita, articolo_id]
    );

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error("Errore nell'operazione di carico/sgarico:", err);
    res.status(500).json({ error: "Errore nell'operazione di carico/sgarico" });
  }
});

// Impostare il server per ascoltare sulla porta desiderata
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
