import React, { useState, useEffect } from 'react';
import './App.css';
import { loadSamples, playNote } from './audio';
import { songs } from './songs';
import Controls from './components/Controls';
import PianoKeyboard from './components/PianoKeyboard';
import FallingNotesCanvas from './components/FallingNotesCanvas';
import { useGameEngine } from './hooks/useGameEngine';

function App() {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingError, setLoadingError] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Piano layout ref (passed from keyboard, read by canvas)
  const [pianoLayout, setPianoLayout] = useState(null);

  const engine = useGameEngine(songs[0]);

  useEffect(() => {
    loadSamples((progress) => {
      setLoadingProgress(progress);
    }).then(() => {
      setLoading(false);
    }).catch(() => {
      setLoadingError(true);
      setTimeout(() => setLoading(false), 2000);
    });
  }, []);

  const triggerKey = (noteName, isAuto) => {
    engine.addActiveKey(noteName);
    playNote(noteName);
    if (!isAuto && !engine.isAutoplay && engine.isPlaying) {
      engine.markNoteHit(noteName);
    }
  };

  const releaseKey = (noteName) => {
    engine.removeActiveKey(noteName);
  };

  const startApp = () => setHasStarted(true);

  return (
    <div className="app-container">
      <Controls 
        isPlaying={engine.isPlaying}
        setIsPlaying={engine.setIsPlaying}
        stopGame={engine.stopGame}
        speed={engine.speed}
        setSpeed={engine.setSpeed}
        isAutoplay={engine.isAutoplay}
        setIsAutoplay={engine.setIsAutoplay}
        score={engine.score}
      />

      <main className="main-content">
        <FallingNotesCanvas 
          isPlaying={engine.isPlaying}
          speed={engine.speed}
          isAutoplay={engine.isAutoplay}
          currentSong={engine.currentSong}
          pianoLayout={pianoLayout}
          songTimeRef={engine.songTimeRef}
          activeKeys={engine.activeKeys}
          onNoteHit={(note) => {}} // Autoplay hits
          triggerAutoplayKey={(note) => {
            playNote(note, 500);
            engine.addActiveKey(note);
            // Simulate release
            setTimeout(() => engine.removeActiveKey(note), 300);
          }}
          onMiss={() => { /* maybe update combo multiplier */ }}
        />

        <PianoKeyboard 
          activeKeys={engine.activeKeys}
          onKeyTrigger={(note) => triggerKey(note, false)}
          onKeyRelease={releaseKey}
          setPianoLayout={setPianoLayout}
        />
      </main>

      {/* Loading Overlay */}
      {(!hasStarted || loading) && (
        <div className="overlay">
          <div className="loader">
            {loading ? (
              <>
                <div className="spinner"></div>
                <p className="loading-text">
                  {loadingError ? 'Failed to load samples. Using basic synth.' : `Loading Samples (${Math.floor(loadingProgress * 100)}%)`}
                </p>
              </>
            ) : (
              <button className="btn primary" onClick={startApp}>Start Playing</button>
            )}
          </div>
        </div>
      )}

      {/* Watermark */}
      <a href="https://github.com/sarthakbhopale" target="_blank" rel="noopener noreferrer" className="watermark">
        Sarthak Bhopale
      </a>
    </div>
  );
}

export default App;
