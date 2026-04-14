import { getTrackX, SEG_LEN, ROAD_WIDTH } from "./track.js";
import { render } from "./renderer.js";
import { InputHandler } from "./input.js";

const MAX_SPEED = 12000;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.input = new InputHandler();

    // --- Arcade World State ---
    this.posX = 0; // Lateral position (left/right of the road)
    this.posZ = 0; // Forward progress down the track
    this.speed = 0;

    this._lastTime = 0;
    this._running = false;
    this._isOffRoad = false;

    this._resize();
    window.addEventListener("resize", () => this._resize());
  }

  _resize() {
    this.w = this.canvas.width = window.innerWidth;
    this.h = this.canvas.height = window.innerHeight;
  }

  start() {
    this._running = true;
    this._lastTime = performance.now();
    this.input.enableGyro();
    requestAnimationFrame((t) => this._loop(t));
  }

  _loop(time) {
    if (!this._running) return;
    requestAnimationFrame((t) => this._loop(t));

    const dt = Math.min((time - this._lastTime) / 1000, 0.05);
    this._lastTime = time;

    this._update(dt);
    this._draw();
  }

  _update(dt) {
    // 1. Physics & Speed
    const targetSpeed = this.input.isBraking ? 0 : MAX_SPEED;
    this.speed += (targetSpeed - this.speed) * dt * 2.5;

    // You ALWAYS move forward down the Z-axis
    this.posZ += this.speed * dt;

    // 2. Track & Steering Logic
    const startPos = Math.floor(this.posZ / SEG_LEN);
    const currentTrackX = getTrackX(startPos);
    const nextTrackX = getTrackX(startPos + 1);

    // Calculate how sharp the upcoming curve is
    const curve = nextTrackX - currentTrackX;

    // Steering slides you left and right horizontally
    const turnSpeed = 10000;
    this.posX += this.input.steer * turnSpeed * dt;

    // Centrifugal force: sharp curves push you to the outside of the track based on speed
    const centrifugal = curve * (this.speed / MAX_SPEED) * 2.0;
    this.posX -= centrifugal;

    // 3. Off-road logic (Check distance from absolute track center)
    this._isOffRoad = Math.abs(this.posX - currentTrackX) > ROAD_WIDTH;

    if (this._isOffRoad && this.speed > 2000) {
      this.speed -= 4000 * dt; // Heavy friction when driving on the grass
    }
  }

  _draw() {
    // Pass the simplified data to the renderer
    render(
      this.ctx,
      this.w,
      this.h,
      this.posX,
      this.posZ,
      this.speed,
      this._isOffRoad,
    );
  }
}
