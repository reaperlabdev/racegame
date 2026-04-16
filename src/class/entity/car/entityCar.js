import { Game } from "../../../game.js";
import { Entity } from "../classEntity.js";

export class EntityCar extends Entity {
  constructor() {
    super(320, 320);
  }

  update(dt) {
    super(dt);
    if (Game.instance.input.isPressed("KeyW")) {
      this.velY = -1;
    }
    console.log("a")
  }

  render(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x-8, this.y-8, 16, 16)
  }
}
