const STORAGE_KEY = "neonRunnerProfile_v1";

const highScoreEl = document.getElementById("highScore");
const totalPlaysEl = document.getElementById("totalPlays");
const totalGemsEl = document.getElementById("totalGems");
const playerNameEl = document.getElementById("playerName");
const playerRankEl = document.getElementById("playerRank");

const nameModal = document.getElementById("nameModal");
const nicknameInput = document.getElementById("nicknameInput");
const saveNameBtn = document.getElementById("saveNameBtn");
const editNameBtn = document.getElementById("editNameBtn");
const resetDataBtn = document.getElementById("resetDataBtn");

let playerProfile = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  name: "",
  highScore: 0,
  totalPlays: 0,
  totalGems: 0
};

export function getPlayerName() {
  return playerProfile.name;
}

export function isModalOpen() {
  return nameModal.style.display === "flex";
}

export function saveAndRenderProfile() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playerProfile));
  playerNameEl.innerText = playerProfile.name || "未命名玩家";
  highScoreEl.innerText = playerProfile.highScore;
  totalPlaysEl.innerText = playerProfile.totalPlays;
  totalGemsEl.innerText = playerProfile.totalGems;

  if (playerProfile.totalGems >= 50) {
    playerRankEl.innerText = "👑 賽博傳奇";
    playerRankEl.style.backgroundColor = "#fee440";
    playerRankEl.style.color = "#0d0d1a";
  } else if (playerProfile.totalGems >= 15) {
    playerRankEl.innerText = "⚡ 霓虹獵人";
    playerRankEl.style.backgroundColor = "#f15bb5";
    playerRankEl.style.color = "#ffffff";
  } else {
    playerRankEl.innerText = "🔰 見習跑者";
    playerRankEl.style.backgroundColor = "#00f5d4";
    playerRankEl.style.color = "#0d0d1a";
  }
}

export function recordGameResult(score, sessionGems) {
  playerProfile.totalPlays += 1;
  playerProfile.totalGems += sessionGems;
  if (score > playerProfile.highScore) {
    playerProfile.highScore = score;
  }
  saveAndRenderProfile();
}

export function initProfileEvents(onFirstCreateCallback) {
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
    if (isFirstTime && onFirstCreateCallback) {
      onFirstCreateCallback();
    }
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

  saveAndRenderProfile();
  if (!playerProfile.name) {
    nameModal.style.display = "flex";
    return false; // 尚未建立角色，先不啟動遊戲
  }
  return true; // 已有角色，可直接啟動
}
