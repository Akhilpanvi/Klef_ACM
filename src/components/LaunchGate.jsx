import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import { LAUNCH_MODE } from '../launchMode';

// TEMPORARY launch-day gate (see src/launchMode.js).
// Until an admin presses LAUNCH, every visitor sees the launch screen. The admin's click
// plays 3-2-1 + celebration; other open screens notice within a few seconds and follow.

const LOGO = '/brand/klef-acm-logo.png';
const POLL_MS = 4000;
const CONFETTI = Array.from({ length: 90 }, (_, i) => ({
  left: Math.random() * 100,
  delay: Math.random() * 0.8,
  dur: 2.4 + Math.random() * 1.8,
  size: 6 + Math.random() * 8,
  color: ['#D32A38', '#0093D3', '#FFFFFF', '#FF5A62', '#5BBAE4', '#F5C542'][i % 6],
  spin: Math.random() * 720 - 360,
}));

export default function LaunchGate({ children }) {
  const { auth } = useContext(AuthContext) || {};
  const isAdmin = Boolean(auth?.authenticated);
  // 'checking' -> 'waiting' -> 'countdown' -> 'celebrate' -> 'live'
  const [phase, setPhase] = useState(LAUNCH_MODE ? 'checking' : 'live');
  const [count, setCount] = useState(3);
  const [error, setError] = useState('');

  // Poll launch state while waiting
  useEffect(() => {
    if (phase !== 'checking' && phase !== 'waiting') return;
    let stop = false;
    const check = async () => {
      try {
        const r = await fetch('/api/launch', { cache: 'no-store' });
        const { launched } = await r.json();
        if (stop) return;
        if (launched) setPhase(phase === 'checking' ? 'live' : 'celebrate');
        else if (phase === 'checking') setPhase('waiting');
      } catch {
        if (!stop && phase === 'checking') setPhase('live'); // API down: don't block the site
      }
    };
    check();
    const t = setInterval(check, POLL_MS);
    return () => { stop = true; clearInterval(t); };
  }, [phase]);

  // 3-2-1
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (count === 0) { setPhase('celebrate'); return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, count]);

  // Celebration, then reveal
  useEffect(() => {
    if (phase !== 'celebrate') return;
    const t = setTimeout(() => setPhase('live'), 4200);
    return () => clearTimeout(t);
  }, [phase]);

  // Lock page scroll while the gate is up
  useEffect(() => {
    if (phase === 'live') return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  const launch = async () => {
    setError('');
    try {
      const r = await fetch('/api/launch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ launched: true }), credentials: 'same-origin' });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Launch failed');
      setCount(3);
      setPhase('countdown');
    } catch (e) {
      setError(e.message);
    }
  };

  if (phase === 'live') return children;
  if (phase === 'checking') return <div className="launch" />;

  return (
    <div className={`launch is-${phase}`} role="dialog" aria-label="Website launch">
      <video className="launch-video" autoPlay muted loop playsInline poster="/media/kl-aerial-poster.jpg">
        <source src="/media/kl-aerial.mp4" type="video/mp4" />
      </video>
      <div className="launch-shade" />

      {phase === 'waiting' && (
        <div className="launch-stage">
          <div className="launch-logo"><img src={LOGO} alt="KL University × KLEF ACM Student Chapter" /></div>
          <p className="launch-kicker">Official website launch</p>
          <h1 className="launch-title">KLEF ACM<br /><span>Student Chapter</span></h1>
          {isAdmin ? (
            <>
              <button type="button" className="launch-btn" onClick={launch}>
                <span className="launch-ring" /><span className="launch-ring r2" />
                LAUNCH
              </button>
              <p className="launch-note">Press to launch the website for everyone</p>
              {error && <p className="launch-error">{error}</p>}
            </>
          ) : (
            <p className="launch-soon"><i />Launching soon. Stay on this page.</p>
          )}
        </div>
      )}

      {phase === 'countdown' && (
        <div className="launch-stage">
          <div key={count} className="launch-count">{count}</div>
        </div>
      )}

      {phase === 'celebrate' && (
        <div className="launch-stage">
          <div className="launch-confetti" aria-hidden="true">
            {CONFETTI.map((c, i) => (
              <span key={i} style={{ left: `${c.left}%`, width: c.size, height: c.size * 0.45, background: c.color, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s`, '--spin': `${c.spin}deg` }} />
            ))}
          </div>
          <div className="launch-logo pop"><img src={LOGO} alt="" /></div>
          <h1 className="launch-live">We’re <span>live!</span></h1>
          <p className="launch-kicker">Welcome to KLEF ACM</p>
        </div>
      )}
    </div>
  );
}

// Admin header switch: ON = visitors see the launch screen; OFF = site is open.
// Turning it ON again after a launch re-arms the LAUNCH button (use this to rehearse).
export function LaunchModeToggle() {
  const [on, setOn] = useState(null); // null = loading
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/launch', { cache: 'no-store' }).then(r => r.json()).then(j => setOn(!j.launched)).catch(() => setOn(null));
  }, []);

  const toggle = async () => {
    const next = !on;
    const msg = next
      ? 'Turn launch mode ON?\n\nThe public website will be hidden behind the launch screen until an admin presses LAUNCH.'
      : 'Turn launch mode OFF?\n\nThe website opens for everyone right away (no countdown).';
    if (!window.confirm(msg)) return;
    setBusy(true);
    try {
      const r = await fetch('/api/launch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ launched: !next }), credentials: 'same-origin' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed');
      setOn(!j.launched);
    } catch (e) {
      window.alert(`Could not change launch mode: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  if (!LAUNCH_MODE || on === null) return null;
  return (
    <button type="button" onClick={toggle} disabled={busy} className={`launch-toggle${on ? ' on' : ''}`}
      title={on ? 'Website is hidden behind the launch screen. Click to open it.' : 'Website is open. Click to show the launch screen again.'}>
      <i />{busy ? 'Saving…' : on ? 'Launch mode: ON' : 'Launch mode: OFF'}
    </button>
  );
}
