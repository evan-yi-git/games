const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const restartBtn = document.getElementById("restartBtn");

const GROUND_Y = 260;
const GRAVITY = 0.65;

let score = 0;
let highScore = localStorage.getItem("neonRunnerHighScore") || 0;
highScoreEl.innerText = highScore;

let gameSpeed = 6;
let frameCount = 0;
let isGameOver = false;
let animationId;

// 玩家角色設定
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
let bgOffset = 0;

// 跳躍控制（支援二段跳）
function jump() {
  if (isGameOver) return;
  if (player.jumpCount < player.maxJumps) {
    player.vy = player.jumpForce;
    player.jumpCount++;
    createJumpParticles(player.x + player.width / 2, player.y + player.height);
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    jump();
  }
});

canvas.addEventListener("mousedown", jump);
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  jump();
}, { passive: false });

// 跳躍粒子特效
function createJumpParticles(x, y) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 4 - 2,
      vy: Math.random() * 2 + 1,
      life: 20,
      color: player.jumpCount === 2 ? "#fee440" : "#00f5d4"
    });
  }
}

// 生成障礙物與加分結晶
function spawnEntities() {
  // 障礙物生成間隔隨速度調整
  const spawnRate = Math.max(55, Math.floor(110 - gameSpeed * 3));
  if (frameCount % spawnRate === 0 && Math.random() < 0.85) {
    const type = Math.random();
    if (type < 0.55) {
      // 地面尖刺
      obstacles.push({
        x: canvas.width,
        y: GROUND_Y - 35,
        width: 28,
        height: 35,
        kind: "spike"
      });
    } else if (type < 0.85) {
      // 雙連高牆（需二段跳）
      obstacles.push({
        x: canvas.width,
        y: GROUND_Y - 62,
        width: 30,
        height: 62,
        kind: "wall"
      });
    } else {
      // 空中無人機（可從下方跑過或大跳躍過）
      obstacles.push({
        x: canvas.width,
        y: GROUND_Y - 75,
        width: 38,
        height: 24,
        kind: "drone"
      });
    }
  }

  // 隨機生成能量結晶 (+50分)
  if (frameCount % 90 === 0 && Math.random() < 0.6) {
    gems.push({
      x: canvas.width,
      y: GROUND_Y - 70 - Math.random() * 70,
      size: 12
    });
  }
}

// 繪製捲動背景網格與地板
function drawBackground() {
  bgOffset = (bgOffset - gameSpeed * 0.4) % 40;
  ctx.strokeStyle = "rgba(0, 245, 212, 0.08)";
  ctx.lineWidth = 1;

  for (let x = bgOffset; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, GROUND_Y);
    ctx.stroke();
  }

  // 霓虹地板線
  ctx.fillStyle = "#161632";
  ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

  ctx.strokeStyle = "#00f5d4";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.stroke();
}

// 碰撞偵測（略微縮小判定框增加手感寬容度）
function isColliding(a, b) {
  const pad = 4;
  return (
    a.x + pad < b.x + b.width - pad &&
    a.x + a.width - pad > b.x + pad &&
    a.y + pad < b.y + b.height - pad &&
    a.y + a.height - pad > b.y + pad
  );
}

function update() {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  frameCount++;

  // 隨時間推進增加分數與速度
  if (frameCount % 5 === 0) {
    score++;
    scoreEl.innerText = score;
  }
  gameSpeed = 6 + Math.min(8, score * 0.004);

  drawBackground();

  // 更新玩家物理狀態
  player.vy += GRAVITY;
  player.y += player.vy;

  if (player.y + player.height >= GROUND_Y) {
    player.y = GROUND_Y - player.height;
    player.vy = 0;
    player.jumpCount = 0;
  }

  // 繪製玩家方塊（帶有發光外框與護目鏡）
  ctx.shadowBlur = 12;
  ctx.shadowColor = player.color;
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#0d0d1a";
  ctx.fillRect(player.x + 20, player.y + 8, 12, 8);

  // 更新粒子特效
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 4, 4);
    if (p.life <= 0) particles.splice(i, 1);
  }

  spawnEntities();

  // 更新並繪製能量結晶
  for (let i = gems.length - 1; i >= 0; i--) {
    let g = gems[i];
    g.x -= gameSpeed;

    ctx.fillStyle = "#fee440";
    ctx.beginPath();
    ctx.moveTo(g.x, g.y - g.size);
    ctx.lineTo(g.x + g.size, g.y);
    ctx.lineTo(g.x, g.y + g.size);
    ctx.lineTo(g.x - g.size, g.y);
    ctx.closePath();
    ctx.fill();

    // 吃結晶判定
    const gemBox = { x: g.x - g.size, y: g.y - g.size, width: g.size * 2, height: g.size * 2 };
    if (isColliding(player, gemBox)) {
      score += 50;
      scoreEl.innerText = score;
      gems.splice(i, 1);
      continue;
    }

    if (g.x + g.size < 0) gems.splice(i, 1);
  }

  // 更新並繪製障礙物
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.x -= gameSpeed;

    ctx.fillStyle = "#f15bb5";
    if (obs.kind === "spike") {
      ctx.beginPath();
      ctx.moveTo(obs.x, obs.y + obs.height);
      ctx.lineTo(obs.x + obs.width / 2, obs.y);
      ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }

    if (isColliding(player, obs)) {
      endGame();
      return;
    }

    if (obs.x + obs.width < 0) obstacles.splice(i, 1);
  }

  animationId = requestAnimationFrame(update);
}

function endGame() {
  isGameOver = true;
  cancelAnimationFrame(animationId);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("neonRunnerHighScore", highScore);
    highScoreEl.innerText = highScore;
  }

  ctx.fillStyle = "rgba(13, 13, 26, 0.75)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f15bb5";
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("系統過載！遊戲結束", canvas.width / 2, canvas.height / 2 - 15);

  ctx.fillStyle = "#ffffff";
  ctx.font = "20px sans-serif";
  ctx.fillText(`本次得分：${score}  |  最高紀錄：${highScore}`, canvas.width / 2, canvas.height / 2 + 25);

  restartBtn.style.display = "block";
}

function resetGame() {
  score = 0;
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

update();
