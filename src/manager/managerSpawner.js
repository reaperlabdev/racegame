import { EntityCar } from "../class/entity/car/entityCar.js";
import { EntityCop } from "../class/entity/car/entityCop.js";
import { Game } from "../game.js";

export class ManagerSpawner {
  constructor() {
    this.spawnRadius = 400; // distance from player
    this.maxCops = 6; // cap
    this.spawnCooldown = 2; // seconds
    this.timer = 0;
  }

  update(dt) {
    this.timer -= dt;

    if (this.timer > 0) return;

    const entities = Game.instance.managerEntity.getEntities();
    const cops = entities.filter((e) => e instanceof EntityCop);
    const player = entities.find(
      (e) => e instanceof EntityCar && !(e instanceof EntityCop),
    );

    if (!player) return;
    if (cops.length >= this.maxCops) return;

    this.spawnCopNear(player);

    this.timer = this.spawnCooldown;
  }

  spawnCopNear(player) {
    const map = Game.instance.managerMap.maps[0];
    if (!map) return;

    const mapWidth = map.width * map.tileSize;
    const mapHeight = map.height * map.tileSize;

    const angle = Math.random() * Math.PI * 2;
    const distance = this.spawnRadius + Math.random() * 200;

    let x = player.x + Math.cos(angle) * distance;
    let y = player.y + Math.sin(angle) * distance;

    x = Math.max(64, Math.min(mapWidth - 64, x));
    y = Math.max(64, Math.min(mapHeight - 64, y));

    const cop = new EntityCop(x, y);
    Game.instance.managerEntity.addEntity(cop);
  }

  // manual spawn (for events, wanted level, etc.)
  spawnAt(x, y) {
    const cop = new EntityCop(x, y);
    Game.instance.managerEntity.addEntity(cop);
  }
}
