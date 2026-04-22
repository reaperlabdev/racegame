export class ManagerHud {
  ui = [];

  constructor() {}

  addHud(ui) {
    this.ui.push(ui);
  }

  render(ctx) {
    this.ui.forEach((ui) => ui.render(ctx));
  }

  update(dt) {
    this.ui.forEach((ui) => ui.update(dt));
  }
}
