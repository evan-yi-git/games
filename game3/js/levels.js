export function getLevelData(index) {
  const levels = [
    // ================= 第 1 關：元素試煉 =================
    {
      title: "第 1 關：元素試煉",
      iceStart: { x: 45, y: 390 },
      fireStart: { x: 95, y: 390 },
      walls: [
        { x: 0, y: 0, w: 800, h: 20 },      // 頂牆
        { x: 0, y: 440, w: 800, h: 40 },    // 底層地板
        { x: 0, y: 0, w: 20, h: 480 },      // 左牆
        { x: 780, y: 0, w: 20, h: 480 },    // 右牆

        // 中層平台：往左縮短至 x: 540，右側留出 240px 挑高空間絕不撞頭！
        { x: 20, y: 310, w: 520, h: 20 },
        { x: 650, y: 375, w: 130, h: 20 },  // 右下階梯跳台

        // 頂層終點平台：左側留出 220px 挑高空間
        { x: 220, y: 185, w: 560, h: 20 },
        { x: 20, y: 245, w: 120, h: 20 }    // 左中階梯跳台
      ],
      // 池子上方完全挑高無遮擋，起跳絕對不會撞頭
      hazards: [
        { x: 220, y: 432, w: 90, h: 12, type: "fire" },    // 紅池（下方）
        { x: 560, y: 432, w: 80, h: 12, type: "ice" },     // 藍池（右下挑高區，完全無頂牆！）
        { x: 260, y: 302, w: 90, h: 12, type: "poison" }   // 綠池（中層）
      ],
      bridges: [
        { id: "bridge1", x: 140, y: 185, w: 80, h: 20, open: false }
      ],
      switches: [
        { x: 470, y: 298, w: 36, h: 12, target: "bridge1", type: "plate", active: false }
      ],
      boxes: [],
      gems: [
        { x: 265, y: 395, type: "fire", collected: false },
        { x: 600, y: 395, type: "ice", collected: false },
        { x: 305, y: 255, type: "fire", collected: false },
        { x: 305, y: 220, type: "ice", collected: false },
        { x: 430, y: 145, type: "ice", collected: false },
        { x: 520, y: 145, type: "fire", collected: false }
      ],
      doors: {
        ice: { x: 640, y: 129, w: 40, h: 56 },
        fire: { x: 700, y: 129, w: 40, h: 56 }
      }
    },

    // ================= 第 2 關：雙子神殿 =================
    {
      title: "第 2 關：雙子神殿",
      iceStart: { x: 45, y: 390 },
      fireStart: { x: 715, y: 390 },
      walls: [
        { x: 0, y: 0, w: 800, h: 20 },
        { x: 0, y: 440, w: 800, h: 40 },
        { x: 0, y: 0, w: 20, h: 480 },
        { x: 780, y: 0, w: 20, h: 480 },

        // 中央隔牆
        { x: 390, y: 345, w: 20, h: 95 },
        // 左右二層平台（上方池子移至挑高處，避免跳躍撞頭）
        { x: 20, y: 315, w: 250, h: 20 },
        { x: 530, y: 315, w: 250, h: 20 },
        // 高層平台
        { x: 200, y: 195, w: 400, h: 20 }
      ],
      hazards: [
        { x: 275, y: 432, w: 95, h: 12, type: "ice" },     // 左下藍池（上方無平台遮擋）
        { x: 430, y: 432, w: 95, h: 12, type: "fire" },    // 右下紅池（上方無平台遮擋）
        { x: 355, y: 187, w: 90, h: 12, type: "poison" }   // 頂層中央毒池
      ],
      bridges: [
        { id: "gateLeft", x: 270, y: 315, w: 120, h: 20, open: false },
        { id: "gateRight", x: 410, y: 315, w: 120, h: 20, open: false }
      ],
      switches: [
        { x: 60, y: 295, w: 24, h: 20, target: "gateRight", type: "lever", active: false, cooldown: 0 },
        { x: 700, y: 303, w: 36, h: 12, target: "gateLeft", type: "plate", active: false }
      ],
      boxes: [
        { x: 590, y: 275, w: 36, h: 36, vx: 0, vy: 0 }
      ],
      gems: [
        { x: 322, y: 395, type: "ice", collected: false },
        { x: 477, y: 395, type: "fire", collected: false },
        { x: 250, y: 150, type: "fire", collected: false },
        { x: 540, y: 150, type: "ice", collected: false }
      ],
      doors: {
        ice: { x: 345, y: 259, w: 38, h: 56 },
        fire: { x: 417, y: 259, w: 38, h: 56 }
      }
    }
  ];

  // 修正索引預設值為 levels[0]
  return JSON.parse(JSON.stringify(levels[index] || levels[0]));
}
