const pool = require("../db");

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS articoli (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      quantita INTEGER NOT NULL DEFAULT 0,
      codice_barre VARCHAR(50) UNIQUE NOT NULL
    )
  `);
};

createTable().catch(console.error);

const getAllArticoli = async () => {
  return await pool.query("SELECT * FROM articoli");
};

const getArticoloById = async (id) => {
  return await pool.query("SELECT * FROM articoli WHERE id = $1", [id]);
};

const addArticolo = async (nome, quantita, codice_barre) => {
  return await pool.query(
    "INSERT INTO articoli (nome, quantita, codice_barre) VALUES ($1, $2, $3) RETURNING *",
    [nome, quantita, codice_barre]
  );
};

module.exports = { getAllArticoli, getArticoloById, addArticolo };
