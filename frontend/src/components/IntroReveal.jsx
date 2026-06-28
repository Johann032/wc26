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
        
        // Start fade out after 2.5s to complete by 3s
        const fadeTimer = setTimeout(() => {
          setIsFadingOut(true);
        }, 2500);

        // Completely unmount after 3s
        const unmountTimer = setTimeout(() => {
          setIsVisible(false);
          sessionStorage.setItem("wc26_intro_seen", "true");
        }, 3000);

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
        
        <div className="intro-reveal-phase-1">
          <h1 className="intro-reveal-title">WORLD CUP 26</h1>
        </div>

        <div className="intro-reveal-phase-2">
          <div className="intro-reveal-sweep-line"></div>
          <h2 className="intro-reveal-subtitle">ROUND OF 32 HAS BEGUN</h2>
        </div>

        <div className="intro-reveal-phase-3">
          <h2 className="intro-reveal-emphasis">WIN OR GO HOME</h2>
        </div>

        <div className="intro-reveal-stadium-glow"></div>
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
