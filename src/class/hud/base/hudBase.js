import { Game } from "../../../game.js";
import { Hud } from "../classHud.js";

export class HudBase extends Hud {
  constructor() {
    super();
  }

  update(dt) {}

  render(ctx) {
    ctx.save();
    ctx.resetTransform();
    ctx.scale(2, 2);

    // SCORE (screen space)
    ctx.fillStyle = "black";
    ctx.fillText("SCORE: " + Game.instance.globals.score, 8, 17);
    ctx.fillStyle = "white";
    ctx.fillText("SCORE: " + Game.instance.globals.score, 7, 16);

    ctx.restore();
  }
}
