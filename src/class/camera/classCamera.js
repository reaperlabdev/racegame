export class Camera {
  x = 0;
  y = 0;

  zoom = 1;
  rotation = 0;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  update() {}

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  setRotation(angle) {
    this.rotation = angle;
  }

  rotate(delta) {
    this.rotation += delta;
  }
  apply(ctx, canvas) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.rotate(-this.rotation);

    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }
}
