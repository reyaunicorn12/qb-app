// =========================================================
// 🌊 TROPICAL AUDIO SYNTHESIZER (Web Audio API)
// Zero external files needed - purely synthesized sounds!
// =========================================================

class BeachAudioEngine {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.ambientWavesRunning = false;
    this.waveNodes = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPowerChime() {
    if (!this.sfxEnabled) return;
    this.init();

    // Tropical Marimba Pentatonic Chord: G5, B5, D6, G6
    const notes = [783.99, 987.77, 1174.66, 1567.98];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  }

  playTenChime() {
    if (!this.sfxEnabled) return;
    this.init();

    // Tropical High Bell: E5 then A5
    const now = this.ctx.currentTime;
    [659.25, 880.00].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.55);
    });
  }

  playNegBonk() {
    if (!this.sfxEnabled) return;
    this.init();

    // Hollow Coconut / Woodblock drop: Low resonant bandpass pitch
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  playBuzzerSound() {
    if (!this.sfxEnabled) return;
    this.init();

    // Standard Quiz Bowl buzzer beep
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(523.25, now + 0.08);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  playTickSound() {
    if (!this.sfxEnabled) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  toggleOceanWaves() {
    this.init();
    if (this.ambientWavesRunning) {
      this.stopOceanWaves();
      return false;
    } else {
      this.startOceanWaves();
      return true;
    }
  }

  startOceanWaves() {
    if (this.ambientWavesRunning) return;
    this.init();

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink noise generation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter simulating ocean swell
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);

    // LFO to oscillate swell frequency
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // one wave cycle every ~8 seconds

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(200, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(this.ctx.destination);

    whiteNoise.start();
    lfo.start();

    this.waveNodes = { whiteNoise, lfo, masterGain };
    this.ambientWavesRunning = true;
  }

  stopOceanWaves() {
    if (!this.ambientWavesRunning || !this.waveNodes) return;
    try {
      this.waveNodes.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1);
      setTimeout(() => {
        if (this.waveNodes) {
          this.waveNodes.whiteNoise.stop();
          this.waveNodes.lfo.stop();
          this.waveNodes = null;
        }
      }, 1000);
    } catch (e) {
      console.log('Stopping wave audio error:', e);
    }
    this.ambientWavesRunning = false;
  }
}

window.beachAudio = new BeachAudioEngine();
