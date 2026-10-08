import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { SiteDataContext } from '../App';
import SafeImage from '../components/SafeImage';
import VisualEditable from '../components/VisualEditor/VisualEditable';
import PageBlockList from '../components/VisualEditor/PageBlockList';
import { parseMemberData } from '../utils/dataHelpers.jsx';

// Layout and motion inspired by acmvit.in. No photos yet (chapter just launched):
// visuals are drawn in code — wireframe hero, SVG cassettes, gradient art.

const ease = [0.16, 1, 0.3, 1];
const CAMPUS = `${import.meta.env.BASE_URL}brand/KL%20Buildings/klu.jpg`;

// ACM Code of Ethics, section 1 (General Ethical Principles), abbreviated
const ETHICS = [
  'Contribute to society and to human well-being',
  'Avoid harm',
  'Be honest and trustworthy',
  'Be fair and take action not to discriminate',
  'Respect the work required to produce new ideas',
  'Respect privacy',
  'Honor confidentiality'
];

const DEFAULT_ACTIVITIES = [
  'Technical Workshops on Web Dev, AI/ML, Cloud Computing',
  'National-level Hackathons and Competitive Programming Contests',
  'Collaborative Research projects and Paper Presentations',
  'Mentorship sessions by alumni and industry experts'
];
const DOMAIN_GLOWS = ['#D32A38', '#0093D3', '#D32A38', '#0093D3'];

// Line slides up from behind its mask. The mask is what's observed: the inner span
// starts fully clipped, so observing it directly would never report "in view".
function Line({ children, delay = 0 }) {
  return (
    <motion.span className="mask" initial="hide" whileInView="show" viewport={{ once: true, amount: 0.5 }}>
      <motion.span variants={{ hide: { y: '105%' }, show: { y: 0, transition: { duration: 1, delay, ease } } }}>
        {children}
      </motion.span>
    </motion.span>
  );
}

const Fade = ({ children, delay = 0, className, style }) => (
  <motion.div className={className} style={style} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.9, delay, ease }}>
    {children}
  </motion.div>
);

// Retro cassette drawn in SVG; reels spin via CSS
function Cassette({ label, color = '#D32A38' }) {
  return (
    <svg viewBox="0 0 320 200" className="cassette" aria-hidden="true">
      <rect x="2" y="2" width="316" height="196" rx="14" fill="#F4F1EA" stroke="#111214" strokeWidth="3" />
      {[18, 302].map(cx => [18, 182].map(cy => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="none" stroke="#111214" strokeWidth="1.5" />))}
      <rect x="24" y="20" width="272" height="100" rx="8" fill="#fff" stroke="#111214" strokeWidth="2" />
      <path d="M24 28a8 8 0 0 1 8-8h256a8 8 0 0 1 8 8v14H24z" fill={color} />
      <text x="36" y="36" fontFamily="'Geist Mono', monospace" fontSize="11" fill="#fff" letterSpacing="1.5">{label}</text>
      {[54, 62].map(y => <line key={y} x1="36" y1={y} x2="284" y2={y} stroke={color} strokeWidth="3" strokeOpacity=".85" />)}
      <rect x="86" y="72" width="148" height="38" rx="19" fill="#111214" />
      {[110, 210].map(cx => (
        <g key={cx} className="reel">
          <circle cx={cx} cy="91" r="15" fill="#F4F1EA" />
          {[0, 60, 120].map(a => <rect key={a} x={cx - 1.5} y="78" width="3" height="26" fill="#111214" transform={`rotate(${a} ${cx} 91)`} />)}
          <circle cx={cx} cy="91" r="5" fill="#111214" />
        </g>
      ))}
      <path d="M64 198 L86 146 H234 L256 198" fill="none" stroke="#111214" strokeWidth="2" />
      {[112, 148, 172, 208].map(cx => <circle key={cx} cx={cx} cy="176" r="5" fill="none" stroke="#111214" strokeWidth="1.5" />)}
    </svg>
  );
}

const profilePath = (m) =>
  `/Members/${encodeURIComponent((m.name || 'member').trim().replace(/\s+/g, '-'))}/${encodeURIComponent((m.role || 'Member').trim().replace(/\s+/g, '-'))}`;

export default function Home() {
  const { siteData } = useContext(SiteDataContext);
  const reduce = useReducedMotion();
  const homeData = siteData?.pages?.home?.content || {};
  const chapterData = siteData?.pages?.['about-klef-acm']?.content || {};
  const acmData = siteData?.pages?.['about-acm']?.content || {};
  const events = (siteData?.events || []).filter(e => e.is_published);
  const members = [...(siteData?.members || [])].sort((a, b) => parseMemberData(a).display_order - parseMemberData(b).display_order);
  const team = members.filter(m => m.photograph_url).slice(0, 8);
  const activities = Array.isArray(chapterData.activities) && chapterData.activities.length ? chapterData.activities : DEFAULT_ACTIVITIES;

  const about = [
    { tape: 'ABOUT KLEF ACM', color: '#D32A38', title: 'KLEF ACM', text: chapterData.introduction || 'The ACM Student Chapter at KL Deemed to be University, under the Department of Computer Science & Engineering.' },
    { tape: 'ABOUT KL UNIVERSITY', color: '#111214', title: 'KL University', text: 'Koneru Lakshmaiah Education Foundation — KL Deemed to be University — at the Green Fields campus in Vaddeswaram, Andhra Pradesh.' },
    { tape: 'ABOUT ACM', color: '#0093D3', title: 'ACM', text: acmData.intro || 'The Association for Computing Machinery is the world’s largest educational and scientific computing society.' }
  ];

  // --- Hero: campus line-drawing on a tilted plane; tilts with the mouse, drifts on scroll
  const heroRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tiltY = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 60, damping: 18 });
  const tiltX = useSpring(useTransform(my, [-1, 1], [34, 24]), { stiffness: 60, damping: 18 });
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const campusY = useTransform(heroP, [0, 1], ['0%', '18%']);
  const campusScale = useTransform(heroP, [0, 1], [1, 1.06]);
  const onHeroMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  // --- About: pinned, steps through three tapes
  const aboutRef = useRef(null);
  const { scrollYProgress: aboutP } = useScroll({ target: aboutRef, offset: ['start start', 'end end'] });
  const [aboutIdx, setAboutIdx] = useState(0);
  useMotionValueEvent(aboutP, 'change', v => setAboutIdx(Math.min(about.length - 1, Math.floor(v * about.length))));

  // --- Domains: vertical scroll drives a horizontal track
  const domRef = useRef(null);
  const trackRef = useRef(null);
  const [dist, setDist] = useState(0);
  useLayoutEffect(() => {
    const measure = () => setDist(Math.max(0, (trackRef.current?.scrollWidth || 0) - window.innerWidth + 48));
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activities.length]);
  const { scrollYProgress: domP } = useScroll({ target: domRef, offset: ['start start', 'end end'] });
  const trackX = useTransform(domP, [0, 1], [0, -dist]);

  // --- Events: pill zooms until it fills the screen
  const evRef = useRef(null);
  const { scrollYProgress: evP } = useScroll({ target: evRef, offset: ['start start', 'end end'] });
  const pillScale = useTransform(evP, [0.1, 0.9], [1, 16]);

  useEffect(() => { document.body.classList.add('home-page'); return () => document.body.classList.remove('home-page'); }, []);

  return (
    <div>
      {/* ================= HERO (dark) ================= */}
      <section ref={heroRef} className="vhero dark" onMouseMove={reduce ? undefined : onHeroMove}>
        <div className="vglow red" />
        <div className="vglow blue" />
        <div className="vfloor" />
        {/* Edge-detection filter: turns the campus photo into white line art */}
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <filter id="wireframe" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" />
            <feGaussianBlur stdDeviation="0.4" />
            <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" />
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0 0.5 0.9 1 1" /><feFuncG type="table" tableValues="0 0.5 0.9 1 1" /><feFuncB type="table" tableValues="0 0.5 0.9 1 1" />
            </feComponentTransfer>
          </filter>
        </svg>
        <motion.div className="campus-plane" aria-hidden="true" style={reduce ? undefined : { y: campusY, scale: campusScale }}>
          <motion.div className="campus-tilt" style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY }}>
            <img src={CAMPUS} alt="" className="campus-lines" />
          </motion.div>
        </motion.div>

        <div className="container">
          <h1 className="vhero-title">
            <Line><span className="t-red">we are the</span></Line>
            <Line delay={0.08}>association for</Line>
            <Line delay={0.16}>computing machinery</Line>
          </h1>
          <Fade delay={0.4} style={{ marginTop: '36px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/Events" className="pill-btn">Explore events →</Link>
            <Link to="/Members" className="pill-btn ghost">Meet the team</Link>
          </Fade>
        </div>

        <div className="container vhero-foot mono">
          <span>KLEF ACM Student Chapter.<br /><b>Just getting started.</b></span>
          <span style={{ textAlign: 'right' }}>We’re not just another <b>tech club</b>.<br />We’re a community that <b>builds</b>.</span>
        </div>
      </section>

      {/* ================= ABOUT (light, pinned) ================= */}
      <section ref={aboutRef} className="pin-wrap" style={{ height: reduce ? 'auto' : `${about.length * 100}vh` }}>
        <div className="pin-stage" style={reduce ? { position: 'relative', height: 'auto', padding: '120px 0' } : undefined}>
          <div className="container about-grid">
            <div>
              <div className="o-kicker">About · 0{aboutIdx + 1}/0{about.length}</div>
              <div className="about-panels">
                <AnimatePresence mode="wait">
                  <motion.div key={aboutIdx} className="about-panel" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5, ease }}>
                    <h2 className="giant" style={{ marginBottom: '24px' }}>{about[aboutIdx].title}</h2>
                    <p className="lead" style={{ maxWidth: '520px', color: 'var(--muted)' }}>{about[aboutIdx].text}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="about-dots">{about.map((_, i) => <span key={i} className={i === aboutIdx ? 'on' : ''} />)}</div>
            </div>
            <div className="tape-stack">
              {about.map((a, i) => {
                const pos = (i - aboutIdx + about.length) % about.length; // 0 = front
                return (
                  <motion.div
                    key={a.tape}
                    animate={{ x: `${pos * 9}%`, y: `${pos * 12}%`, rotate: pos === 0 ? -6 : 4 + pos * 5, scale: 1 - pos * 0.06, opacity: pos === 0 ? 1 : 0.55 }}
                    transition={{ duration: 0.7, ease }}
                    style={{ zIndex: about.length - pos, left: '6%', top: '4%' }}
                  >
                    <Cassette label={a.tape} color={a.color} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= VISION / MISSION / ETHICS (light) ================= */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="values">
            <div>
              <h2 className="giant" style={{ marginBottom: '24px' }}><Line>Our</Line><Line delay={0.08}><span className="t-red">Vision</span></Line></h2>
              <Fade><p className="lead" style={{ maxWidth: '520px', color: 'var(--muted)' }}>{chapterData.vision || 'To create an environment of computational excellence, innovation and peer-to-peer mentorship.'}</p></Fade>
            </div>
            <div>
              <h2 className="giant" style={{ marginBottom: '24px' }}><Line>Our</Line><Line delay={0.08}><span className="t-blue">Mission</span></Line></h2>
              <Fade><p className="lead" style={{ maxWidth: '520px', color: 'var(--muted)' }}>{chapterData.mission || 'To provide students with technical exposure, workshops, research guidance and competitive challenges.'}</p></Fade>
            </div>
            <div>
              <h2 className="display-title"><Line>Code of</Line><Line delay={0.08}><span className="t-red">conduct</span></Line></h2>
              <p className="mono" style={{ marginTop: '18px', color: 'var(--muted)', maxWidth: '420px' }}>Our values are grounded in the ACM Code of Ethics and Professional Conduct.</p>
            </div>
            <div>
              <ul className="ethics">
                {ETHICS.map((e, i) => (
                  <Fade key={e} delay={i * 0.04}><li><span>1.{i + 1}</span>{e}</li></Fade>
                ))}
              </ul>
              <a href="https://www.acm.org/code-of-ethics" target="_blank" rel="noopener noreferrer" className="text-link" style={{ marginTop: '24px' }}>Read the ACM Code of Ethics ↗</a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DOMAINS (dark, horizontal) ================= */}
      <section ref={domRef} className="dark dotted" style={{ height: reduce ? 'auto' : `calc(100vh + ${dist}px)` }}>
        <div className="pin-stage" style={{ flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', ...(reduce ? { position: 'relative', height: 'auto', padding: '100px 0' } : {}) }}>
          <div className="container" style={{ marginBottom: '40px' }}>
            <div className="o-kicker" style={{ color: '#FF5A62' }}>What we do</div>
            <h2 className="display-title" style={{ color: '#fff', maxWidth: '900px' }}>Every domain is a <span className="t-red" style={{ color: '#FF5A62' }}>mindset</span>.</h2>
          </div>
          <motion.div ref={trackRef} className="hscroll-track" style={{ x: reduce ? 0 : trackX, flexWrap: reduce ? 'wrap' : 'nowrap' }}>
            {activities.map((a, i) => (
              <div key={i} className="domain-card">
                <div className="art" style={{ background: DOMAIN_GLOWS[i % DOMAIN_GLOWS.length] }} />
                <span className="num">0{i + 1} /</span>
                <h3>{String(a)}</h3>
                <Link to="/Events" className="text-link" style={{ color: '#EDEDEA', alignSelf: 'flex-start' }}>Explore →</Link>
              </div>
            ))}
            <div className="domain-card" style={{ background: 'var(--kl-red)', borderColor: 'transparent' }}>
              <span className="num" style={{ color: '#fff' }}>+ more /</span>
              <h3>Your idea could be next</h3>
              <Link to="/Contact" className="text-link" style={{ color: '#fff', alignSelf: 'flex-start' }}>Pitch it →</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= EVENTS: pill zoom ================= */}
      <section ref={evRef} className="events-pin" style={reduce ? { height: 'auto' } : undefined}>
        <div className="events-stage" style={reduce ? { position: 'relative', height: '70vh' } : undefined}>
          <motion.div className="events-pill" style={{ scale: reduce ? 1 : pillScale }} aria-label="Events">
            {'EVENTS'.split('').map((c, i) => <span key={i}>{c}</span>)}
          </motion.div>
        </div>
      </section>
      <section className="dark" style={{ padding: '40px 0 clamp(80px, 10vw, 140px)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <h2 className="display-title" style={{ color: '#fff' }}><Line>Beyond the</Line><Line delay={0.08}><span style={{ color: '#FF5A62' }}>classroom</span></Line></h2>
            <Link to="/Events" className="pill-btn">All events →</Link>
          </div>
          {events.length === 0 && <p className="mono" style={{ padding: '40px 0' }}>Our first events are on the way. Stay tuned.</p>}
          {events.slice(0, 4).map((e, i) => {
            const d = new Date(e.date);
            return (
              <Fade key={e.id} delay={i * 0.06}>
                <Link to="/Events" className="event-row">
                  <div className="event-art">
                    {e.image_url
                      ? <SafeImage src={e.image_url} alt={e.title} fit="cover" />
                      : <div className="d">{d.getDate()}<small>{d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}</small></div>}
                  </div>
                  <div>
                    <div className="mono" style={{ marginBottom: '8px' }}>{d.toLocaleDateString('en-US', { dateStyle: 'medium' })}{e.venue ? ` · ${e.venue}` : ''}</div>
                    <h3 style={{ color: '#fff', fontSize: 'clamp(1.3rem, 2.4vw, 2rem)', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '-0.03em' }}>{e.title}</h3>
                    {e.speaker && <div className="mono" style={{ marginTop: '8px' }}>with {e.speaker}</div>}
                  </div>
                  <span className="pill-btn ghost" style={{ color: '#fff' }}>Details →</span>
                </Link>
              </Fade>
            );
          })}
        </div>
      </section>

      {/* ================= TEAM (light) ================= */}
      {team.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap', marginBottom: '48px' }}>
              <h2 className="giant"><Line>The</Line><Line delay={0.08}><span className="t-red">Team</span></Line></h2>
              <Link to="/Members" className="pill-btn">See the entire crew →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {team.map((m, i) => (
                <Fade key={m.id} delay={(i % 4) * 0.06}>
                  <Link to={profilePath(m)} className="mcard" style={{ display: 'block' }}>
                    <div className="mcard-media"><SafeImage src={m.photograph_url} alt={m.name} fit="cover" /></div>
                    <div className="mcard-glass">
                      <div style={{ minWidth: 0 }}>
                        <div className="mcard-role">{m.role}</div>
                        <h3 className="mcard-name">{m.name}</h3>
                      </div>
                      <span className="mcard-icon">↗</span>
                    </div>
                  </Link>
                </Fade>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= MARQUEE (dark) ================= */}
      <section className="dark marquee" aria-hidden="true">
        <div className="marquee-track editorial-marquee-track">
          {Array.from({ length: 4 }).flatMap((_, k) => ['Learn.', 'Build.', 'Lead.'].map(w => <span key={`${k}-${w}`}>{w}</span>))}
        </div>
      </section>

      {/* ================= SAY HELLO (light) ================= */}
      <section className="section">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'end' }}>
          <h2 className="giant"><Line>Say</Line><Line delay={0.08}><span className="t-red">hello</span></Line></h2>
          <Fade>
            <VisualEditable
              name="hero_description"
              as="p"
              className="lead"
              defaultValue={homeData.hero_description || 'A community of students and faculty at KL University advancing computing through workshops, research, hackathons and competitive programming.'}
              style={{ maxWidth: '520px', color: 'var(--muted)', marginBottom: '28px' }}
            />
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/Contact" className="pill-btn">Join the chapter →</Link>
              <Link to="/About-KLEF-ACM" className="pill-btn ghost">About us</Link>
            </div>
          </Fade>
        </div>
      </section>

      {/* Free-form CMS blocks */}
      <div className="container">
        <PageBlockList blockKey="home_blocks" style={{ margin: '32px 0' }} />
      </div>
    </div>
  );
}
