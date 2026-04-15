export class ManagerEntity {
  entities = [];
  
  addEntity(entity) {
    this.entities.push(entity);
  }
  
  getEntities() {
    return this.entities;
  }

  removeEntity(entity) {
    this.entities = this.entities.filter(e => e !== entity);
  }
  
  clearEntities() {
    this.entities = [];
  }

  updateEntities() {
    this.entities.forEach(entity => entity.update());
  }
  
  renderEntities() {
    this.entities.forEach(entity => entity.render());
  }  
}