const express = require("express");
const app = express();
require("dotenv").config();
const { connectDB } = require("./db/mongo"); // 수정된 부분
app.use(express.json()); // JSON 본문을 처리
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });

    // 라우트 설정
    const mainRoutes = require("./routes/mainRoutes");
    app.use("/", mainRoutes);

    const gameRoutes = require("./routes/gameRoutes");
    app.use("/game", gameRoutes);

    const resultGameRoutes = require("./routes/resultGameRoutes");
    app.use("/resultGame", resultGameRoutes);

    const listViewRoutes = require("./routes/listViewRoutes");
    app.use("/listView", listViewRoutes);

    const userRoutes = require("./routes/userRoutes");
    app.use(userRoutes);
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });
