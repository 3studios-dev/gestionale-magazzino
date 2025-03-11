const pool = require('../db');

const getArticoli = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM articoli");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addArticolo = async (req, res) => {
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
};

const getArticoloById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM articoli WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Articolo non trovato" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getArticoli, addArticolo, getArticoloById };
