
### 시작 페이지 구현


버튼을 누르면 게임을 시작할 수 있는 페이지로 리다이렉트 됩니다

![](https://velog.velcdn.com/images/jack0507/post/32b4cbc4-6d0f-4dd9-be98-045488235e48/image.png)

 ### 게임 인터페이스 및 기능 구현
 
티쳐블머신의 모션 인식 모델을 사용하여 사용자의 자세를 인식하도록 만들었습니다

게임 시작 버튼을 누르면 화면에 웹 캠의 비디오가 나오며 포즈가 인식됩니다
 
 게임이 끝나면 점수와 함께 결과를 볼 수 있는 페이지로 갈 수 있는 버튼이 나타납니다

![](https://velog.velcdn.com/images/jack0507/post/43801e61-e493-4af0-b5cf-e595ea34a213/image.png)

### 순위 페이지 구현

#### 서버사이드 렌더링

* 서버 사이드 렌더링이란 서버에서 페이지를 그려 클라이언트(브라우저)로 보낸 후 화면에 표시하는 기법

* 데이터베이스에 데이터를 저장해서, 저장된 데이터를 가지고와서 동적으로 html 파일을 조작할 수 있다

![](https://velog.velcdn.com/images/jack0507/post/62a0e493-57e9-445d-ba5d-bdb5a341bfad/image.png)

#### 점수가 높은 순서대로 정렬

서버측에서 정렬을 하도록 코드를 수정해줍니다

```js
app.get("/list", async (req, res) => {
  try {
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
});
```
![](https://velog.velcdn.com/images/jack0507/post/dc4185ab-09d0-40b5-bd8a-7b949d139acf/image.png)

점수가 높은 순서대로 정렬됐습니다

---

### MVC 패턴 적용

> 사용자 인터페이스, 데이터 및 논리 제어를 구현하는데 널리 사용되는 소프트웨어 디자인 패턴이다


#### 현재 프로젝트 구조

![](https://velog.velcdn.com/images/jack0507/post/f14700dc-a340-4b26-ad77-6d2c66a784b0/image.png)

---

### controllers

데이터와 사용자인터페이스 요소들을 잇는 다리역할을 합니다

즉, 사용자가 데이터를 클릭하고, 수정하는 것에 대한 이벤트들을 처리하는 부분을 뜻 합니다

#### gameController.js

```js
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

```

* getGameInterface

 호출되면 gameInterface.ejs 파일을 렌더링합니다

* postGameResult

 DB에 이름, 학번, 점수를 업로드 하고 /listView 로 리다이렉트 시킵니다
 

 
#### listViewController.js

```js
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
```


* getList 

 db에서 값을 불러와 점수가 높은 순서대로 페이지에 렌더링합니다
 
#### mainController
 
```js
const path = require("path");

exports.getIndex = (req, res) => {
  res.render(path.join(__dirname, "..", "views", "index.ejs"));
};

```
* getIndex

 시작 경로로 들어오면 index.ejs 파일을 렌더링 합니다

 사실 index는 html 파일로 해도 되나, 나중을 위해 동적 ejs 파일로 했습니다

#### userController

```js
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

exports.deleteUser = async (req, res) => {
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
};

exports.updateUser = async (req, res) => {
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
};

```

* logger 

 데이터의 변경 로그들을 기록할 수 있도록 하는 기능들을 모은 객체를 생성했습니다
 
 * deleteUser 
 
 DB에서 데이터를 삭제합니다
 
 * updateUser
 
 DB에서 학번과 이름 데이터를 수정할 수 있습니다
 
### db
 
mongo 데이터 베이스를 사용하기 위한 설정들이 모여있는 파일입니다

#### mongo.js
 
```js
const { MongoClient } = require("mongodb");

let db;

const connectDB = async () => {
  const client = new MongoClient(process.env.DB_URL);
  await client.connect();
  db = client.db("users");
};

const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
};

module.exports = { connectDB, getDB };
```

* connectDB
 
 데이터베이스에 연결합니다

* getDB

 db 객체를 반환합니다
 
---
### models

#### user.js

```js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentID: { type: String, required: true },
  score: { type: Number, required: true },
});

module.exports = mongoose.model("User", userSchema);

```

사용자에 대한 DB 스키마가 정의되어있는 파일입니다

초기 개발 단계에선 사용했지만 지금은 사용하지 않는 파일입니다

나중에 사용하게 된다면 재사용을 위해 남겨두었습니다

---

### public

스타일 파일이나 스크립트와 같은 정적 파일들이 저장되어있습니다

### routes

> HTTP 요청 route와 이러한 경로에 대응하는 핸들러를 정의하는 파일들을 포함한다
이 폴더는 애플리케이션의 URL 구조를 구성하고, 각 경로에 대한 요청을 적절한 컨트롤러 함수로 라우팅하는 역할을 담당한다

---

### Views

사용자 인터페이스를 구성하는 템플릿 파일들을 포함하는 폴더입니다

![](https://velog.velcdn.com/images/jack0507/post/c4b411fd-f579-447e-a9c4-154562b6636b/image.png)

모두 ejs 라이브러리를 사용했다, 의미는 없습니다

---


#### app.js

```js
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

```

서버가 구동되는 파일입니다

---

### 배포

Cloud type 플랫폼으로 프로젝트를 배포했습니다

![](https://velog.velcdn.com/images/jack0507/post/534a8b79-a63e-40f5-ad8b-c0341c732e05/image.png)

템플릿을 결정하고 깃 저장소를 불러옵니다

![](https://velog.velcdn.com/images/jack0507/post/501bb973-a3e6-478a-8c1b-718a95e14aca/image.png)

깃 저장소가 없다면 새로 레포지토리를 만들 수 있습니다

![](https://velog.velcdn.com/images/jack0507/post/7b29ddcc-6ce1-4d01-add2-7a2367dcad18/image.png)


포트 번호와 시작 커맨드를 입력한 후 배포하기 버튼을 누르면 됩니다

![](https://velog.velcdn.com/images/jack0507/post/7bfe2200-ea7e-4c9d-8d34-71109f046d24/image.png)

몇 번 클릭으로 쉽게 배포할 수 있습니다

![](https://velog.velcdn.com/images/jack0507/post/69375519-8142-479a-a514-44c43aee57c5/image.png)

AI복싱 연습 사이트에서 코드만 조금 수정해서 이름 공모전 사이트를 제작했습니다

---

 #### 동작영상 : https://youtu.be/rMQx4-5Xo3M?si=OE6LwId7YnQb12c_

#### 기술스택 

* node.js

* Express.js

* mongoDB

* cloud type

--- 
