import { Tile } from "../map/tile/tile.js";

export class Map {
  constructor(mapData, tilesetImage) {
    this.mapData = mapData;
    this.tilesetImage = tilesetImage;
    this.tileSize = mapData.tileSize || 16;
    this.tiles = [];

    // 1. Create an off-screen canvas for caching
    this.cacheCanvas = document.createElement("canvas");
    this.cacheCanvas.width = this.mapData.width * this.tileSize;
    this.cacheCanvas.height = this.mapData.height * this.tileSize;
    this.cacheCtx = this.cacheCanvas.getContext("2d");

    // 2. Build the map and render it to the cache once
    this.buildAndCacheMap();
  }

  buildAndCacheMap() {
    const { width, data } = this.mapData;
    const tilesPerRow = this.tilesetImage.width / this.tileSize;

    let col = 0;
    let row = 0;

    for (let i = 0; i < data.length; i++) {
      const tileId = data[i];

      if (tileId !== 0) {
        // Assuming 0 is empty air
        // Calculate where this tile is located on the tileset image
        const sourceX = ((tileId - 1) % tilesPerRow) * this.tileSize;
        const sourceY = Math.floor((tileId - 1) / tilesPerRow) * this.tileSize;

        const x = col * this.tileSize;
        const y = row * this.tileSize;

        const tile = new Tile(
          x,
          y,
          this.tileSize,
          this.tilesetImage,
          sourceX,
          sourceY,
        );
        this.tiles.push(tile);

        // Render the tile immediately onto our off-screen cache context
        tile.render(this.cacheCtx);
      }

      // Move to the next column/row
      col++;
      if (col >= width) {
        col = 0;
        row++;
      }
    }
  }

  update() {
    // Only update tiles if they have dynamic behavior
    for (const tile of this.tiles) {
      tile.update();
    }
  }

  render(mainCtx, cameraX = 0, cameraY = 0) {
    // PERFORMANCE BOOST: Draw the entire map in a single draw call!
    mainCtx.drawImage(this.cacheCanvas, -cameraX, -cameraY);
  }
}
