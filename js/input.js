// input.js — Keyboard, gyroscope, and touch input

export class InputHandler {
    constructor() {
        this.steer     = 0;       // -1 (left) … 0 … 1 (right)
        this.isBraking = false;
        this.usingGyro = false;

        this._keys = {};
        this._bindKeyboard();
        this._bindTouch();
    }

    // ─── Gyroscope ────────────────────────────────────────────────────────────

    /**
     * Call once after user interaction to request permission (required on iOS 13+)
     * and start listening to device orientation.
     */
    enableGyro() {
        if (
            typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function'
        ) {
            DeviceOrientationEvent.requestPermission()
                .then(state => {
                    if (state === 'granted') {
                        window.addEventListener('deviceorientation', e => this._handleOrientation(e));
                    }
                })
                .catch(console.error);
        } else {
            window.addEventListener('deviceorientation', e => this._handleOrientation(e));
        }
    }

    _handleOrientation(e) {
        const isLandscape = window.innerWidth > window.innerHeight;
        let tilt = isLandscape ? e.beta : e.gamma;
        if (tilt === null) return;

        this.usingGyro = true;

        // Correct for upside-down landscape (270°)
        if (
            isLandscape &&
            screen.orientation &&
            screen.orientation.angle === 270
        ) {
            tilt = -tilt;
        }

        // Dead-zone to suppress micro-wobble
        if (Math.abs(tilt) < 3) tilt = 0;

        tilt = Math.max(-45, Math.min(45, tilt));
        this.steer = Math.max(-1, Math.min(1, tilt / 30));
    }

    // ─── Keyboard (desktop fallback) ─────────────────────────────────────────

    _bindKeyboard() {
        window.addEventListener('keydown', e => {
            this._keys[e.key] = true;
            if (e.key === 'ArrowLeft')  this.steer     = -1;
            if (e.key === 'ArrowRight') this.steer     =  1;
            if (e.key === 'ArrowDown')  this.isBraking = true;
        });

        window.addEventListener('keyup', e => {
            this._keys[e.key] = false;
            if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !this.usingGyro) {
                this.steer = 0;
            }
            if (e.key === 'ArrowDown') this.isBraking = false;
        });
    }

    // ─── Touch (brake on tap/hold) ────────────────────────────────────────────

    _bindTouch() {
        window.addEventListener('touchstart', () => {
            // Only brake after the game is running; the game module checks this
            this.isBraking = true;
        });
        window.addEventListener('touchend', () => {
            this.isBraking = false;
        });
    }
}
