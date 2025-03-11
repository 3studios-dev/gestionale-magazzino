const pool = require("../db");

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS operazioni (
      id SERIAL PRIMARY KEY,
      articolo_id INTEGER REFERENCES articoli(id) ON DELETE CASCADE,
      tipo_operazione VARCHAR(10) CHECK (tipo_operazione IN ('carico', 'scarico')) NOT NULL,
      quantita INTEGER NOT NULL,
      data_operazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

createTable().catch(console.error);

const getAllOperazioni = async () => {
  return await pool.query("SELECT * FROM operazioni");
};

const addOperazione = async (articolo_id, tipo_operazione, quantita) => {
  return await pool.query(
    "INSERT INTO operazioni (articolo_id, tipo_operazione, quantita) VALUES ($1, $2, $3) RETURNING *",
    [articolo_id, tipo_operazione, quantita]
  );
};

module.exports = { getAllOperazioni, addOperazione };
