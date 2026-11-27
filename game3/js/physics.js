const GRAVITY = 0.55;
const MOVE_SPEED = 4.8;
const JUMP_FORCE = -13.2;

export function createPlayer(x, y, element) {
  return {
    x,
    y,
    w: 28,
    h: 38,
    vx: 0,
    vy: 0,
    element,
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

function getSolidPlatforms(level) {
  const activeBridges = level.bridges.filter((b) => b.open);
  return [...level.walls, ...activeBridges];
}

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

  player.x += player.vx;
  for (const box of level.boxes) {
    if (rectIntersect(player, box)) {
      if (player.vx > 0) {
        box.x = player.x + player.w;
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

export function updateSwitches(players, level) {
  const pressers = [...players, ...level.boxes];

  for (const sw of level.switches) {
    if (sw.type === "plate") {
      sw.active = pressers.some((entity) => rectIntersect(entity, sw));
      const bridge = level.bridges.find((b) => b.id === sw.target);
      if (bridge) bridge.open = sw.active;
    } else if (sw.type === "lever") {
      if (sw.cooldown > 0) sw.cooldown--;
      const touched = players.some((p) => rectIntersect(p, sw));
      if (touched && sw.cooldown === 0) {
        sw.active = !sw.active;
        sw.cooldown = 35;
        const bridge = level.bridges.find((b) => b.id === sw.target);
        if (bridge) bridge.open = sw.active;
      }
    }
  }
}

export function checkInteractions(icePlayer, firePlayer, level) {
  const players = [icePlayer, firePlayer];

  for (const p of players) {
    for (const hz of level.hazards) {
      const hitbox = { x: p.x + 6, y: p.y + 4, w: p.w - 12, h: p.h - 4 };
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

    for (const gem of level.gems) {
      if (!gem.collected && gem.type === p.element) {
        const gemBox = { x: gem.x - 10, y: gem.y - 10, w: 20, h: 20 };
        if (rectIntersect(p, gemBox)) {
          gem.collected = true;
        }
      }
    }
  }

  icePlayer.atDoor = rectIntersect(icePlayer, level.doors.ice);
  firePlayer.atDoor = rectIntersect(firePlayer, level.doors.fire);

  // 只要兩人都抵達對應出口門就過關，並統計寶石收集率
  if (icePlayer.atDoor && firePlayer.atDoor) {
    const got = level.gems.filter((g) => g.collected).length;
    const total = level.gems.length;
    const msg =
      got === total
        ? `完美通關！成功收集全部 ${total}/${total} 顆元素鑽石！`
        : `通關成功！共收集了 ${got}/${total} 顆元素鑽石。`;
    return { status: "win", reason: msg };
  }

  return { status: "playing" };
}
