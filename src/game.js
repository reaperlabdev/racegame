import { Camera } from "./class/camera/classCamera.js";
import { EntityCar } from "./class/entity/car/entityCar.js";
import { ManagerEntity } from "./manager/managerEntity.js";
import { ManagerInput } from "./manager/managerInput.js";
import { ManagerMap } from "./manager/managerMap.js";

export class Game {
  static instance;

  camera = new Camera();
  managerMap = new ManagerMap();
  managerEntity = new ManagerEntity();
  input = new ManagerInput();

  canvas = document.getElementById("gameCanvas");
  ctx = this.canvas.getContext("2d");

  lastTime = 0;

  constructor() {
    Game.instance = this;

    this.ctx.imageSmoothingEnabled = false;

    const img = new Image();
    img.src = "./assets/tilesheet.png";
    img.onload = () => {
      this.managerMap.generateMap(1280, 1280, img);
      this.init();
    };

    this.camera.setPosition(320, 320);

    console.log("init");
    this.init();
  }

  init() {
    const car = new EntityCar();
    this.managerEntity.addEntity(car);
    console.log("add");
    requestAnimationFrame((t) => this.loop(t));
  }

  loop() {
    const currentTime = performance.now();
    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.update(dt);
    this.render(this.ctx);

    requestAnimationFrame(() => this.loop());
  }

  update(dt) {
    this.camera.update(dt);
    this.managerMap.update(dt);
    this.managerEntity.updateEntities(dt);
  }

  render() {
    this.camera.apply(this.ctx, this.ctx.canvas);

    this.managerMap.render(this.ctx, 0, 0);
    this.managerEntity.renderEntities(this.ctx);
  }
}

new Game();
