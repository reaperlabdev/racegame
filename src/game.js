import { Camera } from "./class/camera/classCamera.js";
import { EntityCar } from "./class/entity/car/entityCar.js";
import { HudBase } from "./class/hud/base/hudBase.js";
import { ManagerAudio } from "./manager/managerAudio.js";
import { ManagerEntity } from "./manager/managerEntity.js";
import { ManagerHud } from "./manager/managerHud.js";
import { ManagerInput } from "./manager/managerInput.js";
import { ManagerMap } from "./manager/managerMap.js";
import { ManagerSpawner } from "./manager/managerSpawner.js";

export class Game {
  static instance;

  camera = new Camera();
  managerMap = new ManagerMap();
  managerHud = new ManagerHud();
  managerEntity = new ManagerEntity();
  input = new ManagerInput();

  canvas = document.getElementById("gameCanvas");
  ctx = this.canvas.getContext("2d");

  globals = {
    score: 0,
  };

  lastTime = 0;

  constructor() {
    Game.instance = this;
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.managerAudio = new ManagerAudio();
    this.managerAudio.load("crash", "./sounds/crash.wav", { volume: 0.8 });
    this.managerAudio.load("hit", "./sounds/hit.wav", { volume: 0.8 });
    this.ctx.imageSmoothingEnabled = false;
    this.managerMap.loadMap("./maps/level1.json", "./assets/tilesheet.png");
    this.camera.setPosition(320, 320);
    this.camera.setZoom(2);
    this.copSpawner = new ManagerSpawner();
    console.log("init");
    this.input.ready.then(() => this.init());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.ctx) this.ctx.imageSmoothingEnabled = false;
    if (this.camera) {
      this.camera.setViewport(this.canvas.width, this.canvas.height);
    }
  }

  init() {
    const baseHud = new HudBase();
    this.managerHud.addHud(baseHud);

    const car = new EntityCar();
    this.managerEntity.addEntity(car);

    this.globals.score = 0;

    console.log("add");
    requestAnimationFrame((t) => {
      this.lastTime = t;
      this.loop(t);
    });
  }

  loop(time) {
    let dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    dt = Math.min(dt, 1 / 30);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.update(dt);
    this.render(this.ctx);

    const entities = this.managerEntity.entities;
    const player = entities.find((e) => e instanceof EntityCar);
    if (player && player.health <= 0) {
      this.managerEntity.paused = true;
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.copSpawner.update(dt);
    this.camera.update(dt);
    this.managerMap.update(dt);
    this.managerHud.update(dt);
    this.managerEntity.updateEntities(dt);
  }

  render() {
    this.camera.apply(this.ctx, this.ctx.canvas);

    this.managerMap.render(this.ctx, 0, 0);
    this.managerEntity.renderEntities(this.ctx);
    this.managerHud.render(this.ctx);
  }
}

new Game();
