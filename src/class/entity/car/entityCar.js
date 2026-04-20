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

  externalVelX = 0;
  externalVelY = 0;

  width = 24;
  height = 16;

  _spawnResolved = false;
  _wasCollidingX = false;
  _wasCollidingY = false;

  constructor() {
    super(320, 320);
    this._spawnResolved = false;
  }

  resolveSpawnCollision() {
    const map = Game.instance.managerMap?.maps?.[0];
    if (!map) return;

    if (!this.checkCollision(this.x, this.y, map)) return;

    const step = 8;
    for (let radius = step; radius < 512; radius += step) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
        const tx = this.x + Math.cos(angle) * radius;
        const ty = this.y + Math.sin(angle) * radius;
        if (!this.checkCollision(tx, ty, map)) {
          this.x = tx;
          this.y = ty;
          return;
        }
      }
    }
  }

  update(dt) {
    if (!this._spawnResolved) {
      this.resolveSpawnCollision();
    }

    const input = Game.instance.input;

    const isGas = input.isGas();
    const isBrake = input.isBrake();

    const currentMap = Game.instance.managerMap.maps[0];

    // CAMERA ZOOM
    const speedRatio = Math.abs(this.speed) / this.maxSpeed;
    const targetZoom = 2 - speedRatio * 1;

    Game.instance.camera.setZoom(
      Game.instance.camera.zoom +
        (targetZoom - Game.instance.camera.zoom) * 0.05,
    );

    // SURFACE SETTINGS
    let surfaceFriction = this.friction;
    let surfaceDrift = this.driftFactor;

    if (currentMap) {
      const tile = currentMap.getTileAt(this.x, this.y);
      if (tile.id === 2) {
        surfaceFriction = 0.94;
        surfaceDrift = 0.97;
      }
    }

    if (!isBrake) {
      if (isGas) {
        this.speed += this.acceleration * dt;
      } else if (input.isPressed("KeyS")) {
        this.speed -= this.acceleration * dt;
      }
    }

    let currentTurnSpeed = this.turnSpeed;
    let currentDrift = isBrake ? 0.98 : surfaceDrift;

    if (isBrake) {
      currentTurnSpeed *= 0.8;
      this.speed *= 0.99;
    }

    // STEERING (keyboard + gyro)
    let steer = 0;

    if (input.isPressed("KeyA")) steer -= 1;
    if (input.isPressed("KeyD")) steer += 1;

    const roll = input.getRoll?.() ?? 0;
    const gyro = Math.abs(roll) < 0.05 ? 0 : roll;

    steer += gyro;

    steer = Math.max(-1, Math.min(1, steer));

    if (Math.abs(this.speed) > 5) {
      const direction = this.speed > 0 ? 1 : -1;

      const speedFactor = Math.min(1, Math.abs(this.speed) / this.maxSpeed);

      const steerScale = 1 - speedFactor * 0.5;

      if (isBrake) steer *= 1.3;

      this.angle += steer * currentTurnSpeed * steerScale * dt * direction;
    }

    // FRICTION
    this.speed *= surfaceFriction;

    // TARGET VELOCITY
    const targetVelX = Math.cos(this.angle) * this.speed;
    const targetVelY = Math.sin(this.angle) * this.speed;

    // DRIFT BLEND
    this.velX += (targetVelX - this.velX) * (1 - currentDrift);
    this.velY += (targetVelY - this.velY) * (1 - currentDrift);

    // EXTERNAL FORCES
    this.velX += this.externalVelX;
    this.velY += this.externalVelY;

    this.externalVelX *= 0.9;
    this.externalVelY *= 0.9;

    const nextX = this.x + this.velX * dt;
    const nextY = this.y + this.velY * dt;

    // COLLISION
    if (currentMap) {
      const collidingX = this.checkCollision(nextX, this.y, currentMap);

      if (collidingX) {
        if (!this._wasCollidingX) {
          const impact = Math.abs(this.velX) / this.maxSpeed;
          Game.instance.camera.shake(10 * impact, 0.2);
        }

        this.speed *= -1;
        this.velX *= -1;
      } else {
        this.x = nextX;
      }

      this._wasCollidingX = collidingX;

      const collidingY = this.checkCollision(this.x, nextY, currentMap);

      if (collidingY) {
        if (!this._wasCollidingY) {
          const impact = Math.abs(this.velY) / this.maxSpeed;
          Game.instance.camera.shake(10 * impact, 0.2);
        }

        this.speed *= -1;
        this.velY *= -1;
      } else {
        this.y = nextY;
      }

      this._wasCollidingY = collidingY;
    }

    // SKIDMARKS
    const driftIntensity = Math.sqrt(
      (targetVelX - this.velX) ** 2 + (targetVelY - this.velY) ** 2,
    );

    if (isBrake || driftIntensity > 100) {
      this.spawnSkidmarks();
    }

    // CAMERA
    Game.instance.camera.setPosition(this.x, this.y);
    Game.instance.camera.setRotation(this.angle + Math.PI / 2);
  }

  checkCollision(nx, ny, map) {
    const margin = 2;
    const hw = this.width / 2 - margin;
    const hh = this.height / 2 - margin;

    const corners = [
      { x: nx - hw, y: ny - hh },
      { x: nx + hw, y: ny - hh },
      { x: nx - hw, y: ny + hh },
      { x: nx + hw, y: ny + hh },
    ];

    for (const p of corners) {
      const tile = map.getTileAt(p.x, p.y);
      if (tile.id === 1) return true;
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

    for (const t of tires) {
      const rx = t.x * Math.cos(this.angle) - t.y * Math.sin(this.angle);

      const ry = t.x * Math.sin(this.angle) + t.y * Math.cos(this.angle);

      Game.instance.managerEntity.addEntity(
        new EntitySkidmark(this.x + rx, this.y + ry, this.angle),
      );
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = "red";
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(4, -6, 4, 12);

    ctx.restore();
  }
}
