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

// 雙角色鍵盤狀態紀錄
const keys = {};

window.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
    e.preventDefault();
  }
  keys[e.code] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

// 綁定下方虛擬觸控按鍵（支援手機多點觸控與滑鼠長按）
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
  levelSelect.value = index;
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
    overlayBtn.innerText = hasNext ? "進入下一關 ➔" : "從第 1 關重新挑戰";
    overlayBtn.onclick = () => {
      loadLevel(hasNext ? currentLevelIndex + 1 : 0);
    };
  } else {
    overlayBtn.innerText = "🔄 重新挑戰本關";
    overlayBtn.onclick = () => loadLevel(currentLevelIndex);
  }
}

function gameLoop() {
  if (!isPaused) {
    tick++;

    // 冰靈控制 (W A D)
    const iceInput = {
      left: keys["KeyA"],
      right: keys["KeyD"],
      up: keys["KeyW"]
    };

    // 火靈控制 (方向鍵)
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

    if (result.status === "dead") {
      renderGame(ctx, canvas, level, icePlayer, firePlayer, tick);
      showOverlay(false, result.reason);
    } else if (result.status === "win") {
      renderGame(ctx, canvas, level, icePlayer, firePlayer, tick);
      showOverlay(true, result.reason);
    } else {
      renderGame(ctx, canvas, level, icePlayer, firePlayer, tick);
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

// 啟動遊戲
loadLevel(0);
gameLoop();
