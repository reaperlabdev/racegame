import { Map } from "../class/map/classMap.js";

export class ManagerMap {
  maps = [];
  
  
  constructor() {
   
  }

  async loadMap(jsonUrl, tilesetImageUrl) {
    try {
      const response = await fetch(jsonUrl);
      const mapData = await response.json();

      const image = new Image();
      image.src = tilesetImageUrl;
      
      await new Promise((resolve) => {
        image.onload = resolve;
      });

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