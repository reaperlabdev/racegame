import { Game } from "../../../game.js";
import { Entity } from "../classEntity.js";
import { EntitySkidmark } from "../effects/skidmark/entitySkidMark.js";

export class EntityCar extends Entity {
  angle = -Math.PI / 2;
  speed = 0;
  maxSpeed = 600;
  acceleration = 800;
  friction = 0.98;
  turnSpeed = 2.2;
  driftFactor = 0.92;

  constructor() {
    super(320, 320);
  }

  update(dt) {
    const isBraking = Game.instance.input.isPressed("Space");

    if (!isBraking) {
      if (Game.instance.input.isPressed("KeyW"))
        this.speed += this.acceleration * dt;
      else if (Game.instance.input.isPressed("KeyS"))
        this.speed -= this.acceleration * dt;
    }

    let currentTurnSpeed = this.turnSpeed;
    let currentDrift = this.driftFactor;

    if (isBraking) {
      currentDrift = 0.98;
      currentTurnSpeed *= 0.8;
      this.speed *= 0.99;
    }

    if (Math.abs(this.speed) > 5) {
      const direction = this.speed > 0 ? 1 : -1;
      if (Game.instance.input.isPressed("KeyA"))
        this.angle -= currentTurnSpeed * dt * direction;
      if (Game.instance.input.isPressed("KeyD"))
        this.angle += currentTurnSpeed * dt * direction;
    }

    this.speed *= this.friction;

    const targetVelX = Math.cos(this.angle) * this.speed;
    const targetVelY = Math.sin(this.angle) * this.speed;

    this.velX += (targetVelX - this.velX) * (1 - currentDrift);
    this.velY += (targetVelY - this.velY) * (1 - currentDrift);

    this.x += this.velX * dt;
    this.y += this.velY * dt;

    // --- SKIDMARK LOGIC ---
    // Spawn marks if braking OR if the difference between facing and moving is high
    const driftIntensity = Math.sqrt(
      (targetVelX - this.velX) ** 2 + (targetVelY - this.velY) ** 2,
    );
    if (isBraking || driftIntensity > 100) {
      this.spawnSkidmarks();
    }

    Game.instance.camera.setPosition(this.x, this.y);
    Game.instance.camera.setRotation(this.angle + Math.PI / 2);
  }

  spawnSkidmarks() {
    // Tire offsets relative to car center (x, y)
    const tires = [
      { x: 10, y: 7 }, // Front Right
      { x: 10, y: -7 }, // Front Left
      { x: -10, y: 7 }, // Rear Right
      { x: -10, y: -7 }, // Rear Left
    ];

    tires.forEach((tire) => {
      // Rotate the tire offset by the car's current angle
      const rx = tire.x * Math.cos(this.angle) - tire.y * Math.sin(this.angle);
      const ry = tire.x * Math.sin(this.angle) + tire.y * Math.cos(this.angle);

      const mark = new EntitySkidmark(this.x + rx, this.y + ry, this.angle);
      Game.instance.managerEntity.addEntity(mark);
    });
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = "red";
    ctx.fillRect(-12, -8, 24, 16);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(4, -6, 4, 12);
    ctx.restore();
  }
}
