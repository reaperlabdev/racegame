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

export function render(ctx, w, h, posX, posZ, heading, speed, isOffRoad) {
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

  // Determine iteration direction so the track doesn't vanish when looking backward
  const dir = Math.cos(heading) >= 0 ? 1 : -1;

  for (let i = -10; i < DRAW_DIST; i++) {
    const index = startPos + i * dir;
    if (index < 0) continue;

    // 1. Get World Coordinates of segment
    const worldX = getTrackX(index);
    const worldZ = index * SEG_LEN;
    const worldY = getTrackY(index);

    // 2. Translate relative to Camera
    const relX = worldX - posX;
    const relZ = worldZ - posZ;
    const relY = absCamY - worldY;

    // 3. Rotate coordinates based on Camera Heading (Fixed sign logic)
    const cosH = Math.cos(heading);
    const sinH = Math.sin(heading);

    const rotX = relX * cosH - relZ * sinH;
    const rotZ = relX * sinH + relZ * cosH;

    // 4. Project if in front of camera
    if (rotZ <= 1) {
      prevProjected = null; // Reset segment chain if it goes behind us
      continue;
    }

    const scale = fovMult / rotZ;
    const px = w / 2 + rotX * scale;
    const py = h / 2 + relY * scale;
    const pw = ROAD_WIDTH * scale;

    if (prevProjected && py < maxy) {
      const c = getColors(index);

      // Save canvas state and clip to maxy to prevent valleys drawing over hills
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

      ctx.restore(); // Remove clipping region for the next segment

      maxy = py;
    }

    prevProjected = { x: px, y: py, w: pw };
  }
}
