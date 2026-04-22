export class ManagerEntity {
  entities = [];
  paused = false;

  addEntity(entity) {
    console.log("adding ", entity);
    this.entities.push(entity);
  }

  getEntities() {
    return this.entities;
  }

  removeEntity(entity) {
    this.entities = this.entities.filter((e) => e !== entity);
  }

  clearEntities() {
    this.entities = [];
  }

  updateEntities(dt) {
    if (this.paused) return;
    this.entities.forEach((entity) => entity.update(dt));
    this.entities = this.entities.filter((entity) => !entity.destroyed);
  }

  renderEntities(ctx) {
    const sorted = [...this.entities].sort((a, b) => a.zIndex - b.zIndex);
    sorted.forEach((entity) => entity.render(ctx));
  }
}
