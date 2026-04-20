export class ManagerInput {
  constructor() {
    this.keys = {};
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    this.touch = { gas: false, brake: false };
    this.roll = 0;
    this._gyroAttached = false;

    this.initTouchButtons();
    this.initGyro();
  }

  initTouchButtons() {
    const bind = () => {
      const gasBtn = document.getElementById("gasBtn");
      const brakeBtn = document.getElementById("brakeBtn");
      if (!gasBtn || !brakeBtn) return false;

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

      bindBtn(gasBtn, (v) => (this.touch.gas = v));
      bindBtn(brakeBtn, (v) => (this.touch.brake = v));
      return true;
    };

    if (!bind()) setTimeout(() => bind(), 300);
  }

  initGyro() {
    this._gyroHandler = (e) => {
      if (e.gamma == null) return;
      let normalized = Math.max(-1, Math.min(1, e.gamma / 45));
      if (Math.abs(normalized) < 0.05) normalized = 0;
      this.roll += (normalized - this.roll) * 0.1;
    };

    // Android / desktop — no permission API, attach immediately
    if (
      typeof DeviceOrientationEvent === "undefined" ||
      typeof DeviceOrientationEvent.requestPermission !== "function"
    ) {
      window.addEventListener("deviceorientation", this._gyroHandler);
      this._gyroAttached = true;
      return;
    }

    // iOS — show overlay and request permission on tap
    const overlay = document.getElementById("startOverlay");
    if (overlay) {
      overlay.style.display = "flex";
      overlay.addEventListener(
        "pointerdown",
        async () => {
          try {
            const res = await DeviceOrientationEvent.requestPermission();
            if (res === "granted") {
              window.addEventListener("deviceorientation", this._gyroHandler);
              this._gyroAttached = true;
            } else {
              console.warn("Gyro permission denied by user");
            }
          } catch (e) {
            console.warn("Gyro permission error:", e);
          } finally {
            overlay.style.display = "none";
          }
        },
        { once: true },
      );
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
