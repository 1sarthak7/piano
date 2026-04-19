import React, { useEffect, useRef } from 'react';
import { playNote } from '../audio';

const START_OCTAVE = 3;
const NUM_OCTAVES = 3;

const NOTES = [
  { note: 'C', type: 'white' },
  { note: 'C#', type: 'black' },
  { note: 'D', type: 'white' },
  { note: 'D#', type: 'black' },
  { note: 'E', type: 'white' },
  { note: 'F', type: 'white' },
  { note: 'F#', type: 'black' },
  { note: 'G', type: 'white' },
  { note: 'G#', type: 'black' },
  { note: 'A', type: 'white' },
  { note: 'A#', type: 'black' },
  { note: 'B', type: 'white' }
];

const keyMap = {
  'z': 'C3', 'x': 'D3', 'c': 'E3', 'v': 'F3', 'b': 'G3', 'n': 'A3', 'm': 'B3',
  's': 'C#3', 'd': 'D#3', 'g': 'F#3', 'h': 'G#3', 'j': 'A#3',
  'q': 'C4', 'w': 'D4', 'e': 'E4', 'r': 'F4', 't': 'G4', 'y': 'A4', 'u': 'B4',
  '2': 'C#4', '3': 'D#4', '5': 'F#4', '6': 'G#4', '7': 'A#4',
  'i': 'C5', 'o': 'D5', 'p': 'E5', '[': 'F5', ']': 'G5', '\\': 'A5',
  '9': 'C#5', '0': 'D#5', '=': 'F#5'
};

const revKeyMap = Object.entries(keyMap).reduce((acc, [k, v]) => {
  acc[v] = k;
  return acc;
}, {});

export default function PianoKeyboard({ activeKeys, onKeyTrigger, onKeyRelease, setPianoLayout }) {
  const pianoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Collect DOM rects for the falling notes canvas to use calculating X coordinates
    if (pianoRef.current && containerRef.current) {
      const children = Array.from(pianoRef.current.children);
      const coords = {};
      const pianoRect = pianoRef.current.getBoundingClientRect();
      const parentRect = containerRef.current.getBoundingClientRect();
      
      children.forEach(child => {
        const note = child.dataset.note;
        const rect = child.getBoundingClientRect();
        coords[note] = {
          x: rect.left - pianoRect.left,
          width: rect.width,
          type: child.classList.contains('white') ? 'white' : 'black'
        };
      });
      
      setPianoLayout({
        coords,
        pianoWidth: pianoRect.width,
        offsetLeft: pianoRect.left - parentRect.left
      });
    }
  }, [setPianoLayout]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (keyMap[key]) {
        onKeyTrigger(keyMap[key], false);
      }
    };
    
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keyMap[key]) {
        onKeyRelease(keyMap[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onKeyTrigger, onKeyRelease]);

  const renderKeys = () => {
    const keys = [];
    let whiteKeyCount = 0;
    
    for (let i = 0; i < NUM_OCTAVES; i++) {
      const octave = START_OCTAVE + i;
      
      NOTES.forEach(({note, type}) => {
        const noteName = `${note}${octave}`;
        const kbKey = revKeyMap[noteName] ? revKeyMap[noteName].toUpperCase() : '';
        const isActive = activeKeys.has(noteName);
        
        let style = {};
        if (type === 'white') {
          whiteKeyCount++;
        } else {
          // absolute positioning based on previous white keys
          const leftPos = (whiteKeyCount * 40) - 12; 
          style.left = `${leftPos}px`;
        }

        keys.push(
          <div 
            key={noteName}
            data-note={noteName}
            className={`key ${type} ${isActive ? 'active' : ''}`}
            style={style}
            onMouseDown={() => onKeyTrigger(noteName, false)}
            onMouseUp={() => onKeyRelease(noteName)}
            onMouseLeave={() => onKeyRelease(noteName)}
          >
            <span className="key-label">{kbKey}</span>
          </div>
        );
      });
    }
    return { keys, width: whiteKeyCount * 40 };
  };

  const { keys, width } = renderKeys();

  return (
    <div className="piano-container" ref={containerRef}>
      <div className="piano" ref={pianoRef} style={{ width: `${width}px` }}>
        {keys}
      </div>
    </div>
  );
}
