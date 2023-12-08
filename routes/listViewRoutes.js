const express = require("express");
const router = express.Router();
const listViewController = require("../controllers/listViewController");

router.get("/", listViewController.getList);

module.exports = router;
