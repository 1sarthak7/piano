import { useState, useRef, useCallback } from 'react';

const TIME_TO_FALL = 2000;

export function useGameEngine(initialSong) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [score, setScore] = useState(0);
  
  const [currentSong, setCurrentSong] = useState(() => 
    initialSong.notes.map(n => ({ ...n, played: false, hit: false, missed: false }))
  );
  
  const songTimeRef = useRef(-TIME_TO_FALL); // Time state in ms mapped purely for the canvas loop
  const activeKeysRef = useRef(new Set());
  const [activeKeys, setActiveKeysState] = useState(new Set()); // For react re-renders on the keyboard

  const loadSong = useCallback((songData) => {
    setCurrentSong(songData.notes.map(n => ({ ...n, played: false, hit: false, missed: false })));
    songTimeRef.current = -TIME_TO_FALL;
    setScore(0);
    setIsPlaying(false);
    activeKeysRef.current.clear();
    setActiveKeysState(new Set());
  }, []);

  const stopGame = useCallback(() => {
    setIsPlaying(false);
    songTimeRef.current = -TIME_TO_FALL;
    setCurrentSong(prev => prev.map(n => ({ ...n, played: false, hit: false, missed: false })));
    setScore(0);
    activeKeysRef.current.clear();
    setActiveKeysState(new Set());
  }, []);

  const addActiveKey = useCallback((note) => {
    activeKeysRef.current.add(note);
    setActiveKeysState(new Set(activeKeysRef.current));
  }, []);

  const removeActiveKey = useCallback((note) => {
    activeKeysRef.current.delete(note);
    setActiveKeysState(new Set(activeKeysRef.current));
  }, []);

  const markNoteHit = useCallback((noteName) => {
    setCurrentSong(prev => {
      const copy = [...prev];
      // Find the first unhit note that matches
      const note = copy.find(n => n.note === noteName && !n.hit && !n.missed && Math.abs(n.time - songTimeRef.current) <= 200);
      if (note) {
        note.hit = true;
        setScore(s => s + 100);
      }
      return copy;
    });
  }, []);

  return {
    isPlaying, setIsPlaying,
    speed, setSpeed,
    isAutoplay, setIsAutoplay,
    score, setScore,
    currentSong, setCurrentSong,
    songTimeRef,
    activeKeys, addActiveKey, removeActiveKey,
    loadSong, stopGame, markNoteHit
  };
}
