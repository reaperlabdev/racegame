import { Entity } from "../../classEntity.js";

export class EntitySkidmark extends Entity {
  alpha = 0.4;
  lifeTime = 1;

  constructor(x, y, angle) {
    super(x, y);

    this.angle = angle;
    this.zIndex = -1;
  }

  update(dt) {
    this.alpha -= (0.4 / this.lifeTime) * dt;

    if (this.alpha <= 0) {
      this.destroyed = true;
    }
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.fillStyle = `rgba(20, 20, 20, ${this.alpha})`;
    ctx.fillRect(-2, -1, 4, 2);

    ctx.restore();
  }
}
