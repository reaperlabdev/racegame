export class ManagerInput {
  constructor() {
    this.keys = {};

    // keyboard
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // touch state
    this.touch = {
      gas: false,
      brake: false,
    };

    this.roll = 0;

    this.initGyro();
    this.initTouch();
  }

  initTouch() {
    window.addEventListener("touchstart", (e) => {
      for (const t of e.touches) {
        this.updateTouch(t.clientX, true);
      }
    });

    window.addEventListener("touchmove", (e) => {
      for (const t of e.touches) {
        this.updateTouch(t.clientX, true);
      }
    });

    window.addEventListener("touchend", () => {
      this.touch.gas = false;
      this.touch.brake = false;
    });
  }

  updateTouch(x, active) {
    const width = window.innerWidth;

    // left side = brake, right side = gas
    if (x < width / 2) {
      this.touch.brake = active;
    } else {
      this.touch.gas = active;
    }
  }

  isPressed(code) {
    return !!this.keys[code];
  }

  isGas() {
    return this.touch.gas || this.isPressed("KeyW");
  }

  isBrake() {
    return (
      this.touch.brake || this.isPressed("Space") || this.isPressed("KeyS")
    );
  }

  getRoll() {
    return this.roll;
  }
}
