import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal Component
 * Animates children on scroll using IntersectionObserver with GPU-friendly styles.
 */
export function ScrollReveal({ 
  children, 
  delay = 0, 
  duration = 700, 
  yOffset = 20, 
  animationType = 'fade-up',
  style = {} 
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let observerRef = null;
    let timeoutId = null;

    const reveal = () => {
      setIsVisible(true);
      if (observerRef) {
        observerRef.disconnect();
        observerRef = null;
      }
    };

    // Defer the check by one event loop tick so it runs after parent
    // PublicLayout's useEffect fires window.scrollTo(0, 0)
    timeoutId = setTimeout(() => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal();
        return;
      }

      // Element is below fold — use IntersectionObserver to reveal on scroll
      observerRef = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          reveal();
        }
      }, {
        threshold: 0.05,
        rootMargin: '0px 0px 0px 0px'
      });

      observerRef.observe(el);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (observerRef) observerRef.disconnect();
    };
  }, []);

  const getTransform = () => {
    if (isVisible) return 'translateY(0) scale(1)';
    if (animationType === 'fade-up') return `translateY(${yOffset}px) scale(1)`;
    if (animationType === 'scale-up') return 'translateY(0) scale(0.97)';
    return 'none';
  };

  const getClipPath = () => {
    if (animationType === 'reveal') {
      return isVisible 
        ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' 
        : 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';
    }
    return 'none';
  };

  const isReduced = false;

  const animationStyles = isReduced 
    ? {
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        ...style
      }
    : {
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        clipPath: getClipPath(),
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, clip-path ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        ...style
      };

  return (
    <div ref={ref} style={animationStyles}>
      {children}
    </div>
  );
}

/**
 * TextReveal Component
 * Masked character/heading reveal for kinetic typography designs.
 */
export function TextReveal({ text, delay = 0, duration = 800, style = {} }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let observerRef = null;
    let timeoutId = null;

    const reveal = () => {
      setIsVisible(true);
      if (observerRef) { observerRef.disconnect(); observerRef = null; }
    };

    timeoutId = setTimeout(() => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal();
        return;
      }
      observerRef = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) reveal();
      }, { threshold: 0.1 });
      observerRef.observe(el);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (observerRef) observerRef.disconnect();
    };
  }, []);

  const isReduced = false;

  if (isReduced) {
    return (
      <span ref={ref} style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.2s ease', ...style }}>
        {text}
      </span>
    );
  }

  return (
    <span 
      ref={ref} 
      style={{ 
        display: 'inline-block', 
        overflow: 'hidden', 
        verticalAlign: 'bottom',
        lineHeight: '1.2',
        ...style
      }}
    >
      <span 
        style={{ 
          display: 'inline-block',
          transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, opacity ${duration}ms ease ${delay}ms`,
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          opacity: isVisible ? 1 : 0
        }}
      >
        {text}
      </span>
    </span>
  );
}

/**
 * EditorialLabel Component
 * Staggers number indicator and label text reveals.
 */
export function EditorialLabel({ number, label, delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  const isReduced = false;

  return (
    <div 
      ref={ref} 
      style={{ 
        display: 'flex', 
        gap: '8px', 
        alignItems: 'center', 
        fontSize: '0.75rem', 
        fontWeight: '700', 
        letterSpacing: '0.08em', 
        color: 'var(--primary)', 
        marginBottom: '16px', 
        overflow: 'hidden' 
      }}
    >
      <span style={{ 
        display: 'inline-block',
        transform: isReduced ? 'none' : (isVisible ? 'translateX(0)' : 'translateX(-20px)'),
        opacity: isVisible ? 1 : 0,
        transition: isReduced ? 'opacity 0.2s' : `transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, opacity 0.6s ease ${delay}ms`
      }}>
        {number} —
      </span>
      <span style={{ 
        display: 'inline-block',
        transform: isReduced ? 'none' : (isVisible ? 'translateY(0)' : 'translateY(100%)'),
        opacity: isVisible ? 1 : 0,
        transition: isReduced ? 'opacity 0.2s' : `transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay + 100}ms, opacity 0.6s ease ${delay + 100}ms`
      }}>
        {label}
      </span>
    </div>
  );
}

/**
 * OversizedText Component
 * Scrolls horizontal editorial lettering across the screen smoothly.
 */
export function OversizedText({ text, speed = 0.08, direction = 'left' }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let active = true;
    const isReduced = false;
    if (isReduced) return;

    const handleScroll = () => {
      if (!ref.current || !active) return;
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const scrollDelta = elementCenter - viewportCenter;
        
        setOffset(scrollDelta * speed);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      active = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  const isReduced = false;

  const transformStyle = isReduced 
    ? {} 
    : {
        transform: `translateX(${direction === 'left' ? -offset : offset}px)`,
        transition: 'transform 0.1s cubic-bezier(0.22, 1, 0.36, 1)'
      };

  return (
    <div 
      ref={ref} 
      style={{ 
        fontSize: 'clamp(56px, 10vw, 130px)', 
        fontWeight: '900', 
        letterSpacing: '0', 
        color: 'var(--bg-main)', 
        lineHeight: '0.8',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        userSelect: 'none',
        pointerEvents: 'none',
        margin: '16px 0',
        ...transformStyle
      }}
    >
      {text.toUpperCase()}
    </div>
  );
}

/**
 * ScrollScaleText Component
 * Responds to scroll positions to scale typography.
 */
export function ScrollScaleText({ children, minScale = 0.94, maxScale = 1.06 }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(minScale);

  useEffect(() => {
    let active = true;
    const isReduced = false;
    if (isReduced) return;

    const handleScroll = () => {
      if (!ref.current || !active) return;
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight && rect.bottom > 0) {
        const totalDist = windowHeight + rect.height;
        const progress = (windowHeight - rect.top) / totalDist;
        const currentScale = minScale + progress * (maxScale - minScale);
        
        setScale(Math.min(maxScale, Math.max(minScale, currentScale)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      active = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, [minScale, maxScale]);

  const isReduced = false;

  const style = isReduced 
    ? {} 
    : {
        transform: `scale(${scale})`,
        transformOrigin: 'left center',
        display: 'inline-block',
        transition: 'transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)'
      };

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}

/**
 * WordHighlight Component
 * Renders understated underlines and translations.
 */
export function WordHighlight({ children }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  const isReduced = false;

  return (
    <span 
      ref={ref} 
      style={{ 
        position: 'relative', 
        display: 'inline-block',
        color: 'var(--secondary)'
      }}
    >
      <span style={{
        display: 'inline-block',
        transform: isReduced ? 'none' : (isVisible ? 'translateX(2px)' : 'translateX(0)'),
        transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
      }}>
        {children}
      </span>
      <span style={{
        position: 'absolute',
        bottom: '-1px',
        left: '0',
        width: '100%',
        height: '2px',
        backgroundColor: 'var(--primary)',
        transform: isReduced ? 'none' : (isVisible ? 'scaleX(1)' : 'scaleX(0)'),
        transformOrigin: 'left',
        transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) 200ms'
      }} />
    </span>
  );
}

/**
 * SplitText Component
 * Moves two components from distinct axes to converge.
 */
export function SplitText({ line1, line2, delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let observerRef = null;
    let timeoutId = null;

    const reveal = () => {
      setIsVisible(true);
      if (observerRef) { observerRef.disconnect(); observerRef = null; }
    };

    timeoutId = setTimeout(() => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal();
        return;
      }
      observerRef = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) reveal();
      }, { threshold: 0.1 });
      observerRef.observe(el);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (observerRef) observerRef.disconnect();
    };
  }, []);

  const isReduced = false;

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ overflow: 'hidden' }}>
        <span style={{ 
          display: 'inline-block',
          transform: isReduced ? 'none' : (isVisible ? 'translateX(0)' : 'translateX(-40px)'),
          opacity: isVisible ? 1 : 0,
          transition: isReduced ? 'opacity 0.2s' : `transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, opacity 0.8s ease ${delay}ms`
        }}>
          {line1}
        </span>
      </div>
      <div style={{ overflow: 'hidden' }}>
        <span style={{ 
          display: 'inline-block',
          transform: isReduced ? 'none' : (isVisible ? 'translateY(0)' : 'translateY(100%)'),
          opacity: isVisible ? 1 : 0,
          transition: isReduced ? 'opacity 0.2s' : `transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay + 120}ms, opacity 0.8s ease ${delay + 120}ms`
        }}>
          {line2}
        </span>
      </div>
    </div>
  );
}

