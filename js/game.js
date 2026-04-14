import { getTrackX, SEG_LEN, ROAD_WIDTH } from "./track.js";
import { render } from "./renderer.js";
import { InputHandler } from "./input.js";

const MAX_SPEED = 12000;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.input = new InputHandler();

    // --- World State (360-degree capable) ---
    this.posX = 0; // Absolute X in world space
    this.posZ = 0; // Absolute Z in world space
    this.heading = 0; // Direction in radians (0 = Forward/North)
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
    // 1. Handle Rotation (Turning the car literally around)
    // Adjust 2.5 to make the steering more or less sensitive
    const turnSpeed = 2.5;
    this.heading += this.input.steer * turnSpeed * dt;

    // 2. Physics & Movement
    const targetSpeed = this.input.isBraking ? 0 : MAX_SPEED;
    this.speed += (targetSpeed - this.speed) * dt * 2.5;

    // Move along the velocity vector based on current heading
    this.posX += Math.sin(this.heading) * this.speed * dt;
    this.posZ += Math.cos(this.heading) * this.speed * dt;

    // 3. Track Logic
    // Find the track segment closest to our current Z position
    const startPos = Math.floor(this.posZ / SEG_LEN);
    const roadX = getTrackX(startPos);

    // Check if player is beyond the road width
    this._isOffRoad = Math.abs(this.posX - roadX) > ROAD_WIDTH;
  }

  _draw() {
    // Pass the new coordinates and heading to the 360 renderer
    render(
      this.ctx,
      this.w,
      this.h,
      this.posX, // Updated
      this.posZ, // Updated
      this.heading, // Updated
      this.speed,
      this._isOffRoad,
    );
  }
}
