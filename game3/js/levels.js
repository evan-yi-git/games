export function getLevelData(index) {
  const levels = [
    // ================= 第 1 關：元素試煉 =================
    {
      title: "第 1 關：元素試煉",
      iceStart: { x: 50, y: 390 },
      fireStart: { x: 100, y: 390 },
      walls: [
        { x: 0, y: 0, w: 800, h: 20 },      // 頂牆
        { x: 0, y: 440, w: 800, h: 40 },    // 底層地板
        { x: 0, y: 0, w: 20, h: 480 },      // 左牆
        { x: 780, y: 0, w: 20, h: 480 },    // 右牆
        // 中層平台（高度差 120px，一跳即上）
        { x: 20, y: 320, w: 580, h: 20 },
        { x: 660, y: 365, w: 120, h: 20 },  // 右側中繼跳台
        // 頂層終點平台
        { x: 180, y: 200, w: 600, h: 20 },
        { x: 20, y: 250, w: 110, h: 20 }    // 左側中繼跳台
      ],
      // 縮窄池子寬度至 90px ~ 100px，保留充足起跳與落地空間
      hazards: [
        { x: 240, y: 432, w: 95, h: 12, type: "fire" },    // 紅池
        { x: 460, y: 432, w: 95, h: 12, type: "ice" },     // 藍池
        { x: 310, y: 312, w: 100, h: 12, type: "poison" }  // 綠池
      ],
      bridges: [
        { id: "bridge1", x: 130, y: 200, w: 50, h: 20, open: false }
      ],
      switches: [
        { x: 520, y: 308, w: 32, h: 12, target: "bridge1", type: "plate", active: false }
      ],
      boxes: [],
      gems: [
        { x: 285, y: 400, type: "fire", collected: false },
        { x: 505, y: 400, type: "ice", collected: false },
        { x: 360, y: 265, type: "fire", collected: false },
        { x: 360, y: 230, type: "ice", collected: false },
        { x: 420, y: 160, type: "ice", collected: false },
        { x: 520, y: 160, type: "fire", collected: false }
      ],
      doors: {
        ice: { x: 640, y: 144, w: 40, h: 56 },
        fire: { x: 700, y: 144, w: 40, h: 56 }
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
        // 中央隔牆（降低高度至 95px，方便跳躍）
        { x: 390, y: 345, w: 20, h: 95 },
        // 左右二層平台（高度差 120px）
        { x: 20, y: 320, w: 260, h: 20 },
        { x: 520, y: 320, w: 260, h: 20 },
        // 高層平台（與二層高度差 115px）
        { x: 180, y: 205, w: 440, h: 20 }
      ],
      hazards: [
        { x: 170, y: 432, w: 105, h: 12, type: "ice" },    // 左側藍池
        { x: 525, y: 432, w: 105, h: 12, type: "fire" },   // 右側紅池
        { x: 345, y: 197, w: 100, h: 12, type: "poison" }  // 頂層中央毒池
      ],
      bridges: [
        { id: "gateLeft", x: 280, y: 320, w: 110, h: 20, open: false },
        { id: "gateRight", x: 410, y: 320, w: 110, h: 20, open: false }
      ],
      switches: [
        { x: 60, y: 300, w: 24, h: 20, target: "gateRight", type: "lever", active: false, cooldown: 0 },
        { x: 700, y: 308, w: 32, h: 12, target: "gateLeft", type: "plate", active: false }
      ],
      boxes: [
        { x: 580, y: 280, w: 36, h: 36, vx: 0, vy: 0 }
      ],
      gems: [
        { x: 220, y: 395, type: "ice", collected: false },
        { x: 575, y: 395, type: "fire", collected: false },
        { x: 240, y: 160, type: "fire", collected: false },
        { x: 540, y: 160, type: "ice", collected: false }
      ],
      doors: {
        ice: { x: 350, y: 264, w: 36, h: 56 },
        fire: { x: 414, y: 264, w: 36, h: 56 }
      }
    }
  ];

  return JSON.parse(JSON.stringify(levels[index] || levels[0]));
}
