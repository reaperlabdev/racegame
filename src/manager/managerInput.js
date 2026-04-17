export class ManagerInput {
  constructor() {
    this.keys = {};

    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // touch
    this.touch = {
      gas: false,
      brake: false,
    };

    // gyro
    this.roll = 0;

    this.initTouchButtons();
    this.initGyro();
  }

  // -------------------------
  // TOUCH BUTTONS (FIXED)
  // -------------------------
  initTouchButtons() {
    const bind = () => {
      const gasBtn = document.getElementById("gasBtn");
      const brakeBtn = document.getElementById("brakeBtn");

      if (!gasBtn || !brakeBtn) return false;

      const setGas = (v) => (this.touch.gas = v);
      const setBrake = (v) => (this.touch.brake = v);

      const bindBtn = (el, set) => {
        el.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          set(true);
        });

        el.addEventListener("pointerup", (e) => {
          e.preventDefault();
          set(false);
        });

        el.addEventListener("pointercancel", () => set(false));
        el.addEventListener("pointerleave", () => set(false));

        el.style.touchAction = "none";
      };

      bindBtn(gasBtn, setGas);
      bindBtn(brakeBtn, setBrake);

      return true;
    };

    // buttons might not exist instantly → retry safe
    if (!bind()) {
      setTimeout(() => bind(), 300);
    }
  }

  // -------------------------
  // GYRO (FIXED - ONLY ONCE)
  // -------------------------
  initGyro() {
    const handle = (e) => {
      if (e.gamma == null) return;

      const maxTilt = 45;
      let normalized = e.gamma / maxTilt;

      normalized = Math.max(-1, Math.min(1, normalized));

      if (Math.abs(normalized) < 0.05) normalized = 0;

      this.roll += (normalized - this.roll) * 0.1;
    };

    const attach = () => {
      window.addEventListener("deviceorientation", handle);
    };

    // iOS permission
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      window.addEventListener(
        "pointerdown",
        async () => {
          try {
            const res = await DeviceOrientationEvent.requestPermission();
            if (res === "granted") attach();
          } catch (e) {}
        },
        { once: true },
      );
    } else {
      attach();
    }
  }

  // -------------------------
  // HELPERS
  // -------------------------
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
