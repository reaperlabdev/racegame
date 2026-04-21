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
    this._motionAttached = false;
    this._motionHandler = null;
    // Ready promise
    this.ready = new Promise((resolve) => {
      this._resolveReady = resolve;
    });
    this._initTouchButtons();
    this._initMotion();
  }

  // ─── TOUCH BUTTONS ──────────────────────────────────────────────────────────
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

  // ─── MOTION ─────────────────────────────────────────────────────────────────
  _initMotion() {
    this._motionHandler = (e) => {
      const x = e.rotationRate?.gamma;
      if (x == null) return;
      let v = x / 9.8;
      v = Math.max(-1, Math.min(1, v));
      if (Math.abs(v) < 0.05) v = 0;
      this.roll = v;
    };

    const isIOS =
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function";

    if (!isIOS) {
      window.addEventListener("devicemotion", this._motionHandler);
      this._motionAttached = true;
      this._resolveReady();
      return;
    }

    // iOS — needs a user gesture before requesting permission
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
            const result = await DeviceMotionEvent.requestPermission();
            if (result === "granted") {
              window.addEventListener("devicemotion", this._motionHandler);
              this._motionAttached = true;
            } else {
              console.warn("[Input] Motion permission denied");
            }
          } catch (err) {
            console.warn("[Input] Motion permission error:", err);
          } finally {
            overlay.style.display = "none";
            this._resolveReady();
          }
        },
        { once: true },
      );
    };
    attempt();
  }

  // ─── PUBLIC API ─────────────────────────────────────────────────────────────
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
