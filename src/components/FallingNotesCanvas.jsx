import React, { useEffect, useRef } from 'react';

const TIME_TO_FALL = 2000;
const HIT_WINDOW = 200;

export default function FallingNotesCanvas({ 
  isPlaying, speed, isAutoplay, currentSong, pianoLayout, 
  songTimeRef, onNoteHit, triggerAutoplayKey, onMiss, activeKeys
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const lastTimeRef = useRef(0);
  const requestRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
    }
  }, [isPlaying]);

  useEffect(() => {
    const render = (time) => {
      const canvas = canvasRef.current;
      if (!canvas || !pianoLayout) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      if (isPlaying) {
        const dt = time - lastTimeRef.current;
        songTimeRef.current += dt * speed;
      }
      lastTimeRef.current = time;

      ctx.clearRect(0, 0, width, height);

      const { coords, offsetLeft, pianoWidth } = pianoLayout;
      const centerOffset = (width - pianoWidth) / 2 + offsetLeft;
      const velocity = height / TIME_TO_FALL;
      const st = songTimeRef.current;

      currentSong.forEach(n => {
        if (n.time > st + TIME_TO_FALL) return;
        if (n.time + n.duration < st && (n.played || n.missed)) return;

        const timeUntilHit = n.time - st;
        const yBottom = height - (timeUntilHit * velocity);
        const pixelHeight = (n.duration / TIME_TO_FALL) * height;
        const yTop = yBottom - pixelHeight;

        // Autoplay logic
        if (isAutoplay && !n.played && st >= n.time) {
          n.played = true;
          triggerAutoplayKey(n.note);
          onNoteHit(n.note); // Score update
        }

        // Miss logic
        if (!isAutoplay && !n.hit && !n.missed && timeUntilHit < -HIT_WINDOW) {
          n.missed = true;
          onMiss();
        }

        const keyData = coords[n.note];
        if (!keyData) return;

        const x = centerOffset + keyData.x;
        const w = keyData.width;

        ctx.shadowBlur = 10;
        
        if (n.hit) {
          ctx.fillStyle = '#00f0ff';
          ctx.shadowColor = '#00f0ff';
        } else if (n.missed) {
          ctx.fillStyle = '#ff2a2a';
          ctx.shadowColor = '#ff2a2a';
        } else {
          // Note hasn't been hit yet, visually checking if the key is active
          if (activeKeys.has(n.note) && Math.abs(timeUntilHit) < HIT_WINDOW) {
            ctx.fillStyle = '#aaffaa';
            ctx.shadowColor = '#aaffaa';
          } else if (keyData.type === 'white') {
            ctx.fillStyle = '#1ce5ff';
            ctx.shadowColor = '#00f0ff';
          } else {
            ctx.fillStyle = '#d400ff';
            ctx.shadowColor = '#bd00ff';
          }
        }

        ctx.beginPath();
        ctx.roundRect(x + 2, yTop, w - 4, Math.max(pixelHeight, 10), 5);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Target Line
      ctx.strokeStyle = '#fff';
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(width, height);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, speed, isAutoplay, currentSong, pianoLayout, songTimeRef, onNoteHit, triggerAutoplayKey, onMiss, activeKeys]);

  return (
    <div className="canvas-container" ref={containerRef}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
