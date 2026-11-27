// 關卡資料工廠函式（每次重玩回傳全新深拷貝狀態）
export function getLevelData(index) {
  const levels = [
    // ================= 第 1 關：元素試煉 =================
    {
      title: "第 1 關：元素試煉",
      iceStart: { x: 50, y: 390 },
      fireStart: { x: 100, y: 390 },
      // 固定牆壁與平台
      walls: [
        { x: 0, y: 0, w: 800, h: 20 },      // 頂牆
        { x: 0, y: 440, w: 800, h: 40 },    // 底層地板
        { x: 0, y: 0, w: 20, h: 480 },      // 左牆
        { x: 780, y: 0, w: 20, h: 480 },    // 右牆
        // 中層平台
        { x: 20, y: 310, w: 580, h: 20 },
        { x: 660, y: 350, w: 120, h: 20 },  // 右側跳台
        // 頂層終點平台
        { x: 180, y: 180, w: 600, h: 20 },
        { x: 20, y: 230, w: 110, h: 20 }    // 左側跳台
      ],
      // 危險液體池：fire(岩漿), ice(寒水), poison(毒沼-兩者皆不可碰)
      hazards: [
        { x: 240, y: 432, w: 120, h: 12, type: "fire" },   // 紅池：火過冰死
        { x: 460, y: 432, w: 120, h: 12, type: "ice" },    // 藍池：冰過火死
        { x: 300, y: 302, w: 130, h: 12, type: "poison" }  // 綠池：皆不可碰
      ],
      // 連動機關橋（由壓力板或拉桿控制）
      bridges: [
        { id: "bridge1", x: 130, y: 180, w: 50, h: 20, open: false }
      ],
      // 機關開關：plate(踩住才開), lever(觸碰切換開關)
      switches: [
        { x: 520, y: 298, w: 32, h: 12, target: "bridge1", type: "plate", active: false }
      ],
      boxes: [], // 本關無箱子
      gems: [
        { x: 290, y: 400, type: "fire", collected: false },
        { x: 510, y: 400, type: "ice", collected: false },
        { x: 355, y: 260, type: "fire", collected: false },
        { x: 355, y: 225, type: "ice", collected: false },
        { x: 420, y: 140, type: "ice", collected: false },
        { x: 520, y: 140, type: "fire", collected: false }
      ],
      doors: {
        ice: { x: 640, y: 124, w: 40, h: 56 },
        fire: { x: 700, y: 124, w: 40, h: 56 }
      }
    },

    // ================= 第 2 關：雙子神殿 =================
    {
      title: "第 2 關：雙子神殿",
      iceStart: { x: 50, y: 390 },
      fireStart: { x: 710, y: 390 },
      walls: [
        { x: 0, y: 0, w: 800, h: 20 },
        { x: 0, y: 440, w: 800, h: 40 },
        { x: 0, y: 0, w: 20, h: 480 },
        { x: 780, y: 0, w: 20, h: 480 },
        // 中央隔牆
        { x: 390, y: 330, w: 20, h: 110 },
        // 左右二層平台
        { x: 20, y: 310, w: 260, h: 20 },
        { x: 520, y: 310, w: 260, h: 20 },
        // 高層平台
        { x: 180, y: 190, w: 440, h: 20 }
      ],
      hazards: [
        { x: 150, y: 432, w: 160, h: 12, type: "ice" },    // 左側藍池（火角需推箱子或等開橋）
        { x: 490, y: 432, w: 160, h: 12, type: "fire" },   // 右側紅池
        { x: 330, y: 182, w: 140, h: 12, type: "poison" }  // 頂層中央毒池
      ],
      bridges: [
        { id: "gateLeft", x: 280, y: 310, w: 110, h: 20, open: false },
        { id: "gateRight", x: 410, y: 310, w: 110, h: 20, open: false }
      ],
      switches: [
        // 拉桿：切換右側橋梁
        { x: 60, y: 290, w: 24, h: 20, target: "gateRight", type: "lever", active: false, cooldown: 0 },
        // 壓力板：踩住開啟左側橋梁
        { x: 700, y: 298, w: 32, h: 12, target: "gateLeft", type: "plate", active: false }
      ],
      // 可推動石箱（可壓住壓力板或墊腳）
      boxes: [
        { x: 580, y: 270, w: 36, h: 36, vx: 0, vy: 0 }
      ],
      gems: [
        { x: 220, y: 395, type: "ice", collected: false },
        { x: 560, y: 395, type: "fire", collected: false },
        { x: 240, y: 145, type: "fire", collected: false },
        { x: 540, y: 145, type: "ice", collected: false }
      ],
      doors: {
        ice: { x: 350, y: 254, w: 36, h: 56 },
        fire: { x: 414, y: 254, w: 36, h: 56 }
      }
    }
  ];

  return JSON.parse(JSON.stringify(levels[index] || levels[0]));
}
