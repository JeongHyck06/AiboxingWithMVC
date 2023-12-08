// gameController.js
const { ObjectId } = require("mongodb");
const { getDB } = require("../db/mongo");

// 게임 인터페이스 페이지 렌더링
exports.getGameInterface = (req, res) => {
  res.render("gameInterface");
};

// 게임 결과 처리 및 저장
exports.postGameResult = async (req, res) => {
  try {
    const db = getDB();
    const { name, studentId, score } = req.body;
    await db.collection("post").insertOne({
      name: name,
      studentId: studentId,
      score: parseInt(score, 10),
    });
    res.redirect("/listView");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing game result");
  }
};

// 게임 결과 목록 조회
exports.getGameResults = async (req, res) => {
  try {
    const results = await db
      .collection("post")
      .find()
      .sort({ score: -1 })
      .toArray();
    res.render("list", { users: results });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving game results");
  }
};
