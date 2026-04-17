export class ManagerInput {
  constructor() {
    this.keys = {};

    window.addEventListener(
      "click",
      () => {
        Game.instance.input.initGyro();
      },
      { once: true },
    );

    // keyboard
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // gyro
    this.roll = 0; // -1 (left) → 1 (right)
    this.rawGamma = 0;

    // iOS requires permission
    this.initGyro();
  }

  async initGyro() {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") return;
      } catch (e) {
        return;
      }
    }

    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma == null) return;

      this.rawGamma = e.gamma;

      // normalize gamma (-45 to 45 is typical comfortable tilt)
      const maxTilt = 45;
      let normalized = e.gamma / maxTilt;

      // clamp to [-1, 1]
      normalized = Math.max(-1, Math.min(1, normalized));

      // smooth it (important)
      this.roll += (normalized - this.roll) * 0.1;
    });
  }

  isPressed(code) {
    return !!this.keys[code];
  }

  // helper for analog steering
  getRoll() {
    return this.roll;
  }
}
