export const GROUND_Y = 260;
export const GRAVITY = 0.65;

// 矩形碰撞偵測（內縮 4px 增加手感寬容度）
export function isColliding(a, b) {
  const pad = 4;
  return (
    a.x + pad < b.x + b.width - pad &&
    a.x + a.width - pad > b.x + pad &&
    a.y + pad < b.y + b.height - pad &&
    a.y + a.height - pad > b.y + pad
  );
}

// 繪製捲動背景網格與地板
export function drawBackground(ctx, canvas, bgOffset) {
  ctx.strokeStyle = "rgba(0, 245, 212, 0.08)";
  ctx.lineWidth = 1;

  for (let x = bgOffset; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, GROUND_Y);
    ctx.stroke();
  }

  ctx.fillStyle = "#161632";
  ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

  ctx.strokeStyle = "#00f5d4";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.stroke();
}
