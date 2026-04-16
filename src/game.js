import { Camera } from "./class/camera/classCamera.js";
import { EntityCar } from "./class/entity/car/entityCar.js";
import { ManagerEntity } from "./manager/managerEntity.js";
import { ManagerMap } from "./manager/managerMap.js";

export class Game {
  static instance;

  camera = new Camera();
  managerMap = new ManagerMap();
  managerEntity = new ManagerEntity();
  input = new InputHandler();

  canvas = document.getElementById("gameCanvas");
  ctx = this.canvas.getContext("2d");

  lastTime = 0;

  constructor() {
    Game.instance = this;

    this.managerMap.generateMap();

    this.camera.setPosition(320, 320);

    this.init();
  }

  init() {
    const car = new EntityCar();
    this.managerEntity.addEntity(car);
    console.log("add");
    requestAnimationFrame((t) => this.loop(t));
  }

  loop() {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.update(dt);
    this.render(this.ctx);

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
