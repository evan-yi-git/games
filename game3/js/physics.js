import { getLevelData } from "./levels.js";
import {
  createPlayer,
  updatePlayerPhysics,
  updateBoxes,
  updateSwitches,
  checkInteractions
} from "./physics.js";
import { renderGame } from "./renderer.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const levelTitleEl = document.getElementById("levelTitle");
const iceGemsTextEl = document.getElementById("iceGemsText");
const fireGemsTextEl = document.getElementById("fireGemsText");
const levelSelect = document.getElementById("levelSelect");
const restartBtn = document.getElementById("restartBtn");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayDesc = document.getElementById("overlayDesc");
const overlayBtn = document.getElementById("overlayBtn");

let currentLevelIndex = 0;
let level = null;
let icePlayer = null;
let firePlayer = null;
let isPaused = false;
let tick = 0;
let animationId;

const keys = {};

window.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
    e.preventDefault();
  }

  // 當過關或失敗彈窗開啟時，按空白鍵直接觸發按鈕（下一關或重新挑戰）
  if (e.code === "Space" && isPaused && overlay.style.display === "flex") {
    overlayBtn.click();
    return;
  }

  keys[e.code] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

document.querySelectorAll(".pad-btns button").forEach((btn) => {
  const code = btn.dataset.key;
  const press = (e) => {
    e.preventDefault();
    keys[code] = true;
  };
  const release = (e) => {
    e.preventDefault();
    keys[code] = false;
  };

  btn.addEventListener("mousedown", press);
  btn.addEventListener("mouseup", release);
  btn.addEventListener("mouseleave", release);
  btn.addEventListener("touchstart", press, { passive: false });
  btn.addEventListener("touchend", release, { passive: false });
});

function loadLevel(index) {
  currentLevelIndex = index;
  levelSelect.value = String(index);
  level = getLevelData(index);

  icePlayer = createPlayer(level.iceStart.x, level.iceStart.y, "ice");
  firePlayer = createPlayer(level.fireStart.x, level.fireStart.y, "fire");

  levelTitleEl.innerText = level.title;
  overlay.style.display = "none";
  isPaused = false;
  updateGemHUD();
}

function updateGemHUD() {
  const iceTotal = level.gems.filter((g) => g.type === "ice").length;
  const iceGot = level.gems.filter((g) => g.type === "ice" && g.collected).length;
  const fireTotal = level.gems.filter((g) => g.type === "fire").length;
  const fireGot = level.gems.filter((g) => g.type === "fire" && g.collected).length;

  iceGemsTextEl.innerText = `${iceGot}/${iceTotal}`;
  fireGemsTextEl.innerText = `${fireGot}/${fireTotal}`;
}

function showOverlay(isWin, message) {
  isPaused = true;
  overlay.style.display = "flex";
  overlayTitle.innerText = isWin ? "🎉 關卡突破！" : "💥 挑戰失敗";
  overlayTitle.style.color = isWin ? "#ffd166" : "#f72585";
  overlayDesc.innerText = message;

  if (isWin) {
    const hasNext = currentLevelIndex + 1 < levelSelect.options.length;
    if (hasNext) {
      overlayBtn.innerText = "進入下一關 ➔（按空白鍵）";
      overlayBtn.onclick = () => loadLevel(currentLevelIndex + 1);
    } else {
      overlayTitle.innerText = "🏆 全關卡制霸！";
      overlayBtn.innerText = "從第 1 關重新挑戰（按空白鍵）";
      overlayBtn.onclick = () => loadLevel(0);
    }
  } else {
    overlayBtn.innerText = "🔄 重新挑戰本關（按空白鍵）";
    overlayBtn.onclick = () => loadLevel(currentLevelIndex);
  }
}

function gameLoop() {
  if (!isPaused) {
    tick++;

    const iceInput = {
      left: keys["KeyA"],
      right: keys["KeyD"],
      up: keys["KeyW"]
    };

    const fireInput = {
      left: keys["ArrowLeft"],
      right: keys["ArrowRight"],
      up: keys["ArrowUp"]
    };

    updatePlayerPhysics(icePlayer, iceInput, level);
    updatePlayerPhysics(firePlayer, fireInput, level);
    updateBoxes(level);
    updateSwitches([icePlayer, firePlayer], level);

    const result = checkInteractions(icePlayer, firePlayer, level);
    updateGemHUD();

    renderGame(ctx, canvas, level, icePlayer, firePlayer, tick);

    if (result.status === "dead") {
      showOverlay(false, result.reason);
    } else if (result.status === "win") {
      showOverlay(true, result.reason);
    }
  }

  animationId = requestAnimationFrame(gameLoop);
}

levelSelect.addEventListener("change", (e) => {
  loadLevel(Number(e.target.value));
});

restartBtn.addEventListener("click", () => {
  loadLevel(currentLevelIndex);
});

loadLevel(0);
gameLoop();
