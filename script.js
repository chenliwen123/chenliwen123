const yearNode = document.getElementById("year");
const revealNodes = document.querySelectorAll(".reveal");
const audioToggle = document.querySelector("[data-audio-toggle]");
const audioStatus = document.querySelector("[data-audio-status]");
const musicCard = document.querySelector(".music-card");

if (yearNode) {
  yearNode.textContent = new Date().getFullYear().toString();
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealNodes.forEach((node) => observer.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
}

class TerracottaLoop {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.noiseBuffer = null;
    this.isPlaying = false;
    this.step = 0;
    this.nextNoteTime = 0;
    this.schedulerId = null;
    this.lookAhead = 25;
    this.scheduleAheadTime = 0.18;
    this.tempo = 88;
    this.stepsPerBar = 16;
    this.chords = [
      ["A3", "C4", "E4", "G4"],
      ["F3", "A3", "C4", "E4"],
      ["C3", "E3", "G3", "B3"],
      ["G3", "B3", "D4", "F4"],
    ];
    this.bass = ["A2", "F2", "C2", "G2"];
    this.melody = [
      "E5", null, "G5", null, "A5", null, "G5", null,
      "E5", null, "D5", null, "C5", null, "D5", null,
      "C5", null, "E5", null, "G5", null, "A5", null,
      "G5", null, "E5", null, "D5", null, "C5", null,
    ];
  }

  async init() {
    if (this.audioContext) {
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error("当前浏览器不支持 Web Audio API");
    }

    this.audioContext = new AudioContextClass();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.0001;
    this.masterGain.connect(this.audioContext.destination);
    this.noiseBuffer = this.createNoiseBuffer();
  }

  createNoiseBuffer() {
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate, this.audioContext.sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < channelData.length; i += 1) {
      channelData[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  noteToFrequency(note) {
    const match = note.match(/^([A-G])(#?)(\d)$/);

    if (!match) {
      return 440;
    }

    const [, base, sharp, octaveText] = match;
    const semitoneMap = {
      C: -9,
      D: -7,
      E: -5,
      F: -4,
      G: -2,
      A: 0,
      B: 2,
    };
    const octave = Number(octaveText);
    const semitoneOffset = semitoneMap[base] + (sharp ? 1 : 0) + (octave - 4) * 12;

    return 440 * (2 ** (semitoneOffset / 12));
  }

  get secondsPerStep() {
    return 60 / this.tempo / 4;
  }

  get chordIndex() {
    return Math.floor(this.step / this.stepsPerBar) % this.chords.length;
  }

  triggerTone(frequency, time, duration, options = {}) {
    const {
      type = "triangle",
      volume = 0.12,
      attack = 0.01,
      release = 0.18,
      lowpass = 1800,
      q = 0.7,
      detune = 0,
    } = options;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.detune.setValueAtTime(detune, time);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(lowpass, time);
    filter.Q.setValueAtTime(q, time);

    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + attack);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(volume * 0.55, 0.0001), time + duration * 0.55);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration + release);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(time);
    oscillator.stop(time + duration + release + 0.05);
  }

  triggerPad(notes, time, duration) {
    notes.forEach((note, index) => {
      const frequency = this.noteToFrequency(note);
      this.triggerTone(frequency, time, duration, {
        type: index % 2 === 0 ? "triangle" : "sine",
        volume: 0.055,
        attack: 0.18,
        release: 0.48,
        lowpass: 1400,
        q: 0.4,
        detune: index % 2 === 0 ? -5 : 5,
      });
    });
  }

  triggerBass(note, time) {
    this.triggerTone(this.noteToFrequency(note), time, this.secondsPerStep * 1.35, {
      type: "sine",
      volume: 0.12,
      attack: 0.01,
      release: 0.12,
      lowpass: 420,
      q: 0.3,
    });
  }

  triggerPluck(note, time) {
    this.triggerTone(this.noteToFrequency(note), time, this.secondsPerStep * 0.9, {
      type: "triangle",
      volume: 0.08,
      attack: 0.008,
      release: 0.14,
      lowpass: 2100,
      q: 1.3,
    });
  }

  triggerKick(time) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(112, time);
    oscillator.frequency.exponentialRampToValueAtTime(42, time + 0.14);

    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.linearRampToValueAtTime(0.22, time + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(time);
    oscillator.stop(time + 0.22);
  }

  triggerHat(time) {
    const noise = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();

    noise.buffer = this.noiseBuffer;
    filter.type = "highpass";
    filter.frequency.setValueAtTime(5600, time);

    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.linearRampToValueAtTime(0.035, time + 0.004);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.09);
  }

  scheduleStep(time) {
    const stepInBar = this.step % this.stepsPerBar;
    const melodyIndex = this.step % this.melody.length;
    const chordIndex = this.chordIndex;
    const chordDuration = this.secondsPerStep * this.stepsPerBar * 0.96;

    if (stepInBar === 0) {
      this.triggerPad(this.chords[chordIndex], time, chordDuration);
    }

    if (stepInBar % 4 === 0) {
      this.triggerBass(this.bass[chordIndex], time);
      this.triggerKick(time);
    }

    if (stepInBar === 6 || stepInBar === 14) {
      this.triggerKick(time);
    }

    if (stepInBar % 2 === 1) {
      this.triggerHat(time);
    }

    const melodyNote = this.melody[melodyIndex];

    if (melodyNote) {
      this.triggerPluck(melodyNote, time + 0.01);
    }
  }

  schedule() {
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.nextNoteTime);
      this.nextNoteTime += this.secondsPerStep;
      this.step += 1;
    }
  }

  async start() {
    await this.init();

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    if (this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    this.step = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.05;
    this.masterGain.gain.cancelScheduledValues(this.audioContext.currentTime);
    this.masterGain.gain.setTargetAtTime(0.22, this.audioContext.currentTime, 0.15);
    this.schedule();
    this.schedulerId = window.setInterval(() => this.schedule(), this.lookAhead);
  }

  stop() {
    if (!this.audioContext || !this.isPlaying) {
      return;
    }

    this.isPlaying = false;

    if (this.schedulerId) {
      window.clearInterval(this.schedulerId);
      this.schedulerId = null;
    }

    this.masterGain.gain.cancelScheduledValues(this.audioContext.currentTime);
    this.masterGain.gain.setTargetAtTime(0.0001, this.audioContext.currentTime, 0.08);
  }
}

const terracottaLoop = new TerracottaLoop();

function updateMusicUi(isPlaying, message) {
  if (musicCard) {
    musicCard.dataset.audioState = isPlaying ? "playing" : "idle";
  }

  if (audioToggle) {
    audioToggle.textContent = isPlaying ? "暂停音乐" : "播放音乐";
    audioToggle.setAttribute("aria-pressed", String(isPlaying));
  }

  if (audioStatus) {
    audioStatus.textContent = message;
  }
}

async function handleAudioToggle() {
  if (terracottaLoop.isPlaying) {
    terracottaLoop.stop();
    updateMusicUi(false, "音乐已暂停，随时可以继续播放");
    return;
  }

  try {
    await terracottaLoop.start();
    updateMusicUi(true, "暖色氛围音乐播放中");
  } catch (error) {
    updateMusicUi(false, "当前浏览器暂时无法启动音频");
    console.error(error);
  }
}

audioToggle?.addEventListener("click", handleAudioToggle);
