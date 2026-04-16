import { Map } from "../class/map/classMap.js";

export class ManagerMap {
  maps = [];

  constructor() {}

  async loadMap(jsonUrl, tilesetImageUrl = null) {
    try {
      const response = await fetch(jsonUrl);
      const mapData = await response.json();

      let image = null;

      if (tilesetImageUrl) {
        image = new Image();
        image.src = tilesetImageUrl;

        await new Promise((resolve) => {
          image.onload = resolve;
        });
      }

      const newMap = new Map(mapData, image);
      this.maps.push(newMap);

      console.log("Map loaded and cached successfully!");
    } catch (error) {
      console.error("Failed to load map:", error);
    }
  }

  generateMap(pixelWidth = 640, pixelHeight = 640, tilesetImage = null) {
    const tileSize = 16;

    const width = Math.floor(pixelWidth / tileSize);
    const height = Math.floor(pixelHeight / tileSize);

    const data = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
          data.push(1);
        } else {
          const rand = Math.random();

          if (rand < 0.1) data.push(3);
          else if (rand < 0.2) data.push(2);
          else data.push(0);
        }
      }
    }

    const mapData = {
      width,
      height,
      tileSize,
      data,
    };

    const newMap = new Map(mapData, tilesetImage);
    this.maps.push(newMap);

    console.log(
      `Generated map: ${pixelWidth}x${pixelHeight} (${width}x${height} tiles)`,
    );

    return newMap;
  }

  update() {
    this.maps.forEach((map) => map.update());
  }

  render(ctx, cameraX = 0, cameraY = 0) {
    this.maps.forEach((map) => {
      map.render(ctx, cameraX, cameraY);
    });
  }
}
