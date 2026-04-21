import { Entity } from "../../classEntity.js";

export class EntityExplosion extends Entity {
  lifeTime = 0.6;
  maxLife = 0.6;

  radius = 4;
  maxRadius = 40;

  constructor(x, y) {
    super(x, y);

    this.zIndex = 10;

    // slight randomness for variation
    this.maxRadius = 30 + Math.random() * 20;
  }

  update(dt) {
    this.lifeTime -= dt;

    const t = 1 - this.lifeTime / this.maxLife;

    // expand outward
    this.radius = this.maxRadius * t;

    if (this.lifeTime <= 0) {
      this.destroyed = true;
    }
  }

  render(ctx) {
    const t = 1 - this.lifeTime / this.maxLife;

    ctx.save();
    ctx.translate(this.x, this.y);

    // fade out
    const alpha = 1 - t;

    ctx.fillStyle = `rgba(255, 220, 120, ${alpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
