import { Camera } from "./class/camera/classCamera.js";
import { EntityCar } from "./class/entity/car/entityCar.js";
import { ManagerAudio } from "./manager/managerAudio.js";
import { ManagerEntity } from "./manager/managerEntity.js";
import { ManagerInput } from "./manager/managerInput.js";
import { ManagerMap } from "./manager/managerMap.js";
import { ManagerSpawner } from "./manager/managerSpawner.js";

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

    this.managerAudio = new ManagerAudio();
    this.managerAudio.load("crash", "/sounds/crash.wav", { volume: 0.8 });
    this.managerAudio.load("hit", "/sounds/hit.wav", { volume: 0.8 });

    this.ctx.imageSmoothingEnabled = false;

    this.managerMap.loadMap("./maps/level1.json", "./assets/tilesheet.png");

    this.camera.setPosition(320, 320);
    this.camera.setZoom(0.6);

    this.copSpawner = new ManagerSpawner();

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
    this.copSpawner.update(dt);
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
