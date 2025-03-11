const pool = require("../db");

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS articoli (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      quantita INT DEFAULT 0,
      codice_barre VARCHAR(255) UNIQUE NOT NULL
    );
  `;
  await pool.query(query);
};

createTable();

module.exports = {
  getAll: () => pool.query("SELECT * FROM articoli"),
  create: (nome, quantita, codice_barre) =>
    pool.query("INSERT INTO articoli (nome, quantita, codice_barre) VALUES ($1, $2, $3) RETURNING *", [nome, quantita, codice_barre]),
};
