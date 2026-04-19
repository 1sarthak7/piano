const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const samples = {};
const SAMPLE_URLS = {
  'A2': 'https://tonejs.github.io/audio/salamander/A2.mp3',
  'C3': 'https://tonejs.github.io/audio/salamander/C3.mp3',
  'A3': 'https://tonejs.github.io/audio/salamander/A3.mp3',
  'C4': 'https://tonejs.github.io/audio/salamander/C4.mp3',
  'A4': 'https://tonejs.github.io/audio/salamander/A4.mp3',
  'C5': 'https://tonejs.github.io/audio/salamander/C5.mp3',
  'A5': 'https://tonejs.github.io/audio/salamander/A5.mp3',
  'C6': 'https://tonejs.github.io/audio/salamander/C6.mp3'
};

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getNoteNumber(noteName) {
  const octave = parseInt(noteName.slice(-1));
  const note = noteName.slice(0, -1);
  return octave * 12 + NOTES.indexOf(note) + 12; // C0 = 12
}

export async function loadSamples(onProgress) {
  const keys = Object.keys(SAMPLE_URLS);
  let loaded = 0;
  
  for (const key of keys) {
    try {
      const response = await fetch(SAMPLE_URLS[key]);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      samples[key] = audioBuffer;
      loaded++;
      if (onProgress) onProgress(loaded / keys.length);
    } catch (e) {
      console.warn('Failed to load sample', key, e);
    }
  }
}

function getClosestSample(noteName) {
  const targetNoteNum = getNoteNumber(noteName);
  let closestKey = 'C4';
  let minDiff = Infinity;
  
  for (const key in samples) {
    const num = getNoteNumber(key);
    const diff = Math.abs(num - targetNoteNum);
    if (diff < minDiff) {
      minDiff = diff;
      closestKey = key;
    }
  }
  
  return {
    buffer: samples[closestKey],
    semitones: targetNoteNum - getNoteNumber(closestKey)
  };
}

export function playNote(noteName, duration = 1000) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const match = getClosestSample(noteName);
  
  if (!match.buffer) {
    playOscillatorFallback(noteName, duration);
    return;
  }

  const source = audioCtx.createBufferSource();
  source.buffer = match.buffer;
  source.playbackRate.value = Math.pow(2, match.semitones / 12);
  
  const gainNode = audioCtx.createGain();
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (duration / 1000) + 1); // 1s tail
  
  source.start(0);
}

function playOscillatorFallback(noteName, duration) {
  const noteNum = getNoteNumber(noteName);
  const freq = 440 * Math.pow(2, (noteNum - 69) / 12); // A4 = 69
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.value = freq;
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (duration / 1000));
  
  osc.start();
  osc.stop(audioCtx.currentTime + (duration / 1000));
}
