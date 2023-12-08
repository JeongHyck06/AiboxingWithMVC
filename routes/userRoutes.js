// routes/userDeleteRoutes.js
const express = require("express");
const router = express.Router();
const { getDB } = require("../db/mongo");
const { ObjectId } = require("mongodb");
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// 삭제 기능
router.post("/userDelete", async (req, res) => {
  try {
    const db = getDB();
    await db
      .collection("post")
      .deleteOne({ _id: new ObjectId(req.body.userId) });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});
// 업데이트
router.post("/userUpdate", async (req, res) => {
  const { userId, name, studentId } = req.body;
  try {
    const db = getDB();
    await db
      .collection("post")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { name: name, studentId: studentId } }
      );
    logger.info(
      `사용자 업데이트 성공: ${userId}, 이름: ${name}, 학번: ${studentId}`
    );
    res.redirect("/list");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
  }
});

module.exports = router;
