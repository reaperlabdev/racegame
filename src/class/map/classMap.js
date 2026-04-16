import { Tile } from "../map/tile/tile.js";

export class Map {
  constructor(mapData, tilesetImage = null) {
    this.mapData = mapData;
    this.tilesetImage = tilesetImage;

    this.width = mapData.width;
    this.height = mapData.height;
    this.tileSize = mapData.tileSize || 16;
    this.data = mapData.data;

    this.tiles = [];

    this.cacheCanvas = document.createElement("canvas");
    this.cacheCanvas.width = this.width * this.tileSize;
    this.cacheCanvas.height = this.height * this.tileSize;
    this.cacheCtx = this.cacheCanvas.getContext("2d");

    this.buildAndCacheMap();
  }

  buildAndCacheMap() {
    const { width, data } = this;

    // Define the size of the tiles in your original 64x64 PNG
    const sourceTileSize = 16;
    const tilesPerRow = this.tilesetImage
      ? Math.floor(this.tilesetImage.width / sourceTileSize)
      : 0;

    data.forEach((tileId, i) => {
      if (tileId === 0) return;

      const x = (i % width) * this.tileSize;
      const y = Math.floor(i / width) * this.tileSize;

      if (this.tilesetImage) {
        const sourceX = ((tileId - 1) % tilesPerRow) * sourceTileSize;
        const sourceY = Math.floor((tileId - 1) / tilesPerRow) * sourceTileSize;

        const tile = new Tile(
          x,
          y,
          this.tileSize,
          this.tilesetImage,
          sourceX,
          sourceY,
          sourceTileSize, // Pass the source size (32)
        );

        this.tiles.push(tile);
        tile.render(this.cacheCtx);
      } else {
        this.cacheCtx.fillStyle = this.getDebugColor(tileId);
        this.cacheCtx.fillRect(x, y, this.tileSize, this.tileSize);
      }
    });
  }

  getTileAt(worldX, worldY) {
    // 1. Convert world pixels to grid coordinates
    const gridX = Math.floor(worldX / this.tileSize);
    const gridY = Math.floor(worldY / this.tileSize);

    // 2. Boundary check (is the car even on the map?)
    if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
      return { id: -1, x: 0, y: 0, size: this.tileSize }; // Out of bounds
    }

    // 3. Get the ID from your flat data array
    const index = gridY * this.width + gridX;
    const tileId = this.data[index];

    // 4. Return everything needed for collision
    return {
      id: tileId,
      gridX: gridX,
      gridY: gridY,
      worldX: gridX * this.tileSize,
      worldY: gridY * this.tileSize,
      size: this.tileSize,
    };
  }

  getDebugColor(tileId) {
    const colors = {
      1: "#444",
      2: "#2ecc71",
      3: "#3498db",
      4: "#e67e22",
    };

    return colors[tileId] || "#555";
  }

  update() {
    this.tiles.forEach((tile) => tile.update());
  }

  render(ctx, cameraX = 0, cameraY = 0) {
    ctx.drawImage(this.cacheCanvas, -cameraX, -cameraY);
  }
}
