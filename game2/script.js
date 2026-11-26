const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const totalPlaysEl = document.getElementById("totalPlays");
const totalGemsEl = document.getElementById("totalGems");
const playerNameEl = document.getElementById("playerName");
const playerRankEl = document.getElementById("playerRank");
const restartBtn = document.getElementById("restartBtn");

// 彈窗與按鈕元素
const nameModal = document.getElementById("nameModal");
const nicknameInput = document.getElementById("nicknameInput");
const saveNameBtn = document.getElementById("saveNameBtn");
const editNameBtn = document.getElementById("editNameBtn");
const resetDataBtn = document.getElementById("resetDataBtn");

// 讀取或初始化玩家個人檔案
const STORAGE_KEY = "neonRunnerProfile_v1";
let playerProfile = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  name: "",
  highScore: 0,
  totalPlays: 0,
  totalGems: 0
};

// 儲存檔案並更新畫面 UI
function saveAndRenderProfile() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playerProfile));
  playerNameEl.innerText = playerProfile.name || "未命名玩家";
  highScoreEl.innerText = playerProfile.highScore;
  totalPlaysEl.innerText = playerProfile.totalPlays;
  totalGemsEl.innerText = playerProfile.totalGems;

  // 依據累積結晶數量自動計算玩家稱號
  if (playerProfile.totalGems >= 50) {
    playerRankEl.innerText = "👑 賽博傳奇";
    playerRankEl.style.backgroundColor = "#fee440";
  } else if (playerProfile.totalGems >= 15) {
    playerRankEl.innerText = "⚡ 霓虹獵人";
    playerRankEl.style.backgroundColor = "#f15bb5";
    playerRankEl.style.color = "#fff";
  } else {
    playerRankEl.innerText = "🔰 見習跑者";
    playerRankEl.style.backgroundColor = "#00f5d4";
    playerRankEl.style.color = "#0d0d1a";
  }
}

// 彈窗事件處理
saveNameBtn.addEventListener("click", () => {
  const inputName = nicknameInput.value.trim();
  if (!inputName) {
    alert("請輸入玩家暱稱！");
    return;
  }
  const isFirstTime = !playerProfile.name;
  playerProfile.name = inputName;
  saveAndRenderProfile();
  nameModal.style.display = "none";
  if (isFirstTime) update(); // 首次建立完成後啟動遊戲
});

editNameBtn.addEventListener("click", () => {
  nicknameInput.value = playerProfile.name;
  nameModal.style.display = "flex";
});

resetDataBtn.addEventListener("click", () => {
  if (confirm("確定要清除所有個人戰績與暱稱紀錄嗎？此動作無法復原。")) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
});

// 遊戲核心變數
const GROUND_Y = 260;
const GRAVITY = 0.65;

let score = 0;
let sessionGems = 0;
let gameSpeed = 6;
let frameCount = 0;
let isGameOver = false;
let animationId;

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

function jump() {
  if (isGameOver || nameModal.style.display === "flex") return;
  if (player.jumpCount < player.maxJumps) {
    player.vy = player.jumpForce;
    player.jumpCount++;
    createJumpParticles(player.x + player.width / 2, player.y + player.height);
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    if (nameModal.style.display === "flex") return;
    e.preventDefault();
    jump();
  }
});

canvas.addEventListener("mousedown", jump);
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  jump();
}, { passive: false });

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

function spawnEntities() {
  const spawnRate = Math.max(55, Math.floor(110 - gameSpeed * 3));
  if (frameCount % spawnRate === 0 && Math.random() < 0.85) {
    const type = Math.random();
    if (type < 0.55) {
      obstacles.push({ x: canvas.width, y: GROUND_Y - 35, width: 28, height: 35, kind: "spike" });
    } else if (type < 0.85) {
      obstacles.push({ x: canvas.width, y: GROUND_Y - 62, width: 30, height: 62, kind: "wall" });
    } else {
      obstacles.push({ x: canvas.width, y: GROUND_Y - 75, width: 38, height: 24, kind: "drone" });
    }
  }

  if (frameCount % 90 === 0 && Math.random() < 0.6) {
    gems.push({
      x: canvas.width,
      y: GROUND_Y - 70 - Math.random() * 70,
      size: 12
    });
  }
}

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

  ctx.fillStyle = "#161632";
  ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

  ctx.strokeStyle = "#00f5d4";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.stroke();
}

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

  if (frameCount % 5 === 0) {
    score++;
    scoreEl.innerText = score;
  }
  gameSpeed = 6 + Math.min(8, score * 0.004);

  drawBackground();

  player.vy += GRAVITY;
  player.y += player.vy;

  if (player.y + player.height >= GROUND_Y) {
    player.y = GROUND_Y - player.height;
    player.vy = 0;
    player.jumpCount = 0;
  }

  ctx.shadowBlur = 12;
  ctx.shadowColor = player.color;
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#0d0d1a";
  ctx.fillRect(player.x + 20, player.y + 8, 12, 8);

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

    const gemBox = { x: g.x - g.size, y: g.y - g.size, width: g.size * 2, height: g.size * 2 };
    if (isColliding(player, gemBox)) {
      score += 50;
      sessionGems++;
      scoreEl.innerText = score;
      gems.splice(i, 1);
      continue;
    }

    if (g.x + g.size < 0) gems.splice(i, 1);
  }

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

  // 更新個人生涯戰績
  playerProfile.totalPlays += 1;
  playerProfile.totalGems += sessionGems;
  if (score > playerProfile.highScore) {
    playerProfile.highScore = score;
  }
  saveAndRenderProfile();

  ctx.fillStyle = "rgba(13, 13, 26, 0.78)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f15bb5";
  ctx.font = "bold 34px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("系統過載！遊戲結束", canvas.width / 2, canvas.height / 2 - 20);

  ctx.fillStyle = "#ffffff";
  ctx.font = "18px sans-serif";
  ctx.fillText(
    `特工 ${playerProfile.name} 本局得分：${score}（收集 ${sessionGems} 顆結晶）`,
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

// 啟動初始化檢查
saveAndRenderProfile();
if (!playerProfile.name) {
  nameModal.style.display = "flex"; // 首次遊玩先跳出暱稱設定
} else {
  update();
}
