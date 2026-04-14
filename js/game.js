// game.js — Game loop and physics

import { getTrackX, SEG_LEN, ROAD_WIDTH } from './track.js';
import { render } from './renderer.js';
import { InputHandler } from './input.js';

const MAX_SPEED = 12000; // World units / second at full throttle

export class Game {
    constructor(canvas) {
        this.canvas  = canvas;
        this.ctx     = canvas.getContext('2d');
        this.input   = new InputHandler();

        // World state
        this.camZ  = 0;   // Distance travelled
        this.camX  = 0;   // Horizontal position
        this.speed = 0;   // Current speed

        this._lastTime = 0;
        this._running  = false;

        this._resize();
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        this.w = this.canvas.width  = window.innerWidth;
        this.h = this.canvas.height = window.innerHeight;
    }

    /** Start the game (call after user interaction so gyro permission can fire). */
    start() {
        this._running  = true;
        this._lastTime = performance.now();
        this.input.enableGyro();
        requestAnimationFrame(t => this._loop(t));
    }

    _loop(time) {
        if (!this._running) return;
        requestAnimationFrame(t => this._loop(t));

        const dt = Math.min((time - this._lastTime) / 1000, 0.05); // cap at 50 ms
        this._lastTime = time;

        this._update(dt);
        this._draw();
    }

    _update(dt) {
        const startPos    = Math.floor(this.camZ / SEG_LEN);
        const roadCenterX = getTrackX(startPos);

        const isOffRoad    = Math.abs(this.camX - roadCenterX) > ROAD_WIDTH * 0.9;
        const targetSpeed  = this.input.isBraking
            ? 0
            : isOffRoad ? MAX_SPEED * 0.3 : MAX_SPEED;

        // Smooth acceleration / deceleration
        this.speed += (targetSpeed - this.speed) * dt * 2.5;
        this.camZ  += this.speed * dt;

        // Lateral movement scales with current speed
        this.camX  += this.input.steer * 14000 * (this.speed / MAX_SPEED) * dt;

        // Expose for renderer
        this._isOffRoad = isOffRoad;
    }

    _draw() {
        render(
            this.ctx,
            this.w,
            this.h,
            this.camZ,
            this.camX,
            this.speed,
            this._isOffRoad,
        );
    }
}
