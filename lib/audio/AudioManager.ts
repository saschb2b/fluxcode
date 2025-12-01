export type SoundCategory = "MASTER" | "BGM" | "SFX";

export interface AudioState {
  isInitialized: boolean;
  isMuted: boolean;
  volume: Record<SoundCategory, number>;
  currentTrackId: string | null;
}

interface IWindow extends Window {
  AudioContext: typeof AudioContext;
  webkitAudioContext: typeof AudioContext;
}

class AudioManager {
  private static instance: AudioManager;

  // Graph Nodes
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // State
  private state: AudioState = {
    isInitialized: false,
    isMuted: false,
    volume: {
      MASTER: 1.0,
      BGM: 0.8,
      SFX: 1.0,
    },
    currentTrackId: null,
  };

  // Resources
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private activeBgmSource: AudioBufferSourceNode | null = null;
  private activeBgmGain: GainNode | null = null;

  // Constants
  private readonly CROSSFADE_TIME = 1.5;
  private readonly DUCK_VOLUME = 0.3;
  private readonly DUCK_ATTACK = 0.1;
  private readonly DUCK_RELEASE = 0.8;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public getState(): Readonly<AudioState> {
    return this.state;
  }

  public async initialize(): Promise<void> {
    if (this.state.isInitialized || this.ctx) return;

    // Type assertion to access vendor-specific properties safely
    const win = window as unknown as IWindow;
    const AudioContextClass = win.AudioContext || win.webkitAudioContext;

    if (!AudioContextClass) {
      console.error("Web Audio API is not supported in this browser.");
      return;
    }

    const ctx = new AudioContextClass();
    this.ctx = ctx;

    this.masterGain = ctx.createGain();
    this.bgmGain = ctx.createGain();
    this.sfxGain = ctx.createGain();

    // Routing
    this.bgmGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    this.applyVolumes();
    this.state.isInitialized = true;

    if (ctx.state === "suspended") {
      await ctx.resume();
    }
  }

  public async loadSound(id: string, url: string): Promise<void> {
    // Capture context locally to satisfy TS
    const ctx = this.ctx;

    if (!ctx || this.audioBuffers.has(id)) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(id, audioBuffer);
    } catch (error) {
      console.error(`AudioManager: Failed to load sound "${id}"`, error);
    }
  }

  public playBGM(id: string): void {
    const ctx = this.ctx;
    const bgmGainNode = this.bgmGain;

    if (!ctx || !bgmGainNode || this.state.currentTrackId === id) return;

    const buffer = this.audioBuffers.get(id);
    if (!buffer) {
      console.warn(`AudioManager: BGM "${id}" not loaded.`);
      return;
    }

    const now = ctx.currentTime;

    // 1. Setup new track
    const newSource = ctx.createBufferSource();
    const newGain = ctx.createGain();

    newSource.buffer = buffer;
    newSource.loop = true;
    newGain.gain.value = 0;

    newSource.connect(newGain);
    newGain.connect(bgmGainNode);

    newSource.start(now);

    // 2. Crossfade IN
    newGain.gain.linearRampToValueAtTime(1.0, now + this.CROSSFADE_TIME);

    // 3. Crossfade OUT old
    if (this.activeBgmSource && this.activeBgmGain) {
      this.activeBgmGain.gain.cancelScheduledValues(now);
      this.activeBgmGain.gain.setValueAtTime(
        this.activeBgmGain.gain.value,
        now,
      );
      this.activeBgmGain.gain.linearRampToValueAtTime(
        0,
        now + this.CROSSFADE_TIME,
      );
      this.activeBgmSource.stop(now + this.CROSSFADE_TIME);
    }

    this.activeBgmSource = newSource;
    this.activeBgmGain = newGain;
    this.state.currentTrackId = id;
  }

  public playSFX(id: string, duckBgm = true): void {
    const ctx = this.ctx;
    const sfxGainNode = this.sfxGain;

    if (!ctx || !sfxGainNode) return;

    const buffer = this.audioBuffers.get(id);
    if (!buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(sfxGainNode);
    source.start(0);

    if (duckBgm) {
      this.triggerDucking(buffer.duration);
    }
  }

  private triggerDucking(duration: number): void {
    const ctx = this.ctx;
    const bgmGainNode = this.bgmGain;

    if (!ctx || !bgmGainNode) return;

    const now = ctx.currentTime;

    // Cancel existing automation to avoid conflicts
    bgmGainNode.gain.cancelScheduledValues(now);

    // Attack (Fade Down)
    bgmGainNode.gain.setValueAtTime(bgmGainNode.gain.value, now);
    bgmGainNode.gain.linearRampToValueAtTime(
      this.DUCK_VOLUME,
      now + this.DUCK_ATTACK,
    );

    // Release (Fade Up)
    const releaseStart = now + duration + 0.1;
    // We explicitly cast to number because TS knows state.volume.BGM is number,
    // but inside a callback sometimes logic gets fuzzy. Here it's fine.
    const targetVol = this.state.volume.BGM;
    bgmGainNode.gain.linearRampToValueAtTime(
      targetVol,
      releaseStart + this.DUCK_RELEASE,
    );
  }

  public setVolume(category: SoundCategory, value: number): void {
    const clamped = Math.max(0, Math.min(1, value));
    this.state.volume[category] = clamped;
    this.applyVolumes();
  }

  private applyVolumes(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const now = ctx.currentTime;

    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.state.isMuted ? 0 : this.state.volume.MASTER,
        now,
        0.1,
      );
    }

    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(this.state.volume.SFX, now, 0.1);
    }

    // Note: We don't forcefully set BGM gain here because it's controlled
    // by crossfading/ducking logic. If you want a global BGM volume slider,
    // you would add a separate 'bgmMasterGain' node before the individual tracks.
  }

  public toggleMute(): boolean {
    this.state.isMuted = !this.state.isMuted;
    this.applyVolumes();
    return this.state.isMuted;
  }
}

export const audioManager = AudioManager.getInstance();
