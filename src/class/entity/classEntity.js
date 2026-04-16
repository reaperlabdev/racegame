import { Game } from "../../game";

export class Entity {
  x = 0;
  y = 0;
  velX = 0;
  velY = 0;

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velX = 0;
    this.velY = 0;
  }

  update(dt) {
    this.x += this.velX * dt;
    this.y += this.velY * dt;

    this.velX *= 0.95;
    this.velY *= 0.95;
  }

  render(ctx) {}
}
