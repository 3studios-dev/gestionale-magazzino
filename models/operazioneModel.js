const pool = require("../db");

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS operazioni (
      id SERIAL PRIMARY KEY,
      articolo_id INT REFERENCES articoli(id) ON DELETE CASCADE,
      tipo_operazione VARCHAR(10) CHECK (tipo_operazione IN ('carico', 'scarico')),
      quantita INT NOT NULL,
      data_operazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
};

createTable();

module.exports = {
  getAll: () => pool.query("SELECT * FROM operazioni"),
  create: (articolo_id, tipo_operazione, quantita) =>
    pool.query("INSERT INTO operazioni (articolo_id, tipo_operazione, quantita) VALUES ($1, $2, $3) RETURNING *", [articolo_id, tipo_operazione, quantita]),
};
