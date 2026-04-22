export class ManagerAudio {
  constructor() {
    this.sounds = new Map(); // { audio, poolSize, volume }
    this.pools = new Map(); // name → Audio[]
    this.poolIndex = new Map(); // name → current index
    this.music = null;
  }

  load(name, src, { loop = false, volume = 1, pool = 4 } = {}) {
    const instances = Array.from({ length: pool }, () => {
      const a = new Audio(src);
      a.loop = loop;
      a.volume = volume;
      return a;
    });
    this.sounds.set(name, { volume, loop });
    this.pools.set(name, instances);
    this.poolIndex.set(name, 0);
  }

  play(name, { volume, rate } = {}) {
    const pool = this.pools.get(name);
    if (!pool) return;

    const i = this.poolIndex.get(name);
    const sound = pool[i];

    this.poolIndex.set(name, (i + 1) % pool.length);

    sound.currentTime = 0;
    if (volume !== undefined) sound.volume = volume;
    if (rate !== undefined) sound.playbackRate = rate;
    sound.play().catch(() => {}); // suppress AbortError on rapid calls
  }

  playLoop(name) {
    const pool = this.pools.get(name);
    if (!pool) return;
    if (this.music) this.music.pause();
    this.music = pool[0];
    this.music.currentTime = 0;
    this.music.loop = true;
    this.music.play().catch(() => {});
  }

  stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music = null;
    }
  }
}
