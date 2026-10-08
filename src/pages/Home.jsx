import { useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Calendar, 
  ArrowRight, 
  Cpu, 
  Code2, 
  Globe, 
  Zap, 
  Layers, 
  Users, 
  Shield, 
  Sparkles, 
  Trophy, 
  Network, 
  Lightbulb, 
  Mic, 
  Boxes,
  Camera,
  Compass,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Terminal,
  Activity,
  Award,
  X,
  Maximize2
} from 'lucide-react';
import { SiteDataContext } from '../App';
import SafeImage from '../components/SafeImage';
import VisualEditable from '../components/VisualEditor/VisualEditable';
import VisualImageReplacer from '../components/VisualEditor/VisualImageReplacer';
import PageBlockList from '../components/VisualEditor/PageBlockList';
const kluLogo = `${import.meta.env.BASE_URL}brand/klef-acm-logo.png`;

export default function Home() {
  const { siteData } = useContext(SiteDataContext);
  const homeData = siteData?.pages?.home?.content || {};
  const events = siteData?.events || [];

  const featuredEvent = events.find(e => e.is_featured && e.is_published) || events.find(e => e.is_published);
  const teamGroupPhoto = homeData.team_group_image_url || homeData.group_photo_url || '';
  const [zoomedImage, setZoomedImage] = useState(null);

  // Keyboard escape listener for lightbox
  useEffect(() => {
    if (zoomedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && zoomedImage) setZoomedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoomedImage]);

  // Scroll animations
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0.25]);

  // Official 6 ACM Chapter Initiatives with bespoke technical tracks, visual imagery & distinct ACM accents
  const initiatives = [
    {
      id: 'dev-sprints',
      track: '01',
      title: 'Dev Sprints',
      tagline: 'Collaborative Build Marathons',
      desc: 'Intense collaborative marathons where teams build and ship real-world software solutions from scratch.',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
      accentColor: '#00A3E0', // ACM Electric Blue
      bgTone: 'rgba(0, 163, 224, 0.05)',
      borderTone: 'rgba(0, 163, 224, 0.25)',
      icon: Code2,
      deliverables: ['Production Deployment', 'Rapid Prototyping', 'Team Git Workflow'],
      scope: 'Software Engineering'
    },
    {
      id: 'skill-labs',
      track: '02',
      title: 'Skill Labs',
      tagline: 'Deep-Dive Technical Workshops',
      desc: 'Practical, deep-dive workshops covering cutting-edge domains like AI/ML, cloud architecture, and full-stack development.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      accentColor: '#10B981', // Emerald Tech
      bgTone: 'rgba(16, 185, 129, 0.05)',
      borderTone: 'rgba(16, 185, 129, 0.25)',
      icon: Cpu,
      deliverables: ['Hands-on Code Labs', 'Cloud & AI Toolchains', 'Architecture Reviews'],
      scope: 'Applied Engineering'
    },
    {
      id: 'tech-keynotes',
      track: '03',
      title: 'Tech Keynotes',
      tagline: 'Distinguished Speaker Dialogues',
      desc: 'Inspirational sessions and panel discussions featuring insights from globally distinguished speakers and industry pioneers.',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
      accentColor: '#F59E0B', // Warm Amber
      bgTone: 'rgba(245, 158, 11, 0.05)',
      borderTone: 'rgba(245, 158, 11, 0.25)',
      icon: Mic,
      deliverables: ['ACM Speaker Sessions', 'Industry Trends', 'Interactive Q&A'],
      scope: 'Industry & Research'
    },
    {
      id: 'sandbox-projects',
      track: '04',
      title: 'Sandbox Projects',
      tagline: 'Open-Source Incubation',
      desc: 'Dedicated collaborative spaces to experiment with open-source systems, deploy APIs, and build portfolio-grade products.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      accentColor: '#6366F1', // ACM Indigo
      bgTone: 'rgba(99, 102, 241, 0.05)',
      borderTone: 'rgba(99, 102, 241, 0.25)',
      icon: Boxes,
      deliverables: ['Open-Source Repos', 'API & Microservices', 'Peer Code Reviews'],
      scope: 'Product Incubation'
    },
    {
      id: 'arena-battles',
      track: '05',
      title: 'Arena Battles',
      tagline: 'National Algorithmic Tournaments',
      desc: 'High-stakes national coding tournaments designed to test algorithmic speed, logic, and problem-solving skills.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      accentColor: '#DC2626', // Crimson Red
      bgTone: 'rgba(220, 38, 38, 0.05)',
      borderTone: 'rgba(220, 38, 38, 0.25)',
      icon: Trophy,
      deliverables: ['Competitive Contests', 'ICPC Style Rounds', 'Live Leaderboards'],
      scope: 'Algorithms & Rigor'
    },
    {
      id: 'nexus-mixers',
      track: '06',
      title: 'Nexus Mixers',
      tagline: 'Strategic Mentorship Hubs',
      desc: 'Strategic networking hubs connecting passionate tech students with prominent alumni, recruiters, and mentors worldwide.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      accentColor: '#0D9488', // Deep Teal
      bgTone: 'rgba(13, 148, 136, 0.05)',
      borderTone: 'rgba(13, 148, 136, 0.25)',
      icon: Network,
      deliverables: ['Alumni Mentorship', 'Career Conclaves', 'Research Synergy'],
      scope: 'Community & Careers'
    }
  ];

  return (
    <div style={{ backgroundColor: '#FCFCFD', color: 'var(--navy-900)' }}>
      
      {/* =========================================================================
          1. OFFICIAL CHAPTER HERO (Editorial Academic Layout)
          ========================================================================= */}
      <motion.section 
        style={{ 
          opacity: heroOpacity,
          position: 'relative',
          padding: '88px 0 76px 0',
          borderBottom: '1px solid var(--border-light)',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '56px', alignItems: 'center' }} className="hero-official-grid">
            
            {/* Left Column: Official Branding & Chapter Info */}
            <div>
              {/* Sharp Vector Typography for KLEF ACM */}
              <motion.div 
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ marginBottom: '24px' }}
              >
                <div className="editorial-kicker">
                  KLEF ACM Student Chapter
                </div>
                <h1 style={{ 
                  fontSize: 'clamp(80px, 12vw, 140px)', 
                  fontWeight: '900', 
                  letterSpacing: '-0.04em', 
                  lineHeight: '0.88', 
                  margin: 0,
                  textTransform: 'uppercase',
                  display: 'flex',
                  flexDirection: 'column',
                  userSelect: 'none'
                }}>
                  <span style={{ color: 'var(--kl-red)', display: 'block' }}>KLEF</span>
                  <span style={{ color: 'var(--acm-blue)', display: 'block' }}>ACM</span>
                </h1>
              </motion.div>

              <VisualEditable
                name="hero_description"
                as="p"
                defaultValue={homeData.hero_description || homeData.hero?.description || 'The official student chapter of the Association for Computing Machinery at Koneru Lakshmaiah Education Foundation. Advancing computing as a science and profession through hands-on development, research, and technical competitions.'}
                style={{ fontSize: '1.1rem', color: 'var(--slate-600)', lineHeight: '1.75', maxWidth: '580px', margin: '0 0 36px 0' }}
              />

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link 
                  to="/Events" 
                  className="btn btn-primary"
                  style={{ 
                    padding: '12px 26px', 
                    borderRadius: '4px', 
                    fontSize: '0.92rem', 
                    fontWeight: '700',
                    backgroundColor: 'var(--primary)',
                    borderColor: 'var(--primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>View Chapter Events</span>
                  <ArrowRight size={16} />
                </Link>

                <Link 
                  to="/About-KLEF-ACM" 
                  className="btn btn-secondary"
                  style={{ 
                    padding: '12px 22px', 
                    borderRadius: '4px', 
                    fontSize: '0.92rem', 
                    fontWeight: '600'
                  }}
                >
                  About Chapter
                </Link>

                <Link 
                  to="/Contact" 
                  className="btn btn-secondary"
                  style={{ 
                    padding: '12px 22px', 
                    borderRadius: '4px', 
                    fontSize: '0.92rem', 
                    fontWeight: '600'
                  }}
                >
                  Contact Desk
                </Link>
              </div>
            </div>

            {/* Right Column: Official Chapter Emblem */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '28px 24px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF'
                }}
                className="hero-logo-card"
              >
                <img 
                  src={kluLogo} 
                  alt="KLEF ACM Official Chapter Emblem" 
                  style={{ 
                    width: '100%', 
                    maxWidth: '520px', 
                    height: 'auto', 
                    objectFit: 'contain',
                    cursor: 'pointer'
                  }} 
                  onClick={() => setZoomedImage({ url: kluLogo, title: 'KLEF ACM Official Chapter Emblem' })}
                  title="Click to view emblem full screen"
                />
              </motion.div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* =========================================================================
          2. CHAPTER INITIATIVES & ACTIVITIES (Editorial Grid)
          ========================================================================= */}
      <section style={{ padding: '92px 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          
          {/* Section Header */}
          <div style={{ maxWidth: '720px', marginBottom: '52px' }}>
            <div className="editorial-kicker">
              ACM Technical Divisions & Programs
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 3.8vw, 42px)', fontWeight: '800', color: 'var(--navy-900)', letterSpacing: '-0.025em', margin: '0 0 14px 0', lineHeight: '1.2' }}>
              Chapter Initiatives & Activities
            </h2>
            <p style={{ color: 'var(--slate-600)', fontSize: '1rem', lineHeight: '1.7', margin: 0 }}>
              A systematic technical roadmap structured to cultivate excellence in software engineering, applied research, cloud systems design, and algorithmic problem solving.
            </p>
          </div>

          {/* 6-Track Matrix with Architectural Discipline */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
            {initiatives.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="elevate-card"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '4px',
                    border: '1px solid var(--border-light)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    
                  }}
                >
                  {/* Cover Photography */}
                  <div style={{ position: 'relative', height: '220px', backgroundColor: 'var(--navy-950)', overflow: 'hidden' }}>
                    <SafeImage
                      src={item.image}
                      alt={item.title}
                      fallbackIcon={Icon}
                      fallbackText={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Title & Tagline */}
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
                      {item.title}
                    </h3>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                      {item.tagline}
                    </div>

                    {/* Core Description */}
                    <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', lineHeight: '1.65', margin: '0 0 20px 0', flex: 1 }}>
                      {item.desc}
                    </p>

                    {/* Deliverables / Focus Highlights */}
                    <div style={{ backgroundColor: 'var(--slate-50)', borderRadius: '4px', padding: '12px 14px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                        Key Outcomes
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {item.deliverables.map((deliv, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--navy-700)', fontWeight: '500' }}>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: item.accentColor }} />
                            <span>{deliv}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer Link */}
                    <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Chapter Program
                      </span>
                      <Link 
                        to="/Events" 
                        style={{ 
                          color: 'var(--primary)', 
                          fontWeight: '700', 
                          fontSize: '0.84rem', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          textDecoration: 'none' 
                        }}
                      >
                        <span>View Schedule</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. FEATURED LIVE CHAPTER SESSION (CMS Bound)
          ========================================================================= */}
      {featuredEvent ? (
        <section style={{ padding: '88px 0', backgroundColor: 'var(--slate-50)', borderBottom: '1px solid var(--border-light)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div className="editorial-kicker">
                  Chapter Bulletin
                </div>
                <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: '800', color: 'var(--navy-900)', letterSpacing: '-0.02em', margin: 0 }}>
                  Featured Chapter Session
                </h2>
              </div>
              <Link to="/Events" style={{ color: 'var(--primary)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', textDecoration: 'none' }}>
                All Chapter Events <ArrowRight size={15} />
              </Link>
            </div>

            <div 
              style={{
                borderRadius: '4px',
                border: '1px solid var(--border-light)',
                backgroundColor: '#FFFFFF',
                padding: '36px',
                display: 'grid',
                gridTemplateColumns: featuredEvent.image_url ? '1fr 1.3fr' : '1fr',
                gap: '36px',
                alignItems: 'center'
              }}
              className="featured-event-grid"
            >
              {featuredEvent.image_url && (
                <div style={{ minHeight: '240px', maxHeight: '320px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-light)', backgroundColor: '#FFFFFF' }}>
                  <SafeImage 
                    src={featuredEvent.image_url} 
                    alt={featuredEvent.title} 
                    fit="contain"
                    style={{ maxHeight: '300px', maxWidth: '100%' }}
                    fallbackIcon={Calendar}
                    fallbackText="Featured Event"
                  />
                </div>
              )}
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '10px' }}>
                  {new Date(featuredEvent.date) >= new Date() ? 'Upcoming Session' : 'Recent Session'}
                </span>
                <h3 style={{ fontSize: '1.6rem', color: 'var(--navy-900)', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                  {featuredEvent.title}
                </h3>
                <div style={{ display: 'flex', gap: '18px', color: 'var(--slate-500)', fontSize: '0.86rem', marginBottom: '16px', flexWrap: 'wrap', fontWeight: '500' }}>
                  <span>📅 {new Date(featuredEvent.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                  <span>📍 {featuredEvent.venue}</span>
                  {featuredEvent.speaker && <span>🎤 {featuredEvent.speaker}</span>}
                </div>
                <p style={{ color: 'var(--slate-600)', marginBottom: '24px', lineHeight: '1.7', fontSize: '0.96rem' }}>
                  {featuredEvent.description?.substring(0, 240)}...
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {featuredEvent.registration_link && new Date(featuredEvent.date) >= new Date() && (
                    <a 
                      href={featuredEvent.registration_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary"
                      style={{ borderRadius: '4px', padding: '10px 22px' }}
                    >
                      Register Online <ArrowRight size={15} />
                    </a>
                  )}
                  <Link to="/Events" className="btn btn-secondary" style={{ borderRadius: '4px', padding: '10px 20px' }}>
                    View Full Schedule
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* =========================================================================
          4. LEADERSHIP & TEAM SPOTLIGHT
          ========================================================================= */}
      <section style={{ padding: '88px 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="editorial-kicker">
                Executive Leadership
              </div>
              <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', color: 'var(--navy-900)', margin: 0, letterSpacing: '-0.02em', fontWeight: '800' }}>
                Chapter Committee & Leadership
              </h2>
            </div>
            <Link to="/Members" style={{ color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', textDecoration: 'none' }}>
              <span>View Core Committee Roster</span> <ArrowRight size={15} />
            </Link>
          </div>

          {/* Chapter Group Photo Showcase Frame or Placeholder - Uncropped with Lightbox Zoom */}
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1.5px solid var(--border-light)',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
              position: 'relative'
            }}
          >
            {teamGroupPhoto ? (
              <div 
                style={{ 
                  width: '100%', 
                  backgroundColor: '#070B14', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => setZoomedImage({ url: teamGroupPhoto, title: 'KLEF ACM Student Chapter Leadership Cohort' })}
                title="Click to expand full size"
              >
                <img
                  src={teamGroupPhoto}
                  alt="KLEF ACM Student Chapter Team Cohort"
                  style={{ 
                    width: '100%', 
                    maxHeight: '620px', 
                    height: 'auto', 
                    objectFit: 'contain', 
                    borderRadius: '8px', 
                    display: 'block',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)' 
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  color: '#FFFFFF',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backdropFilter: 'blur(6px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                  <Maximize2 size={13} />
                  <span>Click to expand</span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '72px 24px',
                  background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #CBD5E1',
                  borderRadius: '16px',
                  margin: '8px'
                }}
              >
                <div 
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(0, 92, 169, 0.08)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    border: '1px solid rgba(0, 92, 169, 0.15)'
                  }}
                >
                  <Users size={30} />
                </div>

                <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: '6px' }}>
                  Official Cohort Showcase
                </span>

                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--navy-900)', margin: '0 0 8px 0' }}>
                  KLEF ACM Student Chapter Group Photo
                </h3>
                
                <p style={{ color: 'var(--slate-600)', fontSize: '0.94rem', maxWidth: '500px', lineHeight: '1.6', margin: '0' }}>
                  Faculty coordinators, executive committee officers, and technical division leads of the KLEF ACM Student Chapter.
                </p>
              </div>
            )}

            {/* Bottom Bar Under Group Photo: Explore Members Directory */}
            <div
              style={{
                padding: '18px 24px',
                backgroundColor: '#FFFFFF',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--navy-900)', display: 'block' }}>
                  Meet the Dedicated Leadership Team
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                  Faculty mentors, office bearers, SIG leads & student committee members
                </span>
              </div>

              <Link 
                to="/Members" 
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.88rem'
                }}
              >
                <Users size={16} />
                <span>Explore Members Directory</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. INSTITUTIONAL CALL TO ACTION
          ========================================================================= */}
      <section style={{ backgroundColor: 'var(--slate-50)', padding: '88px 0' }}>
        <div className="container">
          <div 
            style={{ 
              maxWidth: '880px', 
              margin: '0 auto',
              textAlign: 'center',
              border: '1px solid var(--border-light)',
              padding: '56px 36px',
              borderRadius: '4px',
              backgroundColor: '#FFFFFF'
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '4px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Zap size={22} />
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', color: 'var(--navy-900)', marginBottom: '14px', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Join the KLEF ACM Student Chapter
            </h2>
            <p style={{ color: 'var(--slate-600)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '32px', maxWidth: '620px', margin: '0 auto 32px auto' }}>
              Participate in student workshops, contribute to technical repositories, and represent KL Deemed to be University in regional and national computing contests.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                to="/Events" 
                className="btn btn-primary"
                style={{ borderRadius: '4px' }}
              >
                Explore Events <ArrowRight size={16} />
              </Link>
              <Link 
                to="/Contact" 
                className="btn btn-secondary"
                style={{ borderRadius: '4px' }}
              >
                Contact Leadership
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Free-Form Dynamic Content Blocks */}
      <div className="container" style={{ padding: '0 24px' }}>
        <PageBlockList blockKey="home_blocks" style={{ margin: '32px 0' }} />
      </div>

      {/* Full-Screen High-Resolution Photo Lightbox Modal - Attached to document.body via Portal */}
      {zoomedImage && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 2147483647,
            backgroundColor: 'rgba(5, 10, 20, 0.95)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
          onClick={() => setZoomedImage(null)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomedImage(null);
            }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '24px',
              zIndex: 2147483647,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              transition: 'background-color 0.2s ease, transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Close (Esc)"
          >
            <X size={22} />
          </button>

          {/* Lightbox Image Container */}
          <div
            style={{
              maxWidth: '92vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedImage.url}
              alt={zoomedImage.title || 'Full resolution showcase'}
              style={{
                maxWidth: '92vw',
                maxHeight: '82vh',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                display: 'block'
              }}
            />
            {zoomedImage.title && (
              <div style={{
                marginTop: '14px',
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: '700',
                letterSpacing: '-0.01em',
                textAlign: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                padding: '8px 20px',
                borderRadius: '999px',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {zoomedImage.title}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Scoped responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .hero-official-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .featured-event-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
