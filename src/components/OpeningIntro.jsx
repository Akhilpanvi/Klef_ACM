import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

export default function OpeningIntro() {
  const [isVisible, setIsVisible] = useState(true);
  const isDismissed = useRef(false);
  const initialPos = useRef(null);
  const mountTime = useRef(Date.now());
  const navigate = useNavigate();
  const location = useLocation();

  const dismissIntro = () => {
    if (isDismissed.current) return;
    isDismissed.current = true;
    setIsVisible(false);
    document.body.style.overflow = '';
    
    // Smoothly transition URL to /Home if on root
    const curPath = location.pathname.toLowerCase().replace(/\/+$/, '');
    if (curPath === '' || curPath === '/klef-acm-sc' || curPath === '/') {
      navigate('/Home', { replace: true });
    }
  };

  useEffect(() => {
    if (!isVisible) return;

    // Prevent background scrolling while intro is visible
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Direct actions (keys, wheel, touch, click, pointerdown) trigger immediately
    const handleDirectAction = () => {
      dismissIntro();
    };

    // Movement action (mouse / pointer move)
    const handleMovement = (e) => {
      if (Date.now() - mountTime.current < 120) return;

      const currentX = e.clientX ?? e.screenX ?? 0;
      const currentY = e.clientY ?? e.screenY ?? 0;

      if (!initialPos.current) {
        initialPos.current = { x: currentX, y: currentY };
        return;
      }

      const dx = Math.abs(currentX - initialPos.current.x);
      const dy = Math.abs(currentY - initialPos.current.y);

      // Dismiss if user moves pointer intentionally
      if (dx > 4 || dy > 4) {
        dismissIntro();
      }
    };

    window.addEventListener('mousemove', handleMovement, { passive: true });
    window.addEventListener('pointermove', handleMovement, { passive: true });
    window.addEventListener('wheel', handleDirectAction, { passive: true });
    window.addEventListener('scroll', handleDirectAction, { passive: true });
    window.addEventListener('keydown', handleDirectAction, { passive: true });
    window.addEventListener('touchstart', handleDirectAction, { passive: true });
    window.addEventListener('touchmove', handleDirectAction, { passive: true });
    window.addEventListener('pointerdown', handleDirectAction, { passive: true });
    window.addEventListener('click', handleDirectAction, { passive: true });

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('mousemove', handleMovement);
      window.removeEventListener('pointermove', handleMovement);
      window.removeEventListener('wheel', handleDirectAction);
      window.removeEventListener('scroll', handleDirectAction);
      window.removeEventListener('keydown', handleDirectAction);
      window.removeEventListener('touchstart', handleDirectAction);
      window.removeEventListener('touchmove', handleDirectAction);
      window.removeEventListener('pointerdown', handleDirectAction);
      window.removeEventListener('click', handleDirectAction);
    };
  }, [isVisible, location.pathname]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="grand-opening-curtain"
          initial={{ opacity: 1, scale: 1 }}
          exit={{ 
            y: '-100%',
            opacity: 0.95,
            transition: { duration: 1.4, ease: [0.83, 0, 0.17, 1] } 
          }}
          onClick={dismissIntro}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor: '#030712',
            backgroundImage: `
              radial-gradient(circle at 50% 35%, rgba(0, 133, 202, 0.22) 0%, transparent 60%),
              radial-gradient(circle at 20% 75%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 25%, rgba(6, 182, 212, 0.16) 0%, transparent 50%),
              radial-gradient(circle at 50% 100%, rgba(15, 23, 42, 0.95) 0%, #030712 100%)
            `,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            userSelect: 'none'
          }}
        >
          {/* Subtle Cybernetic Grid Pattern */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
              maskImage: 'radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 30%, transparent 80%)'
            }}
          />

          {/* Ambient Rotating Gyro Ring / Energy Halo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 75, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              width: 'min(90vw, 750px)',
              height: 'min(90vw, 750px)',
              borderRadius: '50%',
              border: '1px dashed rgba(56, 189, 248, 0.12)',
              pointerEvents: 'none'
            }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 110, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              width: 'min(75vw, 620px)',
              height: 'min(75vw, 620px)',
              borderRadius: '50%',
              border: '1px solid rgba(129, 140, 248, 0.08)',
              pointerEvents: 'none'
            }}
          />

          {/* Glowing Stardust & Constellation Nodes */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {[
              { top: '14%', left: '18%', size: 3, dur: 4.5, color: '#38BDF8' },
              { top: '24%', left: '82%', size: 4, dur: 5.8, color: '#818CF8' },
              { top: '42%', left: '12%', size: 3, dur: 4.2, color: '#A5F3FC' },
              { top: '72%', left: '88%', size: 4, dur: 6.0, color: '#60A5FA' },
              { top: '30%', left: '92%', size: 3, dur: 5.2, color: '#38BDF8' },
              { top: '80%', left: '22%', size: 4, dur: 4.8, color: '#C084FC' },
              { top: '16%', left: '52%', size: 2.5, dur: 3.8, color: '#FFFFFF' },
              { top: '65%', left: '62%', size: 3.5, dur: 5.5, color: '#38BDF8' },
              { top: '86%', left: '74%', size: 3, dur: 6.2, color: '#93C5FD' },
              { top: '38%', left: '32%', size: 2.5, dur: 4.1, color: '#FFFFFF' }
            ].map((p, idx) => (
              <motion.div
                key={idx}
                animate={{
                  y: [-12, 12, -12],
                  opacity: [0.25, 0.9, 0.25],
                  scale: [0.85, 1.3, 0.85]
                }}
                transition={{
                  duration: p.dur,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  position: 'absolute',
                  top: p.top,
                  left: p.left,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  borderRadius: '50%',
                  backgroundColor: p.color,
                  boxShadow: `0 0 12px ${p.color}`
                }}
              />
            ))}
          </div>

          {/* Central Grand Composition */}
          <div 
            style={{ 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center', 
              padding: '0 24px', 
              zIndex: 10,
              maxWidth: '1200px'
            }}
          >
            {/* Top Luminous Laser Aperture Bar */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '180px', opacity: 1 }}
                transition={{ duration: 1.3, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #38BDF8, #818CF8, transparent)',
                  boxShadow: '0 0 18px rgba(56, 189, 248, 0.8)'
                }}
              />
              <motion.span
                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{
                  position: 'absolute',
                  color: '#38BDF8',
                  fontSize: '11px',
                  textShadow: '0 0 10px #38BDF8',
                  lineHeight: '1'
                }}
              >
                ✦
              </motion.span>
            </div>

            {/* Kinetic Grand Title */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {/* Backlight Glow Aura */}
              <div 
                style={{
                  position: 'absolute',
                  inset: '-20px -40px',
                  background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.28) 0%, rgba(99, 102, 241, 0.15) 45%, transparent 75%)',
                  filter: 'blur(35px)',
                  pointerEvents: 'none',
                  zIndex: 0
                }}
              />

              <h1
                style={{
                  fontSize: 'clamp(56px, 13vw, 150px)',
                  fontWeight: '900',
                  letterSpacing: '-0.02em',
                  lineHeight: '1',
                  margin: 0,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 'clamp(14px, 2.5vw, 32px)',
                  fontFamily: '"Outfit", "Inter", -apple-system, sans-serif'
                }}
              >
                {/* KLEF - Metallic Platinum Chrome */}
                <span 
                  style={{ 
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 40%, #CBD5E1 75%, #94A3B8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
                    filter: 'drop-shadow(0 2px 8px rgba(255, 255, 255, 0.25))'
                  }}
                >
                  KLEF
                </span>

                {/* ACM - Radiant Cosmic Cyan & Indigo */}
                <span 
                  style={{ 
                    background: 'linear-gradient(135deg, #38BDF8 0%, #0099FF 40%, #6366F1 80%, #A855F7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 35px rgba(56, 189, 248, 0.65)) drop-shadow(0 0 70px rgba(99, 102, 241, 0.35))'
                  }}
                >
                  ACM
                </span>
              </h1>
            </motion.div>

            {/* Precision Laser Divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 'min(90vw, 540px)',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.3), rgba(255, 255, 255, 0.8), rgba(99, 102, 241, 0.3), transparent)',
                margin: '28px 0 20px 0',
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.5)'
              }}
            />

            {/* Subtitle 1: Association for Computing Machinery */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7 }}
              style={{
                fontSize: 'clamp(0.85rem, 1.8vw, 1.25rem)',
                fontWeight: '800',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                margin: '0 0 8px 0',
                maxWidth: '800px',
                background: 'linear-gradient(90deg, #94A3B8 0%, #FFFFFF 50%, #94A3B8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
              }}
            >
              Association for Computing Machinery
            </motion.p>

            {/* Subtitle 2: Koneru Lakshmaiah Educational Foundation */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.85 }}
              style={{
                color: 'rgba(203, 213, 225, 0.85)',
                fontSize: 'clamp(0.8rem, 1.5vw, 1.05rem)',
                fontWeight: '500',
                letterSpacing: '0.06em',
                margin: '0 0 28px 0',
                maxWidth: '700px'
              }}
            >
              KLEF ACM Student Chapter · Koneru Lakshmaiah Education Foundation
            </motion.p>

            {/* Motto Capsule Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 1.0 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 24px',
                borderRadius: '9999px',
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(56, 189, 248, 0.08)',
                maxWidth: '92vw'
              }}
            >
              <span
                style={{
                  fontSize: 'clamp(0.68rem, 1.25vw, 0.85rem)',
                  fontWeight: '700',
                  letterSpacing: '0.16em',
                  color: '#38BDF8',
                  textTransform: 'uppercase',
                  lineHeight: '1.5',
                  textShadow: '0 0 14px rgba(56, 189, 248, 0.5)'
                }}
              >
                CONNECT ✦ DISCOVER ✦ CODE ✦ BUILD ✦ INNOVATE ✦ EMPOWER ✦ LEAD
              </span>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
