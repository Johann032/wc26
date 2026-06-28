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
        
        <div className="intro-reveal-ethereal-particles"></div>

        {/* Welcome Phrase */}
        <h2 className="intro-reveal-ethereal-welcome">WELCOME</h2>

        {/* Ethereal Trophy Sequence */}
        <div className="intro-reveal-ethereal-trophy-container">
          <div className="intro-reveal-ethereal-glow"></div>
          <img src="/images/trophy.png" alt="World Cup Trophy" className="intro-reveal-ethereal-trophy-img" />
          
          {/* Ethereal light sweep passing over the trophy */}
          <div className="intro-reveal-ethereal-light-sweep"></div>
        </div>

        {/* Title Reveal */}
        <div className="intro-reveal-ethereal-title-container">
          <h1 className="intro-reveal-ethereal-title">WORLD CUP 26</h1>
          <h3 className="intro-reveal-ethereal-subtitle">ONE TROPHY. ONE CHAMPION.</h3>
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
