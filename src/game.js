import { Camera } from "./class/camera/classCamera.js";
import { ManagerEntity } from "./manager/managerEntity.js";
import { ManagerMap } from "./manager/managerMap.js";

export class Game {
  static instance;

  camera = new Camera();
  managerMap = new ManagerMap();
  managerEntity = new ManagerEntity();

  ctx = Document.getElementById("canvas").getContext("2d");

  constructor() {
    Game.instance = this;

    this.managerMap
      .loadMap("././assets/map.json", "././assets/tileset.png")
      .then(() => {
        this.init();
      });
  }

  init() {
    this.loop();
  }

  loop() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    this.camera.update();
    this.managerMap.update();
    this.managerEntity.updateEntities();
  }

  render() {
    this.camera.render();
    this.managerMap.render(this.ctx, this.camera.x, this.camera.y);
    this.managerEntity.renderEntities();
  }
}
