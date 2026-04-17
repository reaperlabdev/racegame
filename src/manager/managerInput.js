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

    // touch state (for buttons)
    this.touch = {
      gas: false,
      brake: false,
    };

    // gyro
    this.roll = 0;

    this.initGyro();
    this.initTouchButtons();
  }

  async initGyro() {
    const handle = (e) => {
      if (e.gamma == null) return;

      const maxTilt = 45;
      let normalized = e.gamma / maxTilt;

      normalized = Math.max(-1, Math.min(1, normalized));

      if (Math.abs(normalized) < 0.05) normalized = 0;

      this.roll += (normalized - this.roll) * 0.1;
    };

    // iOS permission support
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      const enable = async () => {
        try {
          const res = await DeviceOrientationEvent.requestPermission();
          if (res === "granted") {
            window.addEventListener("deviceorientation", handle);
          }
        } catch (e) {}
      };

      window.addEventListener("pointerdown", enable, { once: true });
    } else {
      window.addEventListener("deviceorientation", handle);
    }
  }

  // ----------------------------
  // 🔥 TOUCH BUTTON SYSTEM (FIXED)
  // ----------------------------
  initTouchButtons() {
    const gasBtn = document.getElementById("gasBtn");
    const brakeBtn = document.getElementById("brakeBtn");

    if (!gasBtn || !brakeBtn) return;

    const setGas = (v) => (this.touch.gas = v);
    const setBrake = (v) => (this.touch.brake = v);

    // GAS BUTTON
    gasBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      setGas(true);
    });

    gasBtn.addEventListener("pointerup", (e) => {
      e.preventDefault();
      setGas(false);
    });

    gasBtn.addEventListener("pointercancel", () => setGas(false));
    gasBtn.addEventListener("pointerleave", () => setGas(false));

    // BRAKE BUTTON
    brakeBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      setBrake(true);
    });

    brakeBtn.addEventListener("pointerup", (e) => {
      e.preventDefault();
      setBrake(false);
    });

    brakeBtn.addEventListener("pointercancel", () => setBrake(false));
    brakeBtn.addEventListener("pointerleave", () => setBrake(false));

    // IMPORTANT: prevent scroll/zoom stealing input
    gasBtn.style.touchAction = "none";
    brakeBtn.style.touchAction = "none";
  }

  // ----------------------------
  // 📱 GYRO SUPPORT (ROLL)
  // ----------------------------
  async initGyro() {
    const handle = (e) => {
      if (e.gamma == null) return;

      const maxTilt = 45;
      let normalized = e.gamma / maxTilt;

      // clamp
      normalized = Math.max(-1, Math.min(1, normalized));

      // deadzone (prevents jitter)
      if (Math.abs(normalized) < 0.05) normalized = 0;

      // smoothing
      this.roll += (normalized - this.roll) * 0.1;
    };

    // iOS permission handling
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      const enableGyro = async () => {
        try {
          const res = await DeviceOrientationEvent.requestPermission();
          if (res === "granted") {
            window.addEventListener("deviceorientation", handle);
          }
        } catch (e) {}
      };

      window.addEventListener("pointerdown", enableGyro, { once: true });
    } else {
      window.addEventListener("deviceorientation", handle);
    }
  }

  // ----------------------------
  // INPUT HELPERS
  // ----------------------------
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
