import { ClassCamera } from "./classCamera";
import { ManagerEntity } from "./manager/managerEntity";
import { ManagerMap } from "./manager/managerMap";

export class Game {
  static instance;

  camera = new ClassCamera();
  managerMap = new ManagerMap();
  managerEntity = new ManagerEntity();

  ctx = Document.getElementById("canvas").getContext("2d");

  constructor() {
    Game.instance = this;
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
