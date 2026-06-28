import React, { useState, useEffect } from "react";
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
        
        // Start fade out after 4.7s to complete by 5s
        const fadeTimer = setTimeout(() => {
          setIsFadingOut(true);
        }, 4700);

        // Completely unmount after 5s
        const unmountTimer = setTimeout(() => {
          setIsVisible(false);
          sessionStorage.setItem("wc26_intro_seen", "true");
        }, 5000);

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
      }, 300);
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
        
        {/* Scene 1 & 2 */}
        <div className="intro-reveal-scene-1">
          <div className="intro-reveal-center-light"></div>
          <h1 className="intro-reveal-title">WORLD CUP 26</h1>
          <div className="intro-reveal-scene-2-content">
            <div className="intro-reveal-divider"></div>
            <h2 className="intro-reveal-subtitle">WELCOME TO THE TOURNAMENT</h2>
          </div>
        </div>

        {/* Scene 3 */}
        <div className="intro-reveal-scene-3">
          <h2 className="intro-reveal-stagger-text">ROUND OF 32</h2>
          <h2 className="intro-reveal-stagger-text delay-1">32 TEAMS</h2>
          <h2 className="intro-reveal-stagger-text delay-2">16 MATCHES</h2>
          <h2 className="intro-reveal-stagger-text delay-3 gold-text">1 CHAMPION</h2>
        </div>

        {/* Scene 4 */}
        <div className="intro-reveal-scene-4">
          <div className="intro-reveal-final-glow"></div>
          <div className="intro-reveal-particles"></div>
          <h1 className="intro-reveal-hero-text">WIN OR GO HOME</h1>
          <h3 className="intro-reveal-sub-hero-text">YOUR JOURNEY STARTS NOW</h3>
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
