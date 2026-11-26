import { GROUND_Y, isColliding } from "./utils.js";

export function createJumpParticles(particles, x, y, jumpCount) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 4 - 2,
      vy: Math.random() * 2 + 1,
      life: 20,
      color: jumpCount === 2 ? "#fee440" : "#00f5d4"
    });
  }
}

export function updateAndDrawParticles(ctx, particles) {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 4, 4);
    if (p.life <= 0) particles.splice(i, 1);
  }
}

export function spawnEntities(canvasWidth, frameCount, gameSpeed, obstacles, gems) {
  const spawnRate = Math.max(55, Math.floor(110 - gameSpeed * 3));
  if (frameCount % spawnRate === 0 && Math.random() < 0.85) {
    const type = Math.random();
    if (type < 0.55) {
      obstacles.push({ x: canvasWidth, y: GROUND_Y - 35, width: 28, height: 35, kind: "spike" });
    } else if (type < 0.85) {
      obstacles.push({ x: canvasWidth, y: GROUND_Y - 62, width: 30, height: 62, kind: "wall" });
    } else {
      obstacles.push({ x: canvasWidth, y: GROUND_Y - 75, width: 38, height: 24, kind: "drone" });
    }
  }

  if (frameCount % 90 === 0 && Math.random() < 0.6) {
    gems.push({
      x: canvasWidth,
      y: GROUND_Y - 70 - Math.random() * 70,
      size: 12
    });
  }
}

export function updateAndDrawGems(ctx, gems, gameSpeed, player, onCollectGem) {
  for (let i = gems.length - 1; i >= 0; i--) {
    let g = gems[i];
    g.x -= gameSpeed;

    ctx.fillStyle = "#fee440";
    ctx.beginPath();
    ctx.moveTo(g.x, g.y - g.size);
    ctx.lineTo(g.x + g.size, g.y);
    ctx.lineTo(g.x, g.y + g.size);
    ctx.lineTo(g.x - g.size, g.y);
    ctx.closePath();
    ctx.fill();

    const gemBox = { x: g.x - g.size, y: g.y - g.size, width: g.size * 2, height: g.size * 2 };
    if (isColliding(player, gemBox)) {
      onCollectGem();
      gems.splice(i, 1);
      continue;
    }

    if (g.x + g.size < 0) gems.splice(i, 1);
  }
}

export function updateAndDrawObstacles(ctx, obstacles, gameSpeed, player) {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.x -= gameSpeed;

    ctx.fillStyle = "#f15bb5";
    if (obs.kind === "spike") {
      ctx.beginPath();
      ctx.moveTo(obs.x, obs.y + obs.height);
      ctx.lineTo(obs.x + obs.width / 2, obs.y);
      ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }

    if (isColliding(player, obs)) {
      return true; // 回傳 true 代表發生碰撞（Game Over）
    }

    if (obs.x + obs.width < 0) obstacles.splice(i, 1);
  }
  return false;
}
