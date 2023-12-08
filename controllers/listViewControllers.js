app.post("/deleteUser", async (req, res) => {
  try {
    await db
      .collection("post")
      .deleteOne({ _id: new ObjectId(req.body.userId) });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

app.post("/updateUser", async (req, res) => {
  const { userId, name, studentId } = req.body;

  try {
    await db
      .collection("post")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { name: name, studentId: studentId } }
      );
    logger.info(
      `사용자 업데이트 성공: ${userId}, 이름: ${name}, 학번: ${studentId}`
    ); // 로그 남기기

    res.redirect("/list");
  } catch (err) {
    console.error(err);
  }
});

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
