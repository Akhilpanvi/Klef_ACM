import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Sparkles, Cpu, ArrowRight, ShieldCheck } from 'lucide-react';

export default function InteractiveEntrance({ onEnter }) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [disturbance, setDisturbance] = useState(0);
  const [statusText, setStatusText] = useState('Awaiting User Interaction...');
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    // Check if user already entered in this browser tab session or is on a subpage
    const isSubPage = window.location.pathname.includes('/admin') || 
                      window.location.pathname.includes('/events') || 
                      window.location.pathname.includes('/gallery') || 
                      window.location.pathname.includes('/members') || 
                      window.location.pathname.includes('/contact');

    const enteredSession = sessionStorage.getItem('klu_acm_portal_entered') || localStorage.getItem('klu_acm_portal_entered');
    if (enteredSession === 'true' || isSubPage) {
      setHasInteracted(true);
      if (onEnter) onEnter();
      return;
    }

    // Setup interactive particles
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Any key, touch or scroll also unlocks smoothly
    const handleGlobalTrigger = () => triggerEnter();
    window.addEventListener('keydown', handleGlobalTrigger);
    window.addEventListener('scroll', handleGlobalTrigger, { passive: true });

    // Generate computing matrix particles
    const numParticles = Math.min(80, Math.floor(window.innerWidth / 16));
    particlesRef.current = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      radius: Math.random() * 2 + 1,
      baseRadius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Dark futuristic computing background gradient
      const bgGrad = ctx.createRadialGradient(
        mousePos.x || width / 2,
        mousePos.y || height / 2,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, '#0c1b33');
      bgGrad.addColorStop(0.5, '#07101e');
      bgGrad.addColorStop(1, '#030712');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle tech grid lines
      ctx.strokeStyle = 'rgba(0, 133, 202, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw and connect particles
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Interaction disturbance physics
        const dx = (mousePos.x || width / 2) - p.x;
        const dy = (mousePos.y || height / 2) - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180) {
          const force = (180 - dist) / 180;
          p.x -= (dx / dist) * force * 5;
          p.y -= (dy / dist) * force * 5;
          p.radius = p.baseRadius * (1 + force * 2);
        } else {
          p.radius = p.baseRadius;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 133, 202, ${p.alpha})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 133, 202, ${0.2 * (1 - dist2 / 120)})`;
            ctx.stroke();
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleGlobalTrigger);
      window.removeEventListener('scroll', handleGlobalTrigger);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mousePos]);

  // Handle cursor disturbance
  let lastMove = useRef(Date.now());
  let moveCount = useRef(0);

  const handleMouseMove = (e) => {
    if (hasInteracted) return;
    setMousePos({ x: e.clientX, y: e.clientY });

    const now = Date.now();
    if (now - lastMove.current < 120) {
      moveCount.current += 1;
      setDisturbance((prev) => Math.min(100, prev + 18));
      if (moveCount.current > 3) {
        setStatusText('Kinetic Disturbance Detected • Unlocking Chapter Sphere...');
      }
    }
    lastMove.current = now;

    // Trigger full opening when disturbance motion detected
    if (moveCount.current >= 6) {
      triggerEnter();
    }
  };

  const triggerEnter = () => {
    if (hasInteracted) return;
    setHasInteracted(true);
    sessionStorage.setItem('klu_acm_portal_entered', 'true');
    localStorage.setItem('klu_acm_portal_entered', 'true');
    if (onEnter) onEnter();
  };

  if (hasInteracted) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="interactive-gateway"
        initial={{ opacity: 1 }}
        exit={{ 
          opacity: 0, 
          scale: 1.08, 
          filter: 'blur(12px)',
          transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } 
        }}
        onMouseMove={handleMouseMove}
        onClick={triggerEnter}
        onTouchStart={triggerEnter}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 99999,
          backgroundColor: '#030712',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* Canvas interactive background */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />

        {/* Ambient Center Glow */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 133, 202, 0.25) 0%, rgba(3, 7, 18, 0) 70%)',
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            left: mousePos.x ? `${mousePos.x}px` : '50%',
            top: mousePos.y ? `${mousePos.y}px` : '50%',
            transition: 'left 0.15s ease-out, top 0.15s ease-out',
          }}
        />

        {/* Main Gateway Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            maxWidth: '750px',
            padding: '40px 24px',
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              backgroundColor: 'rgba(0, 133, 202, 0.15)',
              border: '1px solid rgba(0, 133, 202, 0.4)',
              borderRadius: '999px',
              color: '#38bdf8',
              fontSize: '0.8rem',
              fontWeight: '700',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '28px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Cpu size={15} />
            <span>KLEF Student Chapter • Association for Computing Machinery</span>
          </motion.div>

          {/* Main Kinetic Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            style={{
              fontSize: 'clamp(42px, 7vw, 84px)',
              fontWeight: '900',
              letterSpacing: '-0.04em',
              color: '#ffffff',
              lineHeight: 1.05,
              marginBottom: '16px',
              textShadow: '0 0 35px rgba(0, 133, 202, 0.5)',
            }}
          >
            KLEF ACM
            <span
              style={{
                display: 'block',
                fontSize: 'clamp(22px, 3.5vw, 42px)',
                fontWeight: '600',
                color: '#94a3b8',
                letterSpacing: '0.05em',
                marginTop: '6px',
              }}
            >
              COMPUTING SPHERE
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              fontSize: 'clamp(14px, 1.8vw, 17px)',
              color: '#cbd5e1',
              lineHeight: 1.6,
              maxWidth: '560px',
              margin: '0 auto 36px auto',
              fontWeight: '400',
            }}
          >
            Advancing computer science education, competitive algorithms, artificial intelligence research, and peer technical mentorship.
          </motion.p>

          {/* Disturbance Progress Tracker */}
          <div
            style={{
              width: '280px',
              height: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              margin: '0 auto 20px auto',
              overflow: 'hidden',
              border: '1px solid rgba(0, 133, 202, 0.3)',
            }}
          >
            <motion.div
              style={{
                height: '100%',
                backgroundColor: '#0085CA',
                boxShadow: '0 0 12px #38bdf8',
                borderRadius: '999px',
                width: `${disturbance}%`,
                transition: 'width 0.15s ease-out',
              }}
            />
          </div>

          <p
            style={{
              fontSize: '0.8rem',
              color: '#38bdf8',
              fontFamily: 'monospace',
              marginBottom: '28px',
              letterSpacing: '0.04em',
            }}
          >
            {statusText}
          </p>

          {/* CTA Interactive Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(0, 133, 202, 0.8)' }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              triggerEnter();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 36px',
              backgroundColor: '#0085CA',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0, 133, 202, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <span>Enter Portal</span>
            <ArrowRight size={18} />
          </motion.button>
          
          <div style={{ marginTop: '16px', fontSize: '0.75rem', color: '#64748b' }}>
            Move your cursor or click anywhere to launch
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
