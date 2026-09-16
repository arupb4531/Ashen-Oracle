'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './CinematicIntro.module.css';

export function CinematicIntro() {
  const [isVisible, setIsVisible] = useState(() => !sessionStorage.getItem('ashenOracleIntroPlayed'));
  const [isFading, setIsFading] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(() => !sessionStorage.getItem('ashenOracleIntroPlayed'));
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!isVisible) return; // Skip if already determined to be hidden

    // Check for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      if (typeof window !== 'undefined') sessionStorage.setItem('ashenOracleIntroPlayed', 'true');
      setShouldPlay(false);
      setIsVisible(false);
      return;
    }

    // Lock scrolling while the intro is visible
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  useEffect(() => {
    if (shouldPlay && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay with sound was blocked by the browser. Require user click.
          setNeedsInteraction(true);
        });
      }
    }
  }, [shouldPlay]);

  const handleManualStart = () => {
    setNeedsInteraction(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleVideoEnd = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ashenOracleIntroPlayed', 'true');
    }
    
    // 1. Hold the final frame briefly
    setTimeout(() => {
      // 2. Start the cinematic fade out
      setIsFading(true);
      
      // 3. Completely unmount/remove from DOM after fade completes
      setTimeout(() => {
        setIsVisible(false);
      }, 1000); // matches the CSS transition duration
    }, 300);
  };

  const handleVideoError = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ashenOracleIntroPlayed', 'true');
    }
    // Fallback: If video fails, just skip the intro entirely
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={`${styles.overlay} ${isFading ? styles.fadeOut : ''}`}>
      {shouldPlay && (
        <>
          <video
            ref={videoRef}
            src="/intro.mp4"
            playsInline
            className={`${styles.video} ${needsInteraction ? styles.blurred : ''}`}
            onEnded={handleVideoEnd}
            onError={handleVideoError}
          />
          {needsInteraction && (
            <button className={styles.enterBtn} onClick={handleManualStart}>
              Awaken
            </button>
          )}
        </>
      )}
    </div>
  );
}
