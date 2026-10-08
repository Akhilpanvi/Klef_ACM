import { useContext, useEffect, useRef, useState } from 'react';
import { SiteDataContext } from '../App';

const LOGO = `${import.meta.env.BASE_URL}brand/klef-acm-logo.png`;
// KL University building photos, flashed behind the logo as the counter runs
const SHOTS = [1, 2, 3, 4, 5, 6].map(n => `${import.meta.env.BASE_URL}brand/loader/kl-0${n}.jpg`);
const TITLE = 'ADVANCING COMPUTING';
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/';
const DURATION = 3000; // ms for the counter to reach 100 (~0.5s per photo)
const MAX_WAIT = 9000; // never hold the site longer than this, even if the network is slow

// The page behind the loader is "ready" when fonts are in and any hero video can play through
// without stalling, so the reveal never shows half-loaded content.
const pageReady = () => {
  if (document.fonts && document.fonts.status !== 'loaded') return false;
  return [...document.querySelectorAll('.hero-video video')].every(v => v.readyState >= 3 || v.error);
};

// Reveals `text` left to right as pct grows; unrevealed letters show random glyphs.
const scramble = (text, pct) =>
  text.split('').map((c, i) =>
    c === ' ' || i < (text.length * pct) / 100 ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
  ).join('');

// Full-screen loading screen shown once per full page load (inspired by donprod.uk).
export default function Loader() {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  const [shot, setShot] = useState(0);
  // Hold at 90% until the chapter data is ready so the page never flashes empty.
  const { siteDataLoading } = useContext(SiteDataContext) || {};
  const dataReady = useRef(!siteDataLoading);
  useEffect(() => { dataReady.current = !siteDataLoading; }, [siteDataLoading]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    let loaded = document.readyState === 'complete';
    const onLoad = () => { loaded = true; };
    window.addEventListener('load', onLoad);

    let raf;
    let exitTimer;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      // ponytail: timed progress, held at 90% until window, site data, fonts and hero video are ready
      const ready = (loaded && dataReady.current && pageReady()) || now - start > MAX_WAIT;
      const value = Math.round((ready ? eased : Math.min(eased, 0.9)) * 100);
      setPct(value);
      setShot(Math.min(SHOTS.length - 1, Math.floor(t * SHOTS.length))); // even pacing, independent of the eased counter
      if (value >= 100) {
        setDone(true);
        exitTimer = setTimeout(() => {
          setGone(true);
          document.body.style.overflow = '';
        }, 1000);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(exitTimer);
      window.removeEventListener('load', onLoad);
      document.body.style.overflow = '';
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`loader${done ? ' is-done' : ''}`} role="status" aria-label={`Loading ${pct}%`}>
      <div className="loader-shots" aria-hidden="true">
        {SHOTS.map((src, i) => <img key={src} src={src} alt="" className={i <= shot ? 'on' : ''} style={{ zIndex: i }} />)}
      </div>

      <div className="loader-bar">
        <span>KLEF ACM <i>••</i></span>
        <span className="loader-title">{scramble(TITLE, pct)}</span>
        <span><i>••</i> STUDENT CHAPTER</span>
      </div>

      <div className="loader-stage">
        <div className="loader-progress"><span style={{ transform: `scaleX(${pct / 100})` }} /></div>
        <div className="loader-glass"><img src={LOGO} alt="" className="loader-logo" /></div>
        <div className="loader-pct">{pct}<small>%</small></div>
      </div>
    </div>
  );
}
