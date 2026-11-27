const GRAVITY = 0.55;
const MOVE_SPEED = 4.2;
const JUMP_FORCE = -11.2;

export function createPlayer(x, y, element) {
  return {
    x,
    y,
    w: 28,
    h: 38,
    vx: 0,
    vy: 0,
    element, // "ice" | "fire"
    onGround: false,
    atDoor: false
  };
}

export function rectIntersect(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// 取得目前所有實體地形（固定牆壁 + 已開啟的機關橋）
function getSolidPlatforms(level) {
  const activeBridges = level.bridges.filter((b) => b.open);
  return [...level.walls, ...activeBridges];
}

// 更新單一角色物理與推箱子
export function updatePlayerPhysics(player, input, level) {
  player.vx = 0;
  if (input.left) player.vx = -MOVE_SPEED;
  if (input.right) player.vx = MOVE_SPEED;

  if (input.up && player.onGround) {
    player.vy = JUMP_FORCE;
    player.onGround = false;
  }

  player.vy += GRAVITY;
  const solids = getSolidPlatforms(level);

  // 1. 水平移動與推箱子
  player.x += player.vx;
  for (const box of level.boxes) {
    if (rectIntersect(player, box)) {
      if (player.vx > 0) {
        box.x = player.x + player.w;
        // 檢查箱子是否撞牆
        for (const wall of solids) {
          if (rectIntersect(box, wall)) {
            box.x = wall.x - box.w;
            player.x = box.x - player.w;
          }
        }
      } else if (player.vx < 0) {
        box.x = player.x - box.w;
        for (const wall of solids) {
          if (rectIntersect(box, wall)) {
            box.x = wall.x + wall.w;
            player.x = box.x + box.w;
          }
        }
      }
    }
  }

  for (const wall of solids) {
    if (rectIntersect(player, wall)) {
      if (player.vx > 0) player.x = wall.x - player.w;
      if (player.vx < 0) player.x = wall.x + wall.w;
    }
  }

  // 2. 垂直移動與落地判定（可踩在牆壁或箱子上）
  player.y += player.vy;
  player.onGround = false;
  const verticalObstacles = [...solids, ...level.boxes];

  for (const obs of verticalObstacles) {
    if (rectIntersect(player, obs)) {
      if (player.vy > 0) {
        player.y = obs.y - player.h;
        player.vy = 0;
        player.onGround = true;
      } else if (player.vy < 0) {
        player.y = obs.y + obs.h;
        player.vy = 0;
      }
    }
  }
}

// 更新箱子重力
export function updateBoxes(level) {
  const solids = getSolidPlatforms(level);
  for (const box of level.boxes) {
    box.vy += GRAVITY;
    box.y += box.vy;
    for (const wall of solids) {
      if (rectIntersect(box, wall)) {
        if (box.vy > 0) {
          box.y = wall.y - box.h;
          box.vy = 0;
        }
      }
    }
  }
}

// 更新機關開關（壓力板 & 拉桿）
export function updateSwitches(players, level) {
  const pressers = [...players, ...level.boxes];

  for (const sw of level.switches) {
    if (sw.type === "plate") {
      // 只要有任一角色或箱子踩在上面就啟動
      sw.active = pressers.some((entity) => rectIntersect(entity, sw));
      const bridge = level.bridges.find((b) => b.id === sw.target);
      if (bridge) bridge.open = sw.active;
    } else if (sw.type === "lever") {
      if (sw.cooldown > 0) sw.cooldown--;
      const touched = players.some((p) => rectIntersect(p, sw));
      if (touched && sw.cooldown === 0) {
        sw.active = !sw.active;
        sw.cooldown = 35; // 防止連續快速觸發
        const bridge = level.bridges.find((b) => b.id === sw.target);
        if (bridge) bridge.open = sw.active;
      }
    }
  }
}

// 檢查元素相剋死亡與收集寶石、出口狀態
export function checkInteractions(icePlayer, firePlayer, level) {
  const players = [icePlayer, firePlayer];

  for (const p of players) {
    // 檢查危險液體池
    for (const hz of level.hazards) {
      // 稍微內縮判定框讓邊緣更寬容
      const hitbox = { x: p.x + 4, y: p.y + 4, w: p.w - 8, h: p.h - 4 };
      if (rectIntersect(hitbox, hz)) {
        if (hz.type === "poison") {
          return { status: "dead", reason: "觸碰到了劇毒沼澤！" };
        }
        if (hz.type === "fire" && p.element === "ice") {
          return { status: "dead", reason: "❄️ 冰靈掉進岩漿蒸發了！" };
        }
        if (hz.type === "ice" && p.element === "fire") {
          return { status: "dead", reason: "🔥 火靈掉進寒水熄滅了！" };
        }
      }
    }

    // 收集對應顏色寶石
    for (const gem of level.gems) {
      if (!gem.collected && gem.type === p.element) {
        const gemBox = { x: gem.x - 10, y: gem.y - 10, w: 20, h: 20 };
        if (rectIntersect(p, gemBox)) {
          gem.collected = true;
        }
      }
    }
  }

  // 檢查是否雙雙抵達對應出口門
  icePlayer.atDoor = rectIntersect(icePlayer, level.doors.ice);
  firePlayer.atDoor = rectIntersect(firePlayer, level.doors.fire);

  const allGemsCollected = level.gems.every((g) => g.collected);
  if (icePlayer.atDoor && firePlayer.atDoor) {
    if (allGemsCollected) {
      return { status: "win", reason: "雙靈齊心，成功收集所有元素鑽石！" };
    }
  }

  return { status: "playing" };
}
