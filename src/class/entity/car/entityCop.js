import { Game } from "../../../game.js";
import { EntityExplosion } from "../effects/skidmark/entityExplosion.js";
import { EntityCar } from "./entityCar.js";

export class EntityCop extends EntityCar {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;

    this.maxSpeed = 640;
    this.acceleration = 900;
    this.turnSpeed = 2.4;
    this.friction = 0.98;

    this.copDriftFactor = 0.92;
    this.crashDamageThreshold = 0.35;

    this.isSliding = false;
    this.slideTimer = 0;
    this.destroyed = false;

    this.panicRange = 180;
  }

  handlePlayerCollision(player) {
    if (!this.isCollidingWith(player)) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;

    const nx = dx / dist;
    const ny = dy / dist;

    const impactSpeed = Math.sqrt(this.velX ** 2 + this.velY ** 2) / 2;
    const impactRatio = impactSpeed / this.maxSpeed;

    const pushStrength = impactSpeed;

    player.externalVelX += nx * pushStrength;
    player.externalVelY += ny * pushStrength;
    player.velX *= 0.3;
    player.velY *= 0.3;

    const overlap = 10;
    player.x += nx * overlap;
    player.y += ny * overlap;

    Game.instance.camera.shake(5 * impactRatio, 0.2);

    Game.instance.managerAudio.play("hit", {
      volume: 1,
      rate: 0.8 + Math.random() * 0.4,
    });

    player.health -= 1;
    this.selfDestruct();
  }

  applySeparation(entities) {
    let avoidX = 0;
    let avoidY = 0;
    let count = 0;

    for (const e of entities) {
      if (e === this) continue;
      if (!(e instanceof EntityCop)) continue;
      if (e.destroyed) continue;

      const dx = this.x - e.x;
      const dy = this.y - e.y;
      const distSq = dx * dx + dy * dy;

      const minDist = 40; // tweak this

      if (distSq < minDist * minDist && distSq > 0.001) {
        const dist = Math.sqrt(distSq);

        // normalize + weight by closeness
        const force = (minDist - dist) / minDist;

        avoidX += (dx / dist) * force;
        avoidY += (dy / dist) * force;
        count++;
      }
    }

    if (count > 0) {
      avoidX /= count;
      avoidY /= count;

      const avoidAngle = Math.atan2(avoidY, avoidX);

      let angleDiff = avoidAngle - this.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      // steer away
      const steerStrength = 1.5; // tweak
      this.angle += Math.sign(angleDiff) * steerStrength * 0.016; // small constant step

      // slight slowdown to prevent clumping
      this.speed *= 0.98;
    }
  }

  update(dt) {
    if (this.destroyed) return;

    const entities = Game.instance.managerEntity.getEntities();
    const player = entities.find((e) => e instanceof EntityCar && e !== this);

    if (!this.isSliding) {
      this.applySeparation(entities);
    }

    if (player) {
      this.handlePlayerCollision(player);
    }

    let currentDrift = this.copDriftFactor;
    let effectiveTurnSpeed = this.turnSpeed;

    if (player && !this.isSliding) {
      // 1. DIRECT TARGETING
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distSq = dx * dx + dy * dy;
      const distance = Math.sqrt(distSq);
      const targetAngle = Math.atan2(dy, dx);

      // 2. PLAYER JUKING DETECTION
      const playerVelAngle = Math.atan2(player.velY, player.velX);
      const isPlayerDrifting =
        Math.abs(playerVelAngle - player.angle) > 0.4 &&
        Math.abs(player.speed) > 100;

      let angleDiff = targetAngle - this.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      const speedRatio = Math.abs(this.speed) / this.maxSpeed;

      if (speedRatio > 0.4) {
        if (
          (isPlayerDrifting && distance < this.panicRange) ||
          Math.abs(angleDiff) > 1.3
        ) {
          this.isSliding = true;
          this.slideTimer = 1.0;

          this.speed += this.acceleration * 0.8;
        }
      }

      if (Math.abs(angleDiff) > 0.05) {
        const turnDir = angleDiff > 0 ? 1 : -1;
        this.angle += effectiveTurnSpeed * dt * turnDir;
      }

      if (distance > 80) {
        this.speed += this.acceleration * dt;
      } else {
        this.speed *= 0.95;
      }
    }

    if (this.isSliding) {
      this.slideTimer -= dt;

      currentDrift = 0.998;
      effectiveTurnSpeed = 0;

      this.spawnSkidmarks();

      if (this.slideTimer <= 0) this.isSliding = false;
    }

    this.activeDrift = currentDrift;
    this.applyPhysics(dt);
  }

  applyPhysics(dt) {
    this.speed *= this.friction;

    const targetVelX = Math.cos(this.angle) * this.speed;
    const targetVelY = Math.sin(this.angle) * this.speed;

    this.velX += (targetVelX - this.velX) * (1 - this.activeDrift);
    this.velY += (targetVelY - this.velY) * (1 - this.activeDrift);

    const currentSpeedSq = this.velX ** 2 + this.velY ** 2;
    if (currentSpeedSq > this.maxSpeed ** 2) {
      const mag = Math.sqrt(currentSpeedSq);
      this.velX = (this.velX / mag) * this.maxSpeed;
      this.velY = (this.velY / mag) * this.maxSpeed;
    }

    const nextX = this.x + this.velX * dt;
    const nextY = this.y + this.velY * dt;
    const map = Game.instance.managerMap.maps[0];

    if (map) {
      if (this.checkCollision(nextX, this.y, map)) {
        const impact = Math.abs(this.velX) / this.maxSpeed;
        if (impact > this.crashDamageThreshold) return this.selfDestruct();

        this.speed *= -0.5;
        this.velX *= -0.5;
        this.isSliding = false;
      } else {
        this.x = nextX;
      }

      if (this.checkCollision(this.x, nextY, map)) {
        const impact = Math.abs(this.velY) / this.maxSpeed;
        if (impact > this.crashDamageThreshold) return this.selfDestruct();

        this.speed *= -0.5;
        this.velY *= -0.5;
        this.isSliding = false;
      } else {
        this.y = nextY;
      }
    }
  }

  selfDestruct() {
    if (this.destroyed) return;
    Game.instance.globals.score += 1;
    this.destroyed = true;

    Game.instance.managerAudio.play("crash", {
      volume: Math.min(1, 1.5),
      rate: 0.8 + Math.random() * 0.4,
    });

    Game.instance.managerEntity.addEntity(new EntityExplosion(this.x, this.y));

    Game.instance.camera.shake(5, 0.5);
    Game.instance.managerEntity.removeEntity(this);
  }

  render(ctx) {
    if (this.destroyed) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Car Body
    ctx.fillStyle = this.isSliding ? "#333" : "#111"; // Brighten slightly when panicking
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    ctx.fillStyle = "#eee";
    ctx.fillRect(
      -this.width / 6,
      -this.height / 2,
      this.width / 3,
      this.height,
    );

    // Emergency Lights (Flash faster when panicking)
    const flashSpeed = this.isSliding ? 50 : 100;
    const flash = Math.floor(Date.now() / flashSpeed) % 2 === 0;
    ctx.fillStyle = flash ? "#f00" : "#00f";
    ctx.fillRect(4, -6, 3, 3);
    ctx.fillStyle = flash ? "#00f" : "#f00";
    ctx.fillRect(4, 3, 3, 3);

    ctx.restore();
  }
}
