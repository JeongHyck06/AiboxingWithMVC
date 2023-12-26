# 인터페이스 구현

## 시작 페이지 구현

간단한 페이지이다

버튼을 누르면 게임을 시작할 수 있는 페이지로 리다이렉트 된다

추후에 게임 방법이나 페이지의 설명 등 부가 정보를 기입할 것 같다

![](https://velog.velcdn.com/images/jack0507/post/32b4cbc4-6d0f-4dd9-be98-045488235e48/image.png)

### index.html
```
<!DOCTYPE html>
<html>
<head>
    <title>복싱 게임 시작</title>
    <link rel="stylesheet" type="text/css" href="../public/css/start.css">
</head>
<body>
    <div class="container">
        <h1>복싱 게임 시작 페이지</h1>
        <p>게임을 시작하려면 아래의 시작 버튼을 클릭하세요</p>
        <button id="startButton">시작</button>
    </div>

    <script src = "../public/js/start.js"></script>
</body>
</html>

```

### index.js

```js
document.getElementById('startButton').addEventListener('click', function() {
    window.location.href = '../view/game.html';
});
```
 쿼리 셀렉터로 startButton을 찾은 후 이벤트 리스너에서 클릭 이벤트가 감지되면 콜백함수의 코드가 실행된다
 
 ## 게임 인터페이스 및 기능 구현
 
 티쳐블머신의 모션 인식 모델을 사용하여 사용자의 자세를 인식하도록 만들었다
 
 게임 시작 버튼을 누르면 화면에 웹 캠의 비디오가 나오며 포즈가 인식된다
 
 게임이 끝나면 점수와 함께 결과를 볼 수 있는 페이지로 갈 수 있는 버튼이 나타난다

![](https://velog.velcdn.com/images/jack0507/post/43801e61-e493-4af0-b5cf-e595ea34a213/image.png)

### gameInterface.html
```
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" type="text/css" href="../public/css/game.css">
  <title>그에게 복수하기 위해 복싱이나 배우렵니다</title>
</head>

<body>
  <div id="game-container">
    <h1 style="color: white;">복싱의 기본기를 단련하세요!</h1>
    <button type="button" onclick="init()">게임 시작</button>
    <div id="timer" style="font-size: 1.5em; color: #ffffff;">남은 시간: 5초</div>
    <div id="pose-challenge"></div>
    <div id="loading" style="display: none;"><div class="spinner"></div></div>
    <div><canvas id="canvas"></canvas></div>
    <button id="redirect-button" style= "display: none;" onclick="redirectBasedOnScore()">결과보기</button>
  
    <div id="score">점수: 0</div>
    <div id="label-container"></div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js"></script>
  <script type="text/javascript" src="../public/js/game.js"> </script>
</body>

</html>
```
### gameInterface.css

모델과 웹 캠이 준비될동안 사용될 로딩 애니메이션을 구현했다

```css
body {
    font-family: 'Arial', sans-serif;
    text-align: center;
    background-color:  #333;
  }
  #game-container {
    margin: 0 auto;
    width: 90%;
    max-width: 800px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-top: 20px;
    background-color: #3b3a3a; 
  }
  #canvas {
    width: 100%;
    background-color: #3b3a3a; 
    margin-bottom: 10px;
  }
  #label-container {
    display: flex;
    justify-content: space-around;
    margin-bottom: 10px;
  }
  #pose-challenge {
    font-size: 1.5em;
    font-weight: bold;
    color: #d1d1d1;
    margin-bottom: 10px;
  }
  #score {
    font-size: 1.5em;
    font-weight: bold;
    color: #d63031;
  }
  button {
    padding: 10px 20px;
    font-size: 1em;
    margin-top: 3px;
    margin-bottom: 15px;
    cursor: pointer;
    background-color: #d63031; /* 붉은색 배경 */
    color: #fff;
    border: none;
    border-radius: 10px;
    transition: background-color 0.3s;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
  }

  .spinner {
  border: 5px solid #f3f3f3; 
  border-top: 5px solid #c11a1a;
  width: 70px;
  height: 70px;
  animation: spin 2s linear infinite;
  margin: auto;
  /* margin-top: 20px; */
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

#redirect-button {
  display: none;
  margin: auto;
  margin-bottom: 20px;
  margin-top: 20px;
}
```


### gameInterface.js
canvas 위에 웹 캠 비디오와 포즈가 나오도록 했다

``` js
const URL = "https://teachablemachine.withgoogle.com/models/KJij0edsT/";

let model, webcam, ctx, labelContainer, maxPredictions;
const poses = [
  "라이트 스트레이트",
  "레프트 스트레이트",
  "라이트 훅!",
  "레프트 훅!",
  "왼쪽으로 피하기",
  "오른쪽으로 피하기",
];
let currentPose = "";
let score = 0;
let poseInterval;
let timer;
let timeRemaining = 5;
let gameActive = false;

// 포즈 챌린지를 시작하는 함수
function startPoseChallenge() {
  pickRandomPose();
  poseInterval = setInterval(pickRandomPose, 1000); // 1초마다 포즈 변경
  gameActive = true;
}

// 무작위 포즈를 선택하는 함수
function pickRandomPose() {
  currentPose = poses[Math.floor(Math.random() * poses.length)];
  document.getElementById("pose-challenge").innerText = currentPose;
}

// 점수를 업데이트하는 함수
function updateScore() {
  // 게임이 활성화된 상태일 때만 점수를 업데이트
  if (gameActive) {
    score += 1;
    document.getElementById("score").innerText = "점수: " + score;
  }
}

// init 함수를 확장하여 새 요소들을 포함하도록
async function init() {
  document.querySelector("button").style.display = "none";

  document.getElementById("loading").style.display = "block";

  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const size = 200;
  const flip = true;
  webcam = new tmPose.Webcam(size, size, flip);

  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("loading").style.display = "none";

  const canvas = document.getElementById("canvas");
  canvas.width = size;
  canvas.height = size;
  ctx = canvas.getContext("2d");
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }

  startPoseChallenge();
  startTimer();
  setTimeout(endGame, 5000);
}

// 타이머 시작을 처리하는 함수
function startTimer() {
  timer = setInterval(updateTimer, 1000); // 1초마다 updateTimer 호출
}

// 타이머를 업데이트하는 함수
function updateTimer() {
  if (timeRemaining > 0) {
    timeRemaining -= 1; // 남은 시간 1초 감소
    document.getElementById("timer").innerText =
      "남은 시간: " + timeRemaining + "초"; // 남은 시간 표시 업데이트
  }
}

function endGame() {
  clearInterval(poseInterval); // 포즈 변경 중단
  clearInterval(timer); // 타이머 중단
  if (webcam) {
    webcam.stop(); // 웹캠 중단
  }
  gameActive = false; // 게임을 비활성화 상태로 설정
  document.getElementById("pose-challenge").innerText = "게임 종료!";
  document.getElementById("score").innerText = "최종 점수: " + score;
  document.getElementById("timer").innerText = ""; // 타이머 텍스트 제거
  document.getElementById("canvas").style.display = "none"; // 캔버스 숨기기
  document.getElementById("redirect-button").style.display = "block"; // 새 게임 버튼 표시
  document.getElementById("label-container").style.display = "none";
}

function redirectBasedOnScore() {
  if (score >= 10) {
    window.location.href = "high-score.html"; // 높은 점수용 페이지
  } else if (score >= 5) {
    window.location.href = "medium-score.html"; // 중간 점수용 페이지
  } else {
    window.location.href = "low-score.html";
  }
}
async function loop(timestamp) {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  const prediction = await model.predict(posenetOutput);

  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;

    // 새로운 포즈가 맞으면 점수를 업데이트
    if (
      prediction[i].className === currentPose &&
      prediction[i].probability > 0.7
    ) {
      updateScore();
    }
  }

  drawPose(pose);
}

function drawPose(pose) {
  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0);
    if (pose) {
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  }
}

```

필요한 기능들을 함수로 구현하여 필요시 호출해 사용한다

모델을 새로 학습하거나, 레이블이 변경된다면, 쉽게 변경할 수 있도록 레이블과 url을 변수로 지정했다


## 구동 영상

https://youtube.com/shorts/tteU0ANAuuo?si=iyaEhKAQ1dyTcMpW

---

# api 구현 / db 연결

## Express 개발환경 세팅

Nodejs와 express를 설치한다

파일을 실시간으로 업데이트 할 수 있도록 nodemon또한 설치한다

## 프로젝트 트리

![](https://velog.velcdn.com/images/jack0507/post/a529bfde-9db1-4e3c-87b4-1c4c99d2777c/image.png)

프로젝트가 더 커진다면 MVC 패턴을 적용할 예정이다

## 라우팅

* /로 접속하면 서버는 index.html 파일을 보내준다

* /game 으로 리다이렉트 되면 서버는 /gameInterface.html 파일을 보내준다

* /list 페이지로 리다이렉트 되면 서버는 /list.ejs 파일을 렌더링 한다

 db에서 값을 찾아와 랭킹 페이지를 구현할 예정이다 

```js
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/game", function (req, res) {
  res.sendFile(__dirname + "/views/gameInterface.html");
});
  
app.get("/list", async (req, res) => {
  let result = await db.collection("post").find().toArray();

  res.render("list.ejs", { users: result });
});
```

## DB 연결

```js
const url =
  "비밀이지롱";

new MongoClient(url)
  .connect()
  .then((client) => {
    console.log("DB연결성공");
    db = client.db("users");
    app.listen(8080, () => {
      console.log("http://localhost:8080 에서 서버 실행중");
    });
  })
  .catch((err) => {
    console.log(err);
  });
```

데이터베이스는 Mongodb를 사용했다

DB에 연결이 되면 서버가 실행되도록 작성했다

## 값 업로드

### gameInterface.html
```
    <form id="result-container" action="/resultGame" method="POST" style= "display: none;">
        <input type="text" id="name" name="name" placeholder="이름" required><br><br>
        <input type="text" id="studentId" name="studentId" placeholder="학번" required><br><br>
        <input type="hidden" id="score" name="score">
        <button type="submit" id=resultButton">결과 보기</button>
    </form>
```
게임이 끝난 후 canvas가 사라지면 학번과 이름을 작성할 수 있는 폼이 보여지도록 변경했다

### gameInterface.js
```js
  document.getElementById("score").value = parseInt(score, 10);

  console.log("폼에 설정된 점수: ", document.getElementById("score").value); // 설정된 값을 확인

```
score값을 score 폼에 적용한다

### app.js
```js
app.post("/resultGame", async (req, res) => {
  await db.collection("post").insertOne({
    name: req.body.name,
    studentId: req.body.studentId,
    score: req.body.score,
  });
  res.redirect("/list");
});
```



게임이 끝난 후 버튼을 눌러 /resultGamae 으로 post 요청이 들어오면 

form에 작성된 정보와 게임의 점수를 DB에 업로드 한다

업로드가 되면 /list 경로로 리다이렉트 된다

### list.ejs

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <!-- <%= JSON.stringify(users) %> -->
    <div class="white-bg">
        <% for (var i = 0; i < users.length; i++){ %>

            <div class="white-box">
              <div class="list-box">
              <h1><%= users[i].name %></h1>
              <h3><%= users[i].studentId %></h3>
              <p><%= users[i].score %></p>
            </div>
          
          <% } %> 
      </div> 
</body>
</html>
```

랭킹 페이지가 만들어질 예정이다

지금은 DB에 있는 값들만 출력하는 용도이다
## 구동 영상

https://youtu.be/D5eMSvtd0fc?si=T8CfbEBwB_BEcThU

---

# 순위 페이지 제작

## 서버사이드 렌더링

* 서버 사이드 렌더링이란 서버에서 페이지를 그려 클라이언트(브라우저)로 보낸 후 화면에 표시하는 기법

* 데이터베이스에 데이터를 저장해서, 저장된 데이터를 가지고와서 동적으로 html 파일을 조작할 수 있다

## EJS 템플릿 엔진 사용하기

* 터미널에 ```  npm install ejs``` 입력해서 ejs 라이브러리를 설치한다

* 서버 파일 상단에 아래 코드를 추가한다
```js
 app.set('view engine', 'ejs') 
```
* 데이터베이스에서 데이터 불러오고 페이지를 렌더링한다

```js
app.get("/list", async (req, res) => {
  let result = await db.collection("post").find().toArray();

  res.render("list.ejs", { users: result });
});

```
## 디자인

### list.ejs

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="css/ranking.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <!-- <%= JSON.stringify(users) %> -->
    <div class="ranking-container">
        <% for (var i = 0; i < users.length; i++) { %>
            <div class="user-box">
                <% if (i == 0) { %>
                    <span class="crown">👑</span>
                <% } else if (i == 1) { %>
                    <span class="crown">👑</span>
                <% } else if (i == 2) { %>
                    <span class="crown">👑</span>
                <% } %>
                <h2 class="user-name"><%= users[i].name %></h2>
                <p class="user-id"><%= users[i].studentId %></p>
                <p class="user-score"><%= users[i].score %></p>
            </div>
            
        <% } %> 
    </div>
    
</body>
</html>
```

ejs 라이브러리를 사용하면 html 파일 안에서 자바스크립트 문법을 쓸 수 있다

### list.css

```css
.ranking-container {
    background-color: #f9f9f9;
    padding: 20px;
    text-align: center;
}

.user-box {
    border: 1px solid #424242;
    margin-bottom: 20px;
    padding: 15px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    width: 60%; /* 박스 너비 조정 */
    margin: 20px auto; /* 중앙 정렬 */
}

.user-box:hover {
    box-shadow: 0 0 15px rgba(0,0,0,0.2);
}

.user-name {
    font-size: 1.8em; /* 폰트 크기 증가 */
    color: #333;
    margin: 10px 0; /* 여백 추가 */
}

.user-id {
    font-size: 1.2em; /* 폰트 크기 증가 */
    color: #666;
    margin: 5px 0; /* 여백 추가 */
}

.user-score {
    font-size: 1.4em; /* 폰트 크기 증가 */
    font-weight: bold; /* 굵은 글씨체 적용 */
    color: #d35400; /* 색상 변경 */
    padding: 5px 10px; /* 패딩 추가 */
    margin: 5px 0; /* 여백 조정 */
    background-color: #f9ebea; /* 배경색 추가 */
    border-radius: 5px; /* 모서리 둥글게 */
    display: inline-block; /* 배경색이 텍스트 영역에만 적용되도록 */
}

```

css 디자인을 해주었다

![](https://velog.velcdn.com/images/jack0507/post/62a0e493-57e9-445d-ba5d-bdb5a341bfad/image.png)

## 점수가 높은 순서대로 정렬

### score 값을 정수로 변경

기존 코드는 데이터 베이스에 저장될 때 문자형식으로 저장되기 때문에 정렬이 불가능합니다

그래서 업로드 될 때 score 값을 숫자 값으로 바꿔주는 코드를 추가했습니다

```js
app.post("/resultGame", async (req, res) => {
  const scoreAsNumber = parseInt(req.body.score, 10) || 0; // 문자열을 숫자로 변환

  await db.collection("post").insertOne({
    name: req.body.name,
    studentId: req.body.studentId,
    score: scoreAsNumber, // 숫자로 변환된 점수를 저장
  });

  res.redirect("/list");
});
```

![](https://velog.velcdn.com/images/jack0507/post/a8981970-268f-4656-a040-ff0fd241f059/image.png)

문자로 저장되다, 숫자로 저장되는 것을 볼 수 있다

## 정렬

기존에 테스트 했던 데이터들을 제거해준다

![
![](https://velog.velcdn.com/images/jack0507/post/973e0357-19b0-4e3c-832e-188f33bae32d/image.png)

데이터들을 추가해준다

![](https://velog.velcdn.com/images/jack0507/post/96df151a-f88e-467c-9267-289fc5964103/image.png)

서버사이드에서 정렬을 하도록 코드를 수정해준다

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

점수가 높은 순서대로 정렬됐다

---

# CRUD 원칙 적용하기

## CRUD

* C : (Create) 데이터를 생성하거나 추가한다

* R : (Read) 데아터를 읽어와 보여준다

* U : (Update) 데이터를 수정한다

* D : (Delete) 데이터를 삭제한다

유저 인터페이스에서 갖춰야 할 기능들이다

현재 순위를 볼 수 있는 페이지에서 Read 기능과 게임이 끝난 후 학번과 이름을 작성하여 데이터를 생성하는 Create 기능이 구현되어있다

>나머지 데이터 삭제 기능과 업데이트 기능을 추가할 것이다


## Delete 구현

UI의 삭제 버튼을 눌러 데이터를 삭제 할 수있도록 구현할 것이다


### list.ejs

```html
<button onclick="deleteUser('<%= users[i]._id %>')">🗑️</button>
```

버튼을 눌렀을때 deleteUser 함수를 실행한다

인자로는 해당 유저의 id가 들어갔다

### list.js

```js
function deleteUser(userId) {
  var input = prompt();
  if (input == "1111") {
    fetch("/deleteUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.reload(); // 페이지 새로고침
        }
      })
      .catch((error) => console.error("Error:", error));
    window.location.reload(); // 페이지 새로고침
  }
}

```
유저 삭제를 위한 비밀번호를 입력한 후 맞으면 

AJAX 요청을 사용하여 서버에 사용자 삭제를 요청한다

### list.css

```css
/* 삭제 버튼 스타일 */
.delete-btn {
    background-color: #f44336; /* 버튼 배경색 - 빨간색 */
    color: white; /* 글자색 - 흰색 */
    padding: 10px 15px; /* 내부 여백 */
    border: none; /* 테두리 없음 */
    border-radius: 5px; /* 둥근 모서리 */
    text-transform: uppercase; /* 대문자 변환 */
    font-weight: bold; /* 굵은 글씨체 */
    cursor: pointer; /* 마우스 포인터 변경 */
    transition: background-color 0.3s ease; /* 부드러운 색상 전환 효과 */
}

/* 삭제 버튼 호버 효과 */
.delete-btn:hover {
    background-color: #e53935; /* 호버 시 배경색 변경 */
}

#editForm button[type="button"] {
    background-color: #f44336; 
    color: white;
}
```
### app.js

```js
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
``` 
db에 요청을 반영한다



## Update 구현

수정 버튼을 누르면 모달창이 나오며 새로 학번과 이름을 입력할 수 있도록 한다

### list.ejs

```
<button onclick="openEditModal('<%= user._id %>', '<%= user.name %>', '<%= user.studentId %>')">수정</button>

```

수정 버튼을 추가했다

```
<div id="editModal" style="display:none;">
  <form id="editForm">
    <input type="hidden" id="editUserId" name="userId">
    <label for="editName">이름:</label>
    <input type="text" id="editName" name="name">
    <label for="editStudentId">학번:</label>
    <input type="text" id="editStudentId" name="studentId">
    <button type="submit">변경 저장</button>
    <button type="button" onclick="closeEditModal()">취소</button>
  </form>
</div>
```

모달창을 추가했다

### list.css

```css
/* 모달창 내부 폼 스타일 */
#editForm {
    background-color: #fff; /* 흰색 배경 */
    padding: 20px; /* 패딩 */
    border-radius: 5px; /* 둥근 모서리 */
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.25); /* 그림자 효과 */
    width: 200px; /* 너비 조정 */
    max-width: 400px; /* 최대 너비 설정 */
    width: 60%; /* 너비 비율 */
    margin: auto; /* 자동 마진으로 중앙 정렬 */
}

/* 입력 필드 스타일 */
#editForm input[type="text"] {
    width: 90%; 
    padding: 10px; 
    margin-bottom: 20px; 
    border: 1px solid #ddd; 
    border-radius: 5px; 
}

/* 버튼 스타일 */
#editForm button {
    padding: 10px 15px; 
    border: none;
    border-radius: 5px;
    cursor: pointer; 
    margin-right: 10px; 
}

#editForm button[type="submit"] {
    background-color: #4CAF50; 
    color: white; 
}

.edit-btn {
    background-color: #4CAF50; /* 버튼 배경색 */
    color: white; /* 글자색 */
    padding: 10px 15px; /* 내부 여백 */
    border: none; /* 테두리 없음 */
    border-radius: 5px; /* 둥근 모서리 */
    text-transform: uppercase; /* 대문자 변환 */
    font-weight: bold; /* 굵은 글씨체 */
    cursor: pointer; /* 마우스 포인터 변경 */
    transition: background-color 0.3s ease; /* 부드러운 색상 전환 효과 */
}

/* 수정 버튼 호버 효과 */
.edit-btn:hover {
    background-color: #45a049; /* 호버 시 배경색 변경 */
}
```

버튼 및 모달창을 디자인해주었다

![](https://velog.velcdn.com/images/jack0507/post/277b597a-2aa9-48be-87cf-7da82bf79cd5/image.png)

### list.ejs

```js
function openEditModal(userId, name, studentId) {
  document.getElementById("editUserId").value = userId;
  document.getElementById("editName").value = name;
  document.getElementById("editStudentId").value = studentId;
  document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}
```

모달을 열고 닫을 수 있는 함수들을 정의했다

```js
document.getElementById("editForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // 폼에서 데이터 가져오기
  const userId = document.getElementById("editUserId").value;
  const name = document.getElementById("editName").value;
  const studentId = document.getElementById("editStudentId").value;

  // AJAX 요청을 위한 설정
  const data = { userId, name, studentId };
  fetch("/updateUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("서버와 통신 중 문제가 발생했습니다.");
      }
    })
    .then((data) => {
      // 성공적으로 처리된 경우
      console.log("수정 성공:", data);
      closeEditModal(); // 모달창 닫기
      window.location.reload(); // 페이지 새로고침
    })
    .catch((error) => {
      console.error("수정 실패:", error);
      window.location.reload(); // 페이지 새로고침
    });
});
```

 ajax로 DB에 데이터를 수정요청한 후 페이지를 새로고침하여 변화를 반영한다
 
 ### app.js
 
 ```js
app.post("/updateUser", async (req, res) => {
  const { userId, name, studentId } = req.body;

  try {
    await db
      .collection("post")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { name: name, studentId: studentId } }
      );
    res.redirect("/list");
  } catch (err) {
    console.error(err);
  }
});
```

/updateUser로 post 요청이 들어오면 db의 데이터를 업데이트 한다

## 구동 영상

https://youtu.be/oHWJvAl8n8U?si=Sti_kt7_G-r7dtWj

---

# MVC 패턴 적용

> 사용자 인터페이스, 데이터 및 논리 제어를 구현하는데 널리 사용되는 소프트웨어 디자인 패턴이다


app.js의 길이가 더 길어지기 전에 MVC 패턴을 적용했다

동아리 행사가 끝나더라도 새로운 기능들을 추가할 수도 있기 때문이다

m (model) - v (view) -  c ( controller) 기능들을 각각 구현했다



## 기존의 app.js 코드

```js
const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const url = process.env.DB_URL;

let connectDB = require("./db/mongo.js");
connectDB
  .then((client) => {
    console.log("DB연결성공");
    db = client.db("users");
    app.listen(process.env.PORT, () => {
      console.log("http://localhost:8080 에서 서버 실행중");
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/game", function (req, res) {
  res.sendFile(__dirname + "/views/gameInterface.html");
});

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

app.post("/resultGame", async (req, res) => {
  const scoreAsNumber = parseInt(req.body.score, 10) || 0; // 문자열을 숫자로 변환

  await db.collection("post").insertOne({
    name: req.body.name,
    studentId: req.body.studentId,
    score: scoreAsNumber, // 숫자로 변환된 점수를 저장
  });

  res.redirect("/list");
});

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

```

---

## 현재 프로젝트 구조

![](https://velog.velcdn.com/images/jack0507/post/f14700dc-a340-4b26-ad77-6d2c66a784b0/image.png)

---

## controllers

>데이터와 사용자인터페이스 요소들을 잇는 다리역할을 한다 

즉, 사용자가 데이터를 클릭하고, 수정하는 것에 대한 이벤트들을 처리하는 부분을 뜻한다

### gameController.js

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

 호출되면 gameInterface.ejs 파일을 렌더링한다

* postGameResult

 DB에 이름, 학번, 점수를 업로드 하고 /listView 로 리다이렉트 시킨다
 

 
### listViewController.js

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

 db에서 값을 불러와 점수가 높은 순서대로 페이지에 렌더링한다
 
### mainController
 
```js
const path = require("path");

exports.getIndex = (req, res) => {
  res.render(path.join(__dirname, "..", "views", "index.ejs"));
};

```
* getIndex

 시작 경로로 들어오면 index.ejs 파일을 렌더링 한다

 사실 index는 html 파일로 해도 되나, 나중을 위해 동적 ejs 파일로 했다

### userController

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

 데이터의 변경 로그들을 기록할 수 있도록 하는 기능들을 모은 객체를 생성했다
 
 * deleteUser 
 
 DB에서 데이터를 삭제한다
 
 * updateUser
 
 DB에서 학번과 이름 데이터를 수정할 수 있다
 
## db
 > mongo 데이터 베이스를 사용하기 위한 설정들이 모여있는 파일이다

### mongo.js
 
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
 
 데이터베이스에 연결한다

* getDB

 db 객체를 반환한다
 
---
## models

### user.js

```js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentID: { type: String, required: true },
  score: { type: Number, required: true },
});

module.exports = mongoose.model("User", userSchema);

```

사용자에 대한 DB 스키마가 정의되어있는 파일이다

초기 개발 단계에선 사용했지만 지금은 사용하지 않는 파일이다

나중에 사용하게 된다면 재사용을 위해 남겨두었습니다

---

## public

스타일 파일이나 스크립트와 같은 정적 파일들이 저장되어있습니다

앞서 다룬 코드들이기 때문에 기록하지 않고 넘어가겠습니다


## routes

> HTTP 요청 route와 이러한 경로에 대응하는 핸들러를 정의하는 파일들을 포함한다
이 폴더는 애플리케이션의 URL 구조를 구성하고, 각 경로에 대한 요청을 적절한 컨트롤러 함수로 라우팅하는 역할을 담당한다

### gameRoutes.js

```js
const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

router.get("/", gameController.getGameInterface);

module.exports = router;

```

### listViewRoutes.js

```js
const express = require("express");
const router = express.Router();
const listViewController = require("../controllers/listViewController");

router.get("/", listViewController.getList);

module.exports = router;

```

### mainRoutes.js

```js
const express = require("express");
const router = express.Router();
const mainController = require("../controllers/mainController");

router.get("/", mainController.getIndex);

module.exports = router;

```

### resultGameRoutes.js

```js
const express = require("express");
const router = express.Router();
const gameController = require("../controllers/gameController");

router.post("/", gameController.postGameResult);

module.exports = router;

```

### userRoutes.js

```js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/userDelete", userController.deleteUser);
router.post("/userUpdate", userController.updateUser);

module.exports = router;

```

---

## Views

>  사용자 인터페이스를 구성하는 템플릿 파일들을 포함하는 폴더이다

![](https://velog.velcdn.com/images/jack0507/post/c4b411fd-f579-447e-a9c4-154562b6636b/image.png)

모두 ejs 라이브러리를 사용했다, 의미는 없다

---

## 그 외 파일들

### app.js

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

서버가 구동되는 파일이다

### .env

민감한 정보들이 설정되어있는 환경변수 파일이다

gitignore를 통해 업로드 하지 않는다

### .gitignore

깃허브에 업로드 할 때 제외할 확장자들을 설정해 놓은 파일이다


## 동작영상

https://youtu.be/rMQx4-5Xo3M?si=OE6LwId7YnQb12c_

---

# 배포

> Cloud type 플랫폼으로 프로젝트를 배포했다

![](https://velog.velcdn.com/images/jack0507/post/534a8b79-a63e-40f5-ad8b-c0341c732e05/image.png)

템플릿을 결정하고 깃 저장소를 불러온다

![](https://velog.velcdn.com/images/jack0507/post/501bb973-a3e6-478a-8c1b-718a95e14aca/image.png)

깃 저장소가 없다면 새로 레포지토리를 만들 수 있다

![](https://velog.velcdn.com/images/jack0507/post/7b29ddcc-6ce1-4d01-add2-7a2367dcad18/image.png)


포트 번호와 시작 커맨드를 입력한 후 배포하기 버튼을 누르면 된다

![](https://velog.velcdn.com/images/jack0507/post/7bfe2200-ea7e-4c9d-8d34-71109f046d24/image.png)

몇 번 클릭으로 쉽게 배포할 수 있다

![](https://velog.velcdn.com/images/jack0507/post/69375519-8142-479a-a514-44c43aee57c5/image.png)

AI복싱 연습 사이트에서 코드만 조금 수정해서 이름 공모전 사이트르 제작했다

오늘이 동아리 마지막 날이기 때문에 코드의 디테일을 챙기기 보다 빨리 배포를 해야했다

학교 축제 전 까지 코드를 수정해 재배포 해주면 된다

https://port-0-robotnameplz-9zxht12blq5zbgi8.sel4.cloudtype.app/

---

## velog 링크

https://velog.io/@jack0507/series/AI%EB%B3%B5%EC%8B%B1-%EA%B0%9C%EB%B0%9C
