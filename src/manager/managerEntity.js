export class ManagerEntity {
  entities = [];

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
    this.entities.forEach((entity) => entity.update(dt));
  }

  renderEntities(ctx) {
    this.entities.forEach((entity) => entity.render(ctx));
  }
}
