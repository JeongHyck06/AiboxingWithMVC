//gameInterface.js

const URL = "https://teachablemachine.withgoogle.com/models/KJij0edsT/";

let model, webcam, ctx, labelContainer, maxPredictions;
const poses = [
  "라이트 스트레이트",
  "레프트 스트레이트",
  "라이트 훅!",
  "레프트 훅!",
  "왼쪽으로 피하기",
  "오른쪽으로 피하기",
]; // 여기에 사용할 포즈 이름을 넣으세요.

let currentPose = "";
let score = 0;
let poseInterval;
let timer;
let timeRemaining = 10;
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
    document.getElementById("score-display").innerText = "점수: " + score;
  }
  console.log("업데이트 된 점수 : ", score);
}

// init 함수를 확장하여 새 요소들을 포함하도록 합니다.
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
  setTimeout(endGame, 10000);
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
  document.getElementById("label-container").style.display = "none";
  document.getElementById("result-container").style.display = "block"; // 결과 보기 버튼 실행
  document.getElementById("score").value = parseInt(score, 10);
  console.log("폼에 설정된 점수: ", document.getElementById("score").value); // 설정된 값을 확인
}

function redirectBasedOnScore() {
  if (score >= 10) {
    window.location.href = "high-score.html";
    window.location.href = "medium-score.html";
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

    // 새로운 포즈가 맞으면 점수를 업데이트합니다.
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
