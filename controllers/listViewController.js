const { getDB } = require("../db/mongo");

exports.getList = async (req, res) => {
  try {
    const db = getDB();
    let result = await db
      .collection("post")
      .find()
      .sort({ score: -1 }) // score를 기준으로 내림차순 정렬
      .toArray();

    res.render("list.ejs", { users: result });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
