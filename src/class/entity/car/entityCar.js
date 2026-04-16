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

  // Collision box dimensions
  width = 24;
  height = 16;

  constructor() {
    super(320, 320);
  }

  update(dt) {
    const isBraking = Game.instance.input.isPressed("Space");
    const currentMap = Game.instance.managerMap.maps[0];

    // 1. Get tile info at current position for surface effects
    let surfaceFriction = this.friction;
    let surfaceDrift = this.driftFactor;

    if (currentMap) {
      const currentTile = currentMap.getTileAt(this.x, this.y);
      // Example: ID 2 is Grass (lower grip, more sliding)
      if (currentTile.id === 2) {
        surfaceFriction = 0.94;
        surfaceDrift = 0.97;
      }
    }

    // 2. Calculate acceleration
    if (!isBraking) {
      if (Game.instance.input.isPressed("KeyW"))
        this.speed += this.acceleration * dt;
      else if (Game.instance.input.isPressed("KeyS"))
        this.speed -= this.acceleration * dt;
    }

    let currentTurnSpeed = this.turnSpeed;
    let currentDrift = isBraking ? 0.98 : surfaceDrift;

    if (isBraking) {
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

    this.speed *= surfaceFriction;

    // 3. Velocity and Collision Handling
    const targetVelX = Math.cos(this.angle) * this.speed;
    const targetVelY = Math.sin(this.angle) * this.speed;

    this.velX += (targetVelX - this.velX) * (1 - currentDrift);
    this.velY += (targetVelY - this.velY) * (1 - currentDrift);

    // Tentative next positions
    const nextX = this.x + this.velX * dt;
    const nextY = this.y + this.velY * dt;

    if (currentMap) {
      // Check X movement
      if (!this.checkCollision(nextX, this.y, currentMap)) {
        this.x = nextX;
      } else {
        this.speed *= -0.5; // Bounce
        this.velX *= -0.5;
      }

      // Check Y movement
      if (!this.checkCollision(this.x, nextY, currentMap)) {
        this.y = nextY;
      } else {
        this.speed *= -0.5; // Bounce
        this.velY *= -0.5;
      }
    } else {
      this.x = nextX;
      this.y = nextY;
    }

    // --- SKIDMARK LOGIC ---
    const driftIntensity = Math.sqrt(
      (targetVelX - this.velX) ** 2 + (targetVelY - this.velY) ** 2,
    );
    if (isBraking || driftIntensity > 100) {
      this.spawnSkidmarks();
    }

    Game.instance.camera.setPosition(this.x, this.y);
    Game.instance.camera.setRotation(this.angle + Math.PI / 2);
  }

  /**
   * Checks if any corner of the car hits a wall (ID 1)
   */
  checkCollision(nx, ny, map) {
    const margin = 2; // buffer
    const hw = this.width / 2 - margin;
    const hh = this.height / 2 - margin;

    // Check four corners of the car's bounding box
    const corners = [
      { x: nx - hw, y: ny - hh },
      { x: nx + hw, y: ny - hh },
      { x: nx - hw, y: ny + hh },
      { x: nx + hw, y: ny + hh },
    ];

    for (const p of corners) {
      const tile = map.getTileAt(p.x, p.y);
      if (tile.id === 1) return true; // Collision with Wall
    }

    return false;
  }

  spawnSkidmarks() {
    const tires = [
      { x: 10, y: 7 },
      { x: 10, y: -7 },
      { x: -10, y: 7 },
      { x: -10, y: -7 },
    ];

    tires.forEach((tire) => {
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
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillRect(4, -6, 4, 12);
    ctx.restore();
  }
}
