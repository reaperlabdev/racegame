export class Camera {
  x = 0;
  y = 0;
  zoom = 1;
  rotation = 0;
  _shakeIntensity = 0;
  _shakeDuration = 0;
  _shakeTimer = 0;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  shake(intensity, duration) {
    this._shakeIntensity = intensity;
    this._shakeDuration = duration;
    this._shakeTimer = duration;
  }

  update(dt) {
    if (this._shakeTimer > 0) {
      this._shakeTimer -= dt;
    }
  }

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
  setZoom(zoom) {
    this.zoom = zoom;
  }

  apply(ctx, canvas) {
    let ox = 0,
      oy = 0;
    if (this._shakeTimer > 0) {
      const progress = this._shakeTimer / this._shakeDuration;
      const intensity = this._shakeIntensity * progress;
      ox = (Math.random() * 2 - 1) * intensity;
      oy = (Math.random() * 2 - 1) * intensity;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(canvas.width / 2 + ox, canvas.height / 2 + oy);
    ctx.rotate(-this.rotation);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }
}
