// // routes/userRoutes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/userDelete", userController.deleteUser);
router.post("/userUpdate", userController.updateUser);

module.exports = router;
