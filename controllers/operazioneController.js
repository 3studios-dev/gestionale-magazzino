const pool = require('../db');

const addOperazione = async (req, res) => {
  const { articolo_id, tipo_operazione, quantita } = req.body;

  if (!articolo_id || !tipo_operazione || !quantita) {
    return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
  }

  try {
    const articolo = await pool.query("SELECT * FROM articoli WHERE id = $1", [articolo_id]);
    if (articolo.rows.length === 0) {
      return res.status(404).json({ error: "Articolo non trovato" });
    }

    let updateQuery = '';
    if (tipo_operazione === 'carico') {
      updateQuery = "UPDATE articoli SET quantita = quantita + $1 WHERE id = $2";
    } else if (tipo_operazione === 'scarico') {
      updateQuery = "UPDATE articoli SET quantita = quantita - $1 WHERE id = $2";
    }
    await pool.query(updateQuery, [quantita, articolo_id]);

    const result = await pool.query(
      "INSERT INTO operazioni (articolo_id, tipo_operazione, quantita) VALUES ($1, $2, $3) RETURNING *",
      [articolo_id, tipo_operazione, quantita]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOperazioni = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM operazioni");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addOperazione, getOperazioni };
