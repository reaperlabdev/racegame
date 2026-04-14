// renderer.js — All canvas drawing

import {
  getTrackX,
  getTrackY,
  getColors,
  SEG_LEN,
  ROAD_WIDTH,
  DRAW_DIST,
} from "./track.js";

const CAM_Y = 1000; // Camera height above the road

/** Fills a quad defined by four (x,y) pairs. */
function drawPolygon(ctx, x1, y1, x2, y2, x3, y3, x4, y4, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.lineTo(x4, y4);
  ctx.fill();
}

export function render(ctx, w, h, posX, posZ, speed, isOffRoad) {
  // Sky
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, w, h);

  // Smooth out camera elevation by interpolating between segments
  const startPos = Math.floor(posZ / SEG_LEN);
  const percent = (posZ - startPos * SEG_LEN) / SEG_LEN;
  const startY = getTrackY(startPos);
  const endY = getTrackY(startPos + 1);
  const camTrackY = startY + (endY - startY) * percent;
  const absCamY = camTrackY + CAM_Y;

  const fovMult = Math.min(w, h) * 0.9;

  let maxy = h;
  let prevProjected = null;

  // Render loop strictly looks forward along the Z-axis
  for (let i = 0; i < DRAW_DIST; i++) {
    const index = startPos + i;

    // 1. Get World Coordinates
    const worldX = getTrackX(index);
    const worldY = getTrackY(index);
    const worldZ = index * SEG_LEN;

    // 2. Translate relative to Camera
    const relX = worldX - posX;
    const relY = absCamY - worldY;
    const relZ = worldZ - posZ; // Depth

    // 3. Project to Screen (if in front of camera)
    if (relZ <= 1) continue;

    const scale = fovMult / relZ;
    const px = w / 2 + relX * scale;
    const py = h / 2 + relY * scale;
    const pw = ROAD_WIDTH * scale;

    // 4. Draw if segment is on screen and not blocked by a nearer hill
    if (prevProjected && py < maxy) {
      const c = getColors(index);

      // Clip canvas to maxy horizon line
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, maxy);
      ctx.clip();

      // Draw Grass
      ctx.fillStyle = c.grass;
      ctx.fillRect(0, py, w, prevProjected.y - py);

      // Draw Road
      drawPolygon(
        ctx,
        prevProjected.x - prevProjected.w,
        prevProjected.y,
        prevProjected.x + prevProjected.w,
        prevProjected.y,
        px + pw,
        py,
        px - pw,
        py,
        c.road,
      );

      ctx.restore();
      maxy = py;
    }

    prevProjected = { x: px, y: py, w: pw };
  }
}
