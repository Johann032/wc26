import React, { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import "./IntroReveal.css";

class IntroErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("IntroReveal failed", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function IntroRevealBase() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      const hasSeenIntro = sessionStorage.getItem("wc26_intro_seen");
      if (!hasSeenIntro) {
        setIsVisible(true);
        
        // Start fade out after 9.5s to complete by 10s
        const fadeTimer = setTimeout(() => {
          setIsFadingOut(true);
        }, 9500);

        // Completely unmount after 10s
        const unmountTimer = setTimeout(() => {
          setIsVisible(false);
          sessionStorage.setItem("wc26_intro_seen", "true");
        }, 10000);

        return () => {
          clearTimeout(fadeTimer);
          clearTimeout(unmountTimer);
        };
      }
    } catch (e) {
      console.error("IntroReveal failed", e);
      setHasError(true);
    }
  }, []);

  const handleSkip = () => {
    try {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem("wc26_intro_seen", "true");
      }, 500);
    } catch (e) {
      setHasError(true);
    }
  };

  if (hasError || !isVisible) return null;

  return (
    <div 
      className={`intro-reveal-overlay ${isFadingOut ? "intro-reveal-fade-out" : ""}`}
      onClick={handleSkip}
    >
      <div className="intro-reveal-content">
        
        {/* Scene 1: The Darkness (Distant Light & Particles) */}
        <div className="intro-reveal-scene-1-light"></div>
        <div className="intro-reveal-particles"></div>

        {/* Scene 2: Energy Awakens (SVG Swooshes) */}
        <div className="intro-reveal-scene-2-swooshes">
          <svg viewBox="0 0 800 400" className="intro-swoosh intro-swoosh-1">
            <path d="M -100,300 C 200,400 600,0 900,100" fill="none" stroke="url(#goldGradient)" strokeWidth="4" filter="url(#glow)"/>
          </svg>
          <svg viewBox="0 0 800 400" className="intro-swoosh intro-swoosh-2">
            <path d="M 900,350 C 600,250 200,450 -100,200" fill="none" stroke="url(#goldGradient)" strokeWidth="2" filter="url(#glow)"/>
          </svg>
          
          <svg width="0" height="0">
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
          </svg>
        </div>

        {/* Scene 3, 4, 5: Trophy Emergence, Ascent, Hero Moment */}
        <div className="intro-reveal-trophy-container">
          <div className="intro-reveal-trophy-spotlight"></div>
          <div className="intro-reveal-trophy-rings">
            <div className="intro-ring intro-ring-1"></div>
            <div className="intro-ring intro-ring-2"></div>
          </div>
          <div className="intro-reveal-trophy-wrapper">
            <Trophy className="intro-reveal-trophy-icon" strokeWidth={1.5} />
            {/* SVG Mask for bottom-up reveal */}
            <div className="intro-reveal-trophy-mask"></div>
            {/* Specular highlights moving across the trophy */}
            <div className="intro-reveal-trophy-shine"></div>
          </div>
        </div>

        {/* Scene 6: Title Reveal */}
        <div className="intro-reveal-title-container">
          <div className="intro-reveal-title-swoosh"></div>
          <h1 className="intro-reveal-title">WORLD CUP 26</h1>
        </div>

        {/* Scene 7: Final Statement */}
        <div className="intro-reveal-statement-container">
          <h3 className="intro-reveal-statement">ONE TROPHY. ONE CHAMPION.</h3>
        </div>

      </div>
    </div>
  );
}

export default function IntroReveal() {
  return (
    <IntroErrorBoundary>
      <IntroRevealBase />
    </IntroErrorBoundary>
  );
}
