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
    
    // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    ctx.drawImage(
      this.image,      // The full tileset image
      this.sourceX,    // The calculated X position on the tileset
      this.sourceY,    // The calculated Y position on the tileset
      this.tileSize,   // Source crop width (16)
      this.tileSize,   // Source crop height (16)
      this.x,          // Destination X on the game map
      this.y,          // Destination Y on the game map
      this.tileSize,   // Destination width (16)
      this.tileSize    // Destination height (16)
    );
  }
}