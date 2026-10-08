import { useContext, useEffect, useRef, useState } from 'react';
import { SiteDataContext } from '../App';

const LOGO = `${import.meta.env.BASE_URL}brand/klef-acm-logo.png`;
const TITLE = 'ADVANCING COMPUTING';
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/';
const DURATION = 1800; // ms for the counter to reach 100
const MAX_WAIT = 8000; // never hold the site longer than this, even if the API is slow

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
      // ponytail: timed progress, held at 90% until the window and site data have loaded
      const ready = (loaded && dataReady.current) || now - start > MAX_WAIT;
      const value = Math.round((ready ? eased : Math.min(eased, 0.9)) * 100);
      setPct(value);
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
