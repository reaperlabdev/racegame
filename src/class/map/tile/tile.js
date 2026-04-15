export class Tile {
  constructor(x, y, tileSize, image, sourceX, sourceY) {
    this.x = x;
    this.y = y;
    this.tileSize = tileSize;
    this.image = image;
    
    // Coordinates to crop from the main tileset image
    this.sourceX = sourceX;
    this.sourceY = sourceY;
  }

  update() {
    // Add logic here if specific tiles have animations or state changes
  }

  render(ctx) {
    if (!this.image) return;
    
    // Draw this specific 16x16 chunk of the tileset onto the given context
    ctx.drawImage(
      this.image,
      this.sourceX, this.sourceY, this.tileSize, this.tileSize, // Source crop
      this.x, this.y, this.tileSize, this.tileSize              // Destination placement
    );
  }
}