const express = require("express");
const router = express.Router();
const Operazione = require("../models/operazioneModel");

router.get("/", async (req, res) => {
  const result = await Operazione.getAll();
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { articolo_id, tipo_operazione, quantita } = req.body;
  const result = await Operazione.create(articolo_id, tipo_operazione, quantita);
  res.json(result.rows[0]);
});

module.exports = router;
