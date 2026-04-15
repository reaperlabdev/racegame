import { Map } from "../class/map/classMap.js";

export class ManagerMap {
  maps = [];
  
  constructor() {
    // You could initialize an active map index here if you have multiple levels
  }

  // Load the JSON data and the tileset image, then create the Map
  async loadMap(jsonUrl, tilesetImageUrl) {
    try {
      // Fetch map JSON
      const response = await fetch(jsonUrl);
      const mapData = await response.json();

      // Load tileset Image
      const image = new Image();
      image.src = tilesetImageUrl;
      
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      // Create and store the new cached map
      const newMap = new Map(mapData, image);
      this.maps.push(newMap);
      
      console.log("Map loaded and cached successfully!");
    } catch (error) {
      console.error("Failed to load map:", error);
    }
  }

  update() {
    for (let i = 0; i < this.maps.length; i++) {
      this.maps[i].update();
    }
  }

  render(ctx, cameraX = 0, cameraY = 0) {
    for (let i = 0; i < this.maps.length; i++) {
      this.maps[i].render(ctx, cameraX, cameraY);
    }
  }
}