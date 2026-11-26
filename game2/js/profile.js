const STORAGE_KEY = "neonRunnerProfiles_v2";
const LEGACY_KEY = "neonRunnerProfile_v1";

const highScoreEl = document.getElementById("highScore");
const totalPlaysEl = document.getElementById("totalPlays");
const totalGemsEl = document.getElementById("totalGems");
const playerSelect = document.getElementById("playerSelect");
const playerRankEl = document.getElementById("playerRank");

const nameModal = document.getElementById("nameModal");
const modalTitle = document.getElementById("modalTitle");
const nicknameInput = document.getElementById("nicknameInput");
const saveNameBtn = document.getElementById("saveNameBtn");
const cancelNameBtn = document.getElementById("cancelNameBtn");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const editNameBtn = document.getElementById("editNameBtn");
const resetDataBtn = document.getElementById("resetDataBtn");

// 讀取多帳號資料結構（若偵測到舊版單一存檔則自動升級匯入）
let store = JSON.parse(localStorage.getItem(STORAGE_KEY));
if (!store) {
  const legacyData = JSON.parse(localStorage.getItem(LEGACY_KEY));
  if (legacyData && legacyData.name) {
    const id = "p_" + Date.now();
    store = { activeId: id, players: [{ id, ...legacyData }] };
  } else {
    store = { activeId: null, players: [] };
  }
}

let modalMode = "create"; // "create" | "edit"

function getActivePlayer() {
  return store.players.find((p) => p.id === store.activeId) || null;
}

export function getPlayerName() {
  const p = getActivePlayer();
  return p ? p.name : "未命名玩家";
}

export function isModalOpen() {
  return nameModal.style.display === "flex";
}

export function saveAndRenderProfile() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

  // 重新渲染下拉選單
  playerSelect.innerHTML = "";
  store.players.forEach((p) => {
    const option = document.createElement("option");
    option.value = p.id;
    option.textContent = p.name;
    if (p.id === store.activeId) option.selected = true;
    playerSelect.appendChild(option);
  });

  const active = getActivePlayer();
  if (!active) return;

  highScoreEl.innerText = active.highScore;
  totalPlaysEl.innerText = active.totalPlays;
  totalGemsEl.innerText = active.totalGems;

  // 依據累積結晶計算稱號
  if (active.totalGems >= 50) {
    playerRankEl.innerText = "👑 賽博傳奇";
    playerRankEl.style.backgroundColor = "#fee440";
    playerRankEl.style.color = "#0d0d1a";
  } else if (active.totalGems >= 15) {
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
  const active = getActivePlayer();
  if (!active) return;

  active.totalPlays += 1;
  active.totalGems += sessionGems;
  if (score > active.highScore) {
    active.highScore = score;
  }
  saveAndRenderProfile();
}

function openModal(mode, allowCancel = true) {
  modalMode = mode;
  modalTitle.innerText = mode === "create" ? "新增特工檔案" : "修改特工暱稱";
  nicknameInput.value = mode === "edit" ? getPlayerName() : "";
  cancelNameBtn.style.display = allowCancel ? "block" : "none";
  nameModal.style.display = "flex";
  nicknameInput.focus();
}

export function initProfileEvents(onFirstCreateCallback) {
  // 下拉選單切換玩家
  playerSelect.addEventListener("change", (e) => {
    store.activeId = e.target.value;
    saveAndRenderProfile();
  });

  // 點擊「+ 新增」玩家
  addPlayerBtn.addEventListener("click", () => {
    openModal("create", true);
  });

  // 點擊「✏️」修改目前玩家名稱
  editNameBtn.addEventListener("click", () => {
    openModal("edit", true);
  });

  // 彈窗取消按鈕
  cancelNameBtn.addEventListener("click", () => {
    nameModal.style.display = "none";
  });

  // 彈窗確認儲存
  saveNameBtn.addEventListener("click", () => {
    const inputName = nicknameInput.value.trim();
    if (!inputName) {
      alert("請輸入玩家暱稱！");
      return;
    }

    const isFirstEver = store.players.length === 0;

    if (modalMode === "create") {
      const newId = "p_" + Date.now();
      store.players.push({
        id: newId,
        name: inputName,
        highScore: 0,
        totalPlays: 0,
        totalGems: 0
      });
      store.activeId = newId;
    } else if (modalMode === "edit") {
      const active = getActivePlayer();
      if (active) active.name = inputName;
    }

    saveAndRenderProfile();
    nameModal.style.display = "none";

    if (isFirstEver && onFirstCreateCallback) {
      onFirstCreateCallback();
    }
  });

  // 刪除目前選中的玩家帳號
  resetDataBtn.addEventListener("click", () => {
    const active = getActivePlayer();
    if (!active) return;

    if (confirm(`確定要刪除「${active.name}」的所有戰績存檔嗎？`)) {
      store.players = store.players.filter((p) => p.id !== active.id);
      if (store.players.length > 0) {
        store.activeId = store.players[0].id;
        saveAndRenderProfile();
      } else {
        store.activeId = null;
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    }
  });

  // 初始化檢查
  if (store.players.length === 0) {
    openModal("create", false); // 完全沒帳號時強制建立第一個（隱藏取消鈕）
    return false;
  } else {
    if (!getActivePlayer()) store.activeId = store.players[0].id;
    saveAndRenderProfile();
    return true;
  }
}
