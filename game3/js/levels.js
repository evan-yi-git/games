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

        // 中層平台（分段設計：在 x:215~325 紅池正上方留出挑高天井，跳躍絕對不撞頭！）
        { x: 20, y: 310, w: 195, h: 20 },   // 中左平台
        { x: 325, y: 310, w: 235, h: 20 },  // 中右平台
        { x: 660, y: 375, w: 120, h: 20 },  // 右下階梯跳台

        // 頂層終點平台（在綠池 x:390~475 正上方留出挑高天井，跳綠池也不撞頭！）
        { x: 180, y: 185, w: 200, h: 20 },  // 頂左平台
        { x: 485, y: 185, w: 295, h: 20 },  // 頂右終點平台
        { x: 20, y: 245, w: 100, h: 20 }    // 左中階梯跳台
      ],
      // 所有危險池正上方皆為挑高天井，完全無遮擋
      hazards: [
        { x: 225, y: 432, w: 85, h: 12, type: "fire" },    // 第一個紅池（上方挑高無遮擋）
        { x: 565, y: 432, w: 80, h: 12, type: "ice" },     // 第二個藍池（上方挑高無遮擋）
        { x: 390, y: 302, w: 85, h: 12, type: "poison" }   // 中層綠池（上方挑高無遮擋）
      ],
      bridges: [
        { id: "bridge1", x: 120, y: 185, w: 60, h: 20, open: false }
      ],
      switches: [
        { x: 500, y: 298, w: 36, h: 12, target: "bridge1", type: "plate", active: false }
      ],
      boxes: [],
      gems: [
        { x: 268, y: 395, type: "fire", collected: false },
        { x: 605, y: 395, type: "ice", collected: false },
        { x: 432, y: 255, type: "fire", collected: false },
        { x: 432, y: 220, type: "ice", collected: false },
        { x: 530, y: 145, type: "ice", collected: false },
        { x: 585, y: 145, type: "fire", collected: false }
      ],
      doors: {
        ice: { x: 650, y: 129, w: 40, h: 56 },
        fire: { x: 710, y: 129, w: 40, h: 56 }
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

        { x: 390, y: 345, w: 20, h: 95 },
        { x: 20, y: 315, w: 250, h: 20 },
        { x: 530, y: 315, w: 250, h: 20 },
        { x: 200, y: 195, w: 400, h: 20 }
      ],
      hazards: [
        { x: 275, y: 432, w: 95, h: 12, type: "ice" },
        { x: 430, y: 432, w: 95, h: 12, type: "fire" },
        { x: 355, y: 187, w: 90, h: 12, type: "poison" }
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

  return JSON.parse(JSON.stringify(levels[index] || levels));
}
