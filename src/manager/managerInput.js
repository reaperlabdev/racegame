export class ManagerInput {
  constructor() {
    // Keyboard
    this.keys = {};
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // Touch
    this.touch = { gas: false, brake: false };

    // Gyro
    this.roll = 0;
    this._targetRoll = 0;
    this._gyroAttached = false;
    this._gyroHandler = null;

    this._initTouchButtons();
    this._initGyro();
  }

  // ─── TOUCH BUTTONS ───────────────────────────────────────────────────────────

  _initTouchButtons() {
    const attempt = () => {
      const gas = document.getElementById("gasBtn");
      const brake = document.getElementById("brakeBtn");
      if (!gas || !brake) {
        setTimeout(attempt, 300);
        return;
      }

      this._bindBtn(gas, (v) => {
        this.touch.gas = v;
      });
      this._bindBtn(brake, (v) => {
        this.touch.brake = v;
      });
    };
    attempt();
  }

  _bindBtn(el, set) {
    el.style.touchAction = "none";
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
  }

  // ─── GYROSCOPE ───────────────────────────────────────────────────────────────

  _initGyro() {
    this._gyroHandler = (e) => {
      if (e.gamma == null) return;
      let v = e.gamma / 45;
      v = Math.max(-1, Math.min(1, v));
      if (Math.abs(v) < 0.05) v = 0;
      this.roll = v;
    };

    const isIOS =
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function";

    if (!isIOS) {
      window.addEventListener("deviceorientation", this._gyroHandler);
      this._gyroAttached = true;
      return;
    }

    // iOS — retry until overlay exists
    const attempt = () => {
      const overlay = document.getElementById("startOverlay");
      if (!overlay) {
        setTimeout(attempt, 300);
        return;
      }
      overlay.style.display = "flex";
      overlay.addEventListener(
        "pointerdown",
        async () => {
          try {
            const result = await DeviceOrientationEvent.requestPermission();
            if (result === "granted") {
              window.addEventListener("deviceorientation", this._gyroHandler);
              this._gyroAttached = true;
            } else {
              console.warn("[Input] Gyro permission denied");
            }
          } catch (err) {
            console.warn("[Input] Gyro permission error:", err);
          } finally {
            overlay.style.display = "none";
          }
        },
        { once: true },
      );
    };
    attempt();
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────────

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
