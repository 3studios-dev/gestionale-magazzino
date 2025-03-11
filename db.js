const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
});

pool.connect()
  .then(() => console.log("✅ Database connesso"))
  .catch(err => console.error("❌ Errore connessione DB:", err));

module.exports = pool;
