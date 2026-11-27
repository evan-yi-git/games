export function renderGame(ctx, canvas, level, icePlayer, firePlayer, tick) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. 繪製背景神殿磚紋網格
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // 2. 繪製出口神殿大門
  drawDoor(ctx, level.doors.ice, "#4cc9f0", "❄️", icePlayer.atDoor);
  drawDoor(ctx, level.doors.fire, "#f72585", "🔥", firePlayer.atDoor);

  // 3. 繪製固定石牆
  ctx.fillStyle = "#3a3248";
  ctx.strokeStyle = "#564a6b";
  ctx.lineWidth = 2;
  for (const w of level.walls) {
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeRect(w.x, w.y, w.w, w.h);
  }

  // 4. 繪製機關橋
  for (const b of level.bridges) {
    if (b.open) {
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(b.x, b.y, b.w, b.h);
    } else {
      ctx.strokeStyle = "rgba(255, 209, 102, 0.35)";
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.setLineDash([]);
    }
  }

  // 5. 繪製機關開關
  for (const sw of level.switches) {
    if (sw.type === "plate") {
      ctx.fillStyle = sw.active ? "#06d6a0" : "#ffd166";
      const offsetY = sw.active ? 5 : 0;
      ctx.fillRect(sw.x, sw.y + offsetY, sw.w, sw.h - offsetY);
    } else if (sw.type === "lever") {
      ctx.fillStyle = "#8d99ae";
      ctx.fillRect(sw.x + 4, sw.y + 12, 16, 8);
      ctx.strokeStyle = sw.active ? "#06d6a0" : "#ffd166";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sw.x + 12, sw.y + 14);
      ctx.lineTo(sw.active ? sw.x + 22 : sw.x + 2, sw.y);
      ctx.stroke();
    }
  }

  // 6. 繪製元素液體池
  for (const hz of level.hazards) {
    if (hz.type === "fire") ctx.fillStyle = "#f72585";
    else if (hz.type === "ice") ctx.fillStyle = "#4cc9f0";
    else ctx.fillStyle = "#06d6a0";

    const wave = Math.sin(tick * 0.1) * 1.5;
    ctx.fillRect(hz.x, hz.y + wave, hz.w, hz.h - wave);
  }

  // 7. 繪製可推動石箱
  for (const box of level.boxes) {
    ctx.fillStyle = "#9c6644";
    ctx.strokeStyle = "#ddb892";
    ctx.lineWidth = 2;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.strokeRect(box.x, box.y, box.w, box.h);
    ctx.beginPath();
    ctx.moveTo(box.x, box.y);
    ctx.lineTo(box.x + box.w, box.y + box.h);
    ctx.stroke();
  }

  // 8. 繪製元素鑽石
  for (const gem of level.gems) {
    if (gem.collected) continue;
    const floatY = gem.y + Math.sin(tick * 0.08 + gem.x) * 3;
    ctx.fillStyle = gem.type === "ice" ? "#4cc9f0" : "#f72585";
    ctx.beginPath();
    ctx.moveTo(gem.x, floatY - 10);
    ctx.lineTo(gem.x + 9, floatY);
    ctx.lineTo(gem.x, floatY + 10);
    ctx.lineTo(gem.x - 9, floatY);
    ctx.closePath();
    ctx.fill();
  }

  // 9. 繪製冰靈與火靈角色（彈開保護期間加入閃爍效果）
  drawCharacter(ctx, icePlayer, "#4cc9f0", "#caf0f8", tick);
  drawCharacter(ctx, firePlayer, "#f72585", "#ffccd5", tick);
}

function drawDoor(ctx, door, color, icon, isOccupied) {
  ctx.fillStyle = isOccupied ? color : "rgba(255, 255, 255, 0.08)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.fillRect(door.x, door.y, door.w, door.h);
  ctx.strokeRect(door.x, door.y, door.w, door.h);

  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(icon, door.x + door.w / 2, door.y - 6);
}

function drawCharacter(ctx, p, mainColor, eyeColor, tick) {
  // 彈飛無敵保護期間每 4 幀閃爍一次
  if (p.hurtTimer > 0 && Math.floor(tick / 4) % 2 === 0) {
    ctx.globalAlpha = 0.45;
  }

  ctx.shadowBlur = 10;
  ctx.shadowColor = mainColor;
  ctx.fillStyle = mainColor;
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.shadowBlur = 0;

  // 若剛被彈飛，加上白色驚嚇外框
  if (p.hurtTimer > 25) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
  }

  ctx.fillStyle = eyeColor;
  ctx.fillRect(p.x + 5, p.y + 10, 6, 8);
  ctx.fillRect(p.x + 17, p.y + 10, 6, 8);

  ctx.globalAlpha = 1.0;
}
