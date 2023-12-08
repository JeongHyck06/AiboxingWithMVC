const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

router.post("/", gameController.postGameResult);

module.exports = router;
