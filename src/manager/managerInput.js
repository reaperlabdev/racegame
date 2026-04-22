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

    // Ready promise
    this.ready = new Promise((resolve) => {
      this._resolveReady = resolve;
    });

    this._initTouchButtons();
    this._initMotion();
  }

  // ─── TOUCH BUTTONS ─────────────────────────────
  _initTouchButtons() {
    const attempt = () => {
      const gas = document.getElementById("gasBtn");
      const brake = document.getElementById("brakeBtn");

      if (!gas || !brake) {
        setTimeout(attempt, 300);
        return;
      }

      this._bindBtn(gas, (v) => (this.touch.gas = v));
      this._bindBtn(brake, (v) => (this.touch.brake = v));
    };

    attempt();
  }

  _bindBtn(el, set) {
    el.style.touchAction = "none";

    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      set(true);
    });

    el.addEventListener("pointerup", (e) => {
      e.preventDefault();
      el.releasePointerCapture(e.pointerId);
      set(false);
    });

    el.addEventListener("pointercancel", () => set(false));
    el.addEventListener("lostpointercapture", () => set(false));
  }

  // ─── MOTION ───────────────────────────────────
  _initMotion() {
    this._motionHandler = (e) => {
      let v = (e.gamma ?? 0) / 45;
      v = Math.max(-1, Math.min(1, v));
      if (Math.abs(v) < 0.08) v = 0; // deadzone
      this.roll = v;
    };

    const isIOS =
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function";

    if (!isIOS) {
      window.addEventListener("deviceorientation", this._motionHandler);
      this._motionAttached = true;
      this._resolveReady();
      return;
    }

    const attempt = () => {
      const overlay = document.getElementById("startOverlay");
      if (!overlay) {
        setTimeout(attempt, 300);
        return;
      }
      overlay.style.display = "flex";
      overlay.addEventListener(
        "click",
        () => {
          DeviceOrientationEvent.requestPermission()
            .then((result) => {
              if (result === "granted") {
                window.addEventListener(
                  "deviceorientation",
                  this._motionHandler,
                );
                this._motionAttached = true;
              } else {
                console.warn("Orientation permission denied");
              }
            })
            .catch((err) => console.warn("Orientation error:", err))
            .finally(() => {
              overlay.style.display = "none";
              this._resolveReady();
            });
        },
        { once: true },
      );
    };
    attempt();
  }

  // ─── PUBLIC API ───────────────────────────────
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
