import { GROUND_Y, GRAVITY, drawBackground } from "./utils.js";
import { getPlayerName, isModalOpen, recordGameResult, initProfileEvents } from "./profile.js";
import {
  createJumpParticles,
  updateAndDrawParticles,
  spawnEntities,
  updateAndDrawGems,
  updateAndDrawObstacles
} from "./entities.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

let score = 0;
let sessionGems = 0;
let gameSpeed = 6;
let frameCount = 0;
let isGameOver = false;
let animationId;
let bgOffset = 0;

const player = {
  x: 80,
  y: GROUND_Y - 36,
  width: 36,
  height: 36,
  vy: 0,
  jumpForce: -12.5,
  jumpCount: 0,
  maxJumps: 2,
  color: "#00f5d4"
};

let obstacles = [];
let gems = [];
let particles = [];

function jump() {
  if (isGameOver || isModalOpen()) return;
  if (player.jumpCount < player.maxJumps) {
    player.vy = player.jumpForce;
    player.jumpCount++;
    createJumpParticles(particles, player.x + player.width / 2, player.y + player.height, player.jumpCount);
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    if (isModalOpen()) return;
    e.preventDefault();
    jump();
  }
});

canvas.addEventListener("mousedown", jump);
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  jump();
}, { passive: false });

restartBtn.addEventListener("click", resetGame);

function drawPlayer() {
  ctx.shadowBlur = 12;
  ctx.shadowColor = player.color;
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#0d0d1a";
  ctx.fillRect(player.x + 20, player.y + 8, 12, 8);
}

function update() {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  frameCount++;

  if (frameCount % 5 === 0) {
    score++;
    scoreEl.innerText = score;
  }
  gameSpeed = 6 + Math.min(8, score * 0.004);
  bgOffset = (bgOffset - gameSpeed * 0.4) % 40;

  drawBackground(ctx, canvas, bgOffset);

  player.vy += GRAVITY;
  player.y += player.vy;

  if (player.y + player.height >= GROUND_Y) {
    player.y = GROUND_Y - player.height;
    player.vy = 0;
    player.jumpCount = 0;
  }

  drawPlayer();
  updateAndDrawParticles(ctx, particles);

  spawnEntities(canvas.width, frameCount, gameSpeed, obstacles, gems);

  updateAndDrawGems(ctx, gems, gameSpeed, player, () => {
    score += 50;
    sessionGems++;
    scoreEl.innerText = score;
  });

  const hitObstacle = updateAndDrawObstacles(ctx, obstacles, gameSpeed, player);
  if (hitObstacle) {
    endGame();
    return;
  }

  animationId = requestAnimationFrame(update);
}

function endGame() {
  isGameOver = true;
  cancelAnimationFrame(animationId);

  recordGameResult(score, sessionGems);

  ctx.fillStyle = "rgba(13, 13, 26, 0.78)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f15bb5";
  ctx.font = "bold 34px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("系統過載！遊戲結束", canvas.width / 2, canvas.height / 2 - 20);

  ctx.fillStyle = "#ffffff";
  ctx.font = "18px sans-serif";
  ctx.fillText(
    `特工 ${getPlayerName()} 本局得分：${score}（收集 ${sessionGems} 顆結晶）`,
    canvas.width / 2,
    canvas.height / 2 + 20
  );

  restartBtn.style.display = "block";
}

function resetGame() {
  score = 0;
  sessionGems = 0;
  gameSpeed = 6;
  frameCount = 0;
  obstacles = [];
  gems = [];
  particles = [];
  player.y = GROUND_Y - player.height;
  player.vy = 0;
  player.jumpCount = 0;
  isGameOver = false;
  scoreEl.innerText = score;
  restartBtn.style.display = "none";
  update();
}

// 啟動初始化
const canStartImmediately = initProfileEvents(() => {
  update();
});

if (canStartImmediately) {
  update();
}
