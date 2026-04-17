export class ManagerAudio {
  constructor() {
    this.sounds = new Map();
    this.music = null;
  }

  load(name, src, { loop = false, volume = 1 } = {}) {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;

    this.sounds.set(name, audio);
  }

  play(name, { volume, rate } = {}) {
    const sound = this.sounds.get(name);
    if (!sound) return;

    const clone = sound.cloneNode(); // allows overlapping sounds
    if (volume !== undefined) clone.volume = volume;
    if (rate !== undefined) clone.playbackRate = rate;

    clone.play();
  }

  playLoop(name) {
    const sound = this.sounds.get(name);
    if (!sound) return;

    if (this.music) {
      this.music.pause();
    }

    this.music = sound;
    this.music.currentTime = 0;
    this.music.loop = true;
    this.music.play();
  }

  stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music = null;
    }
  }
}
