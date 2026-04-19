import React from 'react';

export default function Controls({
  isPlaying, setIsPlaying, stopGame,
  speed, setSpeed,
  isAutoplay, setIsAutoplay,
  score
}) {
  return (
    <header className="top-bar">
      <div className="logo">
        <span className="neon-text">NEON</span> PIANO
      </div>
      
      <div className="controls">
        {!isPlaying ? (
          <button className="btn primary" onClick={() => setIsPlaying(true)}>Play</button>
        ) : (
          <button className="btn" onClick={() => setIsPlaying(false)}>Pause</button>
        )}
        <button className="btn" onClick={stopGame}>Restart</button>
        
        <div className="control-group">
          <label htmlFor="speed-slider">Speed</label>
          <input 
            type="range" 
            id="speed-slider" 
            min="0.5" 
            max="2" 
            step="0.1" 
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
        </div>
        
        <div className="control-group mode-toggle">
          <label>
            <input 
              type="checkbox" 
              checked={isAutoplay}
              onChange={(e) => setIsAutoplay(e.target.checked)}
            />
            Autoplay
          </label>
        </div>
      </div>
      
      <div className="stats">
        <div className="stat-box">Score: <span className="score-display">{score}</span></div>
      </div>
    </header>
  );
}
