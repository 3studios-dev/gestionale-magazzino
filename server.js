const express = require("express");
const cors = require("cors");
require("dotenv").config();

const articoliRoutes = require("./routes/articoliRoutes");
const operazioniRoutes = require("./routes/operazioniRoutes");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use("/articoli", articoliRoutes);
app.use("/operazioni", operazioniRoutes);

app.listen(PORT, () => console.log(`✅ Server avviato su http://localhost:${PORT}`));
