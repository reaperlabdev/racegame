export class Camera {
  x = 0;
  y = 0;
  fieldOfView = 80;
  roll = 0;
  
  constructor() {
    
  }
  
  update() {
    
  }
  
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
  
  setRoll(roll) {
    this.roll = roll;
  }
  
  setFieldOfView(fov) {
    this.fieldOfView = fov;
  }
  
  getPosition() {
    return { x: this.x, y: this.y };
  }
  
  getRoll() {
    return this.roll;
  }
  
  getFieldOfView() {
    return this.fieldOfView;
  }

  
}