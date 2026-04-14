// renderer.js — All canvas drawing

import { getTrackX, getTrackY, getColors, SEG_LEN, ROAD_WIDTH, DRAW_DIST } from './track.js';

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

/**
 * Draws one complete frame.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w  Canvas width
 * @param {number} h  Canvas height
 * @param {number} camZ  Distance travelled (world units)
 * @param {number} camX  Horizontal camera position
 * @param {number} speed Current speed
 * @param {boolean} isOffRoad  Whether the player is off-road
 */
export function render(ctx, w, h, camZ, camX, speed, isOffRoad) {
    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, w, h);

    const startPos = Math.floor(camZ / SEG_LEN);
    const absCamY  = getTrackY(startPos) + CAM_Y;
    const fovMult  = Math.min(w, h) * 0.9;
    const roadCenterX = getTrackX(startPos);

    let maxy = h;

    // Anchor the road to the bottom of the screen
    let prev = {
        x: w / 2 + (roadCenterX - camX) * (fovMult / 1),
        y: h,
        w: ROAD_WIDTH * (fovMult / 1),
    };

    for (let i = 0; i < DRAW_DIST; i++) {
        const index = startPos + i;
        const z = index * SEG_LEN - camZ;
        if (z < 1) continue;

        const scale = fovMult / z;
        const px = w / 2 + (getTrackX(index) - camX) * scale;
        const py = h / 2 + (absCamY - getTrackY(index)) * scale;
        const pw = ROAD_WIDTH * scale;

        if (py >= maxy) continue; // Hidden behind a hill

        const c = getColors(index);

        // Grass strip
        ctx.fillStyle = c.grass;
        ctx.fillRect(0, py, w, prev.y - py);

        // Rumble strips (slightly wider than road)
        drawPolygon(ctx,
            prev.x - prev.w * 1.1, prev.y,
            prev.x + prev.w * 1.1, prev.y,
            px   + pw   * 1.1, py,
            px   - pw   * 1.1, py,
            c.rumble,
        );

        // Road surface
        drawPolygon(ctx,
            prev.x - prev.w, prev.y,
            prev.x + prev.w, prev.y,
            px   + pw, py,
            px   - pw, py,
            c.road,
        );

        maxy = py;
        prev = { x: px, y: py, w: pw };
    }

    // HUD — speedometer
    const mph = Math.floor(speed / 100);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 10, 150, 50);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(mph + ' MPH', 30, 43);

    // Off-road warning
    if (isOffRoad && speed > 500) {
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText('OFF ROAD!', w / 2, h / 4);
        ctx.textAlign = 'left';
    }
}
