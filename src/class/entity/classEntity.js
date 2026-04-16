export class Entity {
  zIndex = 0;
  x = 0;
  y = 0;
  velX = 0;
  velY = 0;
  destroyed = false;

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velX = 0;
    this.velY = 0;
  }

  update(dt) {}

  render(ctx) {}
}
