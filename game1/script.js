const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const restartBtn = document.getElementById("restartBtn");

let score = 0;
let lives = 3;
let isGameOver = false;
let animationId;

const player = {
  width: 70,
  height: 15,
  x: canvas.width / 2 - 35,
  y: canvas.height - 30,
  speed: 7,
  dx: 0
};

let items = [];

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") player.dx = -player.speed;
  if (e.key === "ArrowRight") player.dx = player.speed;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") player.dx = 0;
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  player.x = mouseX - player.width / 2;
  keepPlayerInBounds();
});

function keepPlayerInBounds() {
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function spawnItem() {
  if (Math.random() < 0.03) {
    const isBomb = Math.random() < 0.25;
    items.push({
      x: Math.random() * (canvas.width - 20) + 10,
      y: -15,
      radius: 10,
      speed: 2.5 + Math.random() * 2 + (score * 0.05),
      type: isBomb ? "bomb" : "coin"
    });
  }
}

function update() {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.x += player.dx;
  keepPlayerInBounds();
  ctx.fillStyle = "#4ecca3";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  spawnItem();
  for (let i = items.length - 1; i >= 0; i--) {
    let item = items[i];
    item.y += item.speed;

    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    ctx.fillStyle = item.type === "coin" ? "#f9d423" : "#e94560";
    ctx.fill();
    ctx.closePath();

    if (
      item.y + item.radius >= player.y &&
      item.y - item.radius <= player.y + player.height &&
      item.x >= player.x &&
      item.x <= player.x + player.width
    ) {
      if (item.type === "coin") {
        score += 10;
        scoreEl.innerText = score;
      } else {
        lives -= 1;
        livesEl.innerText = lives;
        if (lives <= 0) endGame();
      }
      items.splice(i, 1);
      continue;
    }

    if (item.y - item.radius > canvas.height) {
      items.splice(i, 1);
    }
  }

  animationId = requestAnimationFrame(update);
}

function endGame() {
  isGameOver = true;
  cancelAnimationFrame(animationId);
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("遊戲結束！", canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = "20px sans-serif";
  ctx.fillText("最終得分: " + score, canvas.width / 2, canvas.height / 2 + 25);
  restartBtn.style.display = "block";
}

function resetGame() {
  score = 0;
  lives = 3;
  items = [];
  isGameOver = false;
  scoreEl.innerText = score;
  livesEl.innerText = lives;
  restartBtn.style.display = "none";
  update();
}

update();
