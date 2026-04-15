import { Camera } from "./class/camera/classCamera.js";
import { ManagerEntity } from "./manager/managerEntity.js";
import { ManagerMap } from "./manager/managerMap.js";

export class Game {
  static instance;

  camera = new Camera();
  managerMap = new ManagerMap();
  managerEntity = new ManagerEntity();

  canvas = document.getElementById("gameCanvas");
  ctx = this.canvas.getContext("2d");

  constructor() {
    Game.instance = this;

    this.managerMap.generateMap();

    this.camera.setPosition(320, 320);
    this.init();
  }

  init() {
    this.loop();
  }

  loop() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
    this.camera.apply(this.ctx, this.ctx.canvas);

    this.managerMap.render(this.ctx, 0, 0);
    this.managerEntity.renderEntities();
  }
}

new Game();
