const express = require("express");
const router = express.Router();
const Articolo = require("../models/articoloModel");

router.get("/", async (req, res) => {
  const result = await Articolo.getAll();
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { nome, quantita, codice_barre } = req.body;
  const result = await Articolo.create(nome, quantita, codice_barre);
  res.json(result.rows[0]);
});

module.exports = router;
