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

  isCollidingWith(entity) {
    return !(
      this.x + this.width / 2 < entity.x - entity.width / 2 ||
      this.x - this.width / 2 > entity.x + entity.width / 2 ||
      this.y + this.height / 2 < entity.y - entity.height / 2 ||
      this.y - this.height / 2 > entity.y + entity.height / 2
    );
  }

  update(dt) {}

  render(ctx) {}
}
