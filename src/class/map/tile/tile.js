export class Tile {
  constructor(x, y, tileSize, image, sourceX, sourceY) {
    this.x = x;
    this.y = y;
    this.tileSize = tileSize;
    this.image = image;

    this.sourceX = sourceX;
    this.sourceY = sourceY;
  }

  update() {}

  render(ctx) {
    if (!this.image) {
      ctx.fillStyle = "#121212";
      ctx.fillRect(this.x, this.y, this.tileSize, this.tileSize);
      return;
    }

    ctx.drawImage(
      this.image,
      this.sourceX,
      this.sourceY,
      this.tileSize,
      this.tileSize,
      this.x,
      this.y,
      this.tileSize,
      this.tileSize,
    );
  }
}
