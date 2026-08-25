import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Cpu, FileText, Award, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { SiteDataContext } from '../App';
import { 
  ScrollReveal, 
  TextReveal, 
  EditorialLabel, 
  OversizedText, 
  ScrollScaleText, 
  WordHighlight, 
  SplitText 
} from '../components/ScrollReveal';

// Editorial Marquee component
function EditorialMarquee({ text = "KLU ACM • COMPUTING • COMMUNITY • RESEARCH • INNOVATION" }) {
  const trackText = `${text} • ${text} • `;
  return (
    <div style={{ 
      borderTop: '1px solid var(--border)', 
      borderBottom: '1px solid var(--border)', 
      padding: '16px 0', 
      margin: '40px 0',
      overflow: 'hidden',
      width: '100%',
      backgroundColor: '#ffffff'
    }}>
      <div className="editorial-marquee-track" style={{ display: 'flex', gap: '32px', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        <span>{trackText}</span>
        <span>{trackText}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { siteData } = useContext(SiteDataContext);
  const homeData = siteData?.pages?.home?.content || {};
  const events = siteData?.events || [];
  const gallery = siteData?.gallery || [];

  const heroImageUrl = homeData.hero_image_url || '';
  const communityImageUrl = homeData.community_image_url || '';
  const awardsImageUrl = homeData.awards_image_url || '';
  const researchImageUrl = homeData.research_image_url || '';

  // Hero content bindings
  const heroTitle = homeData.hero?.title || 'Empowering Future Computing Professionals';
  const heroDesc = homeData.hero?.description || 'Welcome to the official portal of the KLU ACM Student Chapter. We foster a community of passionate student developers, researchers, and innovators driving the future of computer science.';

  // Stats content bindings - only show if explicitly set in the database (no fake defaults)
  const statsEvents = homeData.stats?.events_count;
  const statsMembers = homeData.stats?.members_count;
  const statsWorkshops = homeData.stats?.workshops_count;
  const statsProjects = homeData.stats?.projects_count;
  const hasStats = statsEvents || statsMembers || statsWorkshops || statsProjects;

  // Intro content bindings
  const introHeading = homeData.introduction?.heading || 'Advancing Computing as a Science & Profession';
  const introText = homeData.introduction?.text || 'The KLU ACM Student Chapter is dedicated to promoting a deeper understanding of computing, software engineering, and technological research among student developers. Through guest lectures, coding bootcamps, and national hackathons, we bridge the gap between academic theory and industry excellence.';

  // Achievements - only show if explicitly provided in database (no fake placeholders)
  const achievements = Array.isArray(homeData.achievements) ? homeData.achievements : [];

  // Derive Featured Event (is_featured = true and is_published = true)
  const featuredEvent = events.find(e => e.is_featured && e.is_published) || events.find(e => e.is_published);

  // Derive top 3 recent published events (excluding featured if it exists)
  const filteredEventsForGrid = featuredEvent 
    ? events.filter(e => e.id !== featuredEvent.id && e.is_published).slice(0, 3)
    : events.filter(e => e.is_published).slice(0, 3);

  // Derive top 4 gallery images
  const galleryTeaser = gallery.slice(0, 4);

  // Subtle Parallax hook
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let active = true;
    const handleScroll = () => {
      if (active) {
        setScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      active = false;
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const parallaxTransform = !isReduced 
    ? { transform: `translateY(${Math.min(20, Math.max(-20, scrollY * 0.03))}px)`, transition: 'transform 0.1s ease-out' }
    : {};

  // Split hero description by sentences for staggering reveals
  const sentences = heroDesc.split('. ').map((s, idx, arr) => {
    let t = s.trim();
    if (!t) return '';
    if (idx < arr.length - 1 || s.endsWith('.')) {
      t = t.endsWith('.') ? t : t + '.';
    }
    return t;
  }).filter(Boolean);

  const getSentenceStyle = (idx) => {
    if (isReduced) return {};
    return {
      animation: 'sentenceReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      animationDelay: `${750 + idx * 180}ms`,
      transform: 'translateY(100%)',
      opacity: 0,
      display: 'inline-block'
    };
  };

  return (
    <div style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
      
      {/* 1. Hero Section */}
      <section className="section" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '100px 0' }}>
        <div className="container hero-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '64px', alignItems: 'center' }}>
          
          {/* Left Text Column */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px', overflow: 'hidden' }}>
              <span className="hero-label-slide" style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block' }}>
                Koneru Lakshmaiah Education Foundation
              </span>
            </div>
            
            <h1 className="hero-kinetic-title" style={{ fontSize: 'clamp(44px, 7vw, 92px)', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '24px', color: 'var(--secondary)', lineHeight: '1.05' }}>
              <div style={{ overflow: 'hidden' }}>
                <span className="hero-reveal-line-1" style={{ display: 'inline-block' }}>KLU ACM</span>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <span className="hero-reveal-line-2" style={{ display: 'inline-block', fontWeight: '500', color: 'var(--text-muted)' }}>STUDENT CHAPTER</span>
              </div>
            </h1>

            <div style={{ fontSize: 'clamp(18px, 2vw, 22px)', fontWeight: '600', color: 'var(--primary)', marginBottom: '24px', letterSpacing: '-0.01em', lineHeight: '1.3' }}>
              <TextReveal text={heroTitle} duration={900} delay={500} />
            </div>
            
            <p style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '32px', lineHeight: '1.65', maxWidth: '540px' }}>
              {sentences.map((sentence, idx) => (
                <span key={idx} style={{ display: 'inline-block', marginRight: '6px', overflow: 'hidden', verticalAlign: 'bottom' }}>
                  <span style={getSentenceStyle(idx)}>
                    {sentence}
                  </span>
                </span>
              ))}
            </p>
            
            <ScrollReveal delay={1200} duration={700} yOffset={15}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <Link to="/events" className="btn btn-primary btn-sm">
                  Explore Events
                </Link>
                <Link to="/about-klef-acm" style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: '600', textDecoration: 'none', borderBottom: '1px solid var(--border)' }} className="text-hover-line">
                  About the Chapter
                </Link>
              </div>
            </ScrollReveal>
          </div>
          
          {/* Right Image Column */}
          <ScrollReveal delay={200} duration={900} animationType="reveal">
            <div style={parallaxTransform}>
              <div 
                style={{ 
                  width: '100%', 
                  aspectRatio: '16/10',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-main)',
                  backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  textAlign: 'center',
                  color: 'var(--text-muted)'
                }}
              >
                {!heroImageUrl && (
                  <>
                    <ImageIcon size={28} style={{ color: 'var(--primary)', marginBottom: '10px', opacity: 0.6 }} />
                    <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--secondary)' }}>Chapter Activity Media Frame</span>
                    <span style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.8 }}>Placeholder — Upload photograph in CMS</span>
                  </>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Editorial Marquee Divider */}
      <EditorialMarquee />

      {/* 2. About the Chapter Section (Typographic Stats Integration) */}
      <section className="section" style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)', padding: '100px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '64px', alignItems: 'start' }}>
          
          {/* Left Text */}
          <ScrollReveal delay={50} duration={700}>
            <div>
              <EditorialLabel number="01" label="CHAPTER PROFILE" />
              <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', marginBottom: '20px', lineHeight: '1.2' }}>
                <ScrollScaleText>
                  {introHeading}
                </ScrollScaleText>
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.7', maxWidth: '620px', whiteSpace: 'pre-line' }}>
                {introText}
              </p>
            </div>
          </ScrollReveal>
          
          {/* Right Metrics Grid - Only displays if real data exists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {hasStats ? (
              <ScrollReveal delay={100} duration={800}>
                <div>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', paddingBottom: '8px', margin: '0 0 20px 0' }}>
                    Chapter Metrics
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {statsEvents && (
                      <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '16px' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)', lineHeight: '1.1' }}>{statsEvents}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase' }}>Technical Events</div>
                      </div>
                    )}
                    {statsMembers && (
                      <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '16px' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)', lineHeight: '1.1' }}>{statsMembers}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase' }}>Active Members</div>
                      </div>
                    )}
                    {statsWorkshops && (
                      <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '16px' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)', lineHeight: '1.1' }}>{statsWorkshops}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase' }}>Tech Workshops</div>
                      </div>
                    )}
                    {statsProjects && (
                      <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '16px' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)', lineHeight: '1.1' }}>{statsProjects}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase' }}>Research Projects</div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ) : (
              <div style={{ borderLeft: '3px solid var(--border)', paddingLeft: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Chapter coordination metrics will be displayed once updated in CMS.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Community Section */}
      <section className="section" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '100px 0', position: 'relative' }}>
        <OversizedText text="COMMUNITY" speed={0.06} direction="left" />
        <div className="container community-section-grid" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          
          <ScrollReveal delay={0} duration={850}>
            <div>
              <EditorialLabel number="02" label="COMMUNITY INTEGRATION" />
              <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', marginBottom: '20px', lineHeight: '1.2' }}>
                Advancing <WordHighlight>Computing Communities</WordHighlight>
              </h2>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '16px' }}>
                The KLU ACM Student Chapter brings student developers together to share technical knowledge, build systems, and explore foundational questions in computing.
              </p>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                By participating in bootcamps, technical review groups, and open discussions, our members develop direct leadership capabilities and computing competence.
              </p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={150} duration={900} animationType="scale-up" style={{ zIndex: 10 }}>
            <div 
              style={{ 
                width: '100%', 
                aspectRatio: '3/2', 
                backgroundColor: 'var(--bg-main)', 
                backgroundImage: communityImageUrl ? `url(${communityImageUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: '500',
                padding: '16px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {!communityImageUrl && (
                <>
                  <Users size={24} style={{ color: 'var(--primary)', marginBottom: '8px', opacity: 0.6 }} />
                  <span style={{ fontWeight: '600', color: 'var(--secondary)' }}>Chapter Community Photograph</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px' }}>Placeholder (3:2) — Upload in CMS</span>
                </>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. Awards & Recognition Section */}
      <section className="section" style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)', padding: '100px 0', position: 'relative' }}>
        <OversizedText text="RECOGNITION" speed={0.06} direction="right" />
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '64px', alignItems: 'start', position: 'relative', zIndex: 2 }}>
          
          <ScrollReveal delay={0} duration={850}>
            <div>
              <EditorialLabel number="03" label="RECOGNITION" />
              <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', marginBottom: '20px', lineHeight: '1.2' }}>
                <ScrollScaleText>
                  Awards & Achievements
                </ScrollScaleText>
              </h2>
              <div 
                style={{ 
                  width: '100%', 
                  aspectRatio: '4/3', 
                  backgroundColor: '#fff', 
                  backgroundImage: awardsImageUrl ? `url(${awardsImageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  padding: '16px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {!awardsImageUrl && (
                  <>
                    <Award size={24} style={{ color: 'var(--primary)', marginBottom: '8px', opacity: 0.6 }} />
                    <span style={{ fontWeight: '600', color: 'var(--secondary)' }}>Achievements / Trophy Frame</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px' }}>Placeholder (4:3) — Upload in CMS</span>
                  </>
                )}
              </div>
            </div>
          </ScrollReveal>
          
          <div style={{ marginTop: '28px' }}>
            {achievements && achievements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {achievements.map((ach, idx) => (
                  <ScrollReveal key={idx} delay={idx * 150} duration={750}>
                    <div style={{ paddingLeft: '24px', borderLeft: '2px solid var(--primary)', position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-5px',
                        top: '6px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)'
                      }} />
                      <h3 style={{ fontSize: '1rem', color: 'var(--secondary)', fontWeight: '700', marginBottom: '6px', marginTop: 0 }}>{ach.title}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>{ach.description}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: '48px', 
                textAlign: 'center', 
                border: '1px dashed var(--border)', 
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#ffffff',
                color: 'var(--text-muted)',
                fontSize: '0.9rem'
              }}>
                Official awards and academic milestone recognitions will be updated soon.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Editorial Marquee Divider */}
      <EditorialMarquee />

      {/* 5. Research & Innovation Section */}
      <section className="section" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '100px 0', position: 'relative' }}>
        <OversizedText text="RESEARCH" speed={0.06} direction="left" />
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '64px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          
          {/* Left Title & Media Reveal */}
          <div>
            <ScrollReveal delay={0} duration={850}>
              <div>
                <EditorialLabel number="04" label="RESEARCH DEVELOPMENT" />
                <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', marginBottom: '16px', lineHeight: '1.2' }}>
                  Scientific & <WordHighlight>Technical Research</WordHighlight>
                </h2>
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '24px', maxWidth: '600px' }}>
                  Aligning with ACM's role as a scientific computing society, the chapter supports student researchers in learning academic presentation methods and preparing peer-reviewed drafts.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={100} duration={850} animationType="reveal">
              <div 
                style={{ 
                  width: '100%', 
                  maxWidth: '540px',
                  aspectRatio: '16/10', 
                  backgroundColor: 'var(--bg-main)', 
                  backgroundImage: researchImageUrl ? `url(${researchImageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  padding: '16px',
                  textAlign: 'center'
                }}
              >
                {!researchImageUrl && (
                  <>
                    <FileText size={24} style={{ color: 'var(--primary)', marginBottom: '8px', opacity: 0.6 }} />
                    <span style={{ fontWeight: '600', color: 'var(--secondary)' }}>Research / Project Media Frame</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px' }}>Placeholder — Upload in CMS</span>
                  </>
                )}
              </div>
            </ScrollReveal>
          </div>
          
          {/* Right side: Research areas revealing on scroll */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <ScrollReveal delay={150} duration={800} yOffset={20}>
              <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)', transition: 'border-color 0.2s ease' }} className="card-hover-border">
                <strong style={{ display: 'block', color: 'var(--secondary)', marginBottom: '8px', fontSize: '1rem' }}>Systems Computing</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>Distributed systems, compiler architecture, and network routing security experiments.</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300} duration={800} yOffset={20}>
              <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)', transition: 'border-color 0.2s ease' }} className="card-hover-border">
                <strong style={{ display: 'block', color: 'var(--secondary)', marginBottom: '8px', fontSize: '1rem' }}>Data Science</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>Foundational predictive models, computing statistics, and analytics applications.</span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 6. Featured Upcoming Activity Section */}
      {featuredEvent ? (
        <section className="section" style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)', padding: '100px 0', position: 'relative' }}>
          <OversizedText text="ACTIVITIES" speed={0.06} direction="right" />
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <EditorialLabel number="05" label="FEATURED ACTIVITY" />
            <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', marginBottom: '32px' }}>
              <ScrollScaleText>
                Next Chapter Activity
              </ScrollScaleText>
            </h2>
            
            <ScrollReveal delay={0} duration={850}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px', alignItems: 'center' }} className="featured-event-grid">
                <ScrollReveal delay={100} duration={800} animationType="reveal">
                  <div
                    style={{
                      aspectRatio: '16/10',
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-sm)',
                      backgroundImage: featuredEvent.image_url ? `url(${featuredEvent.image_url})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '1px solid var(--border)',
                      minHeight: '240px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    {!featuredEvent.image_url && <span>Event Photograph Placeholder</span>}
                  </div>
                </ScrollReveal>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                    {new Date(featuredEvent.date) >= new Date() ? 'Upcoming Session' : 'Recent Event'}
                  </span>
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '12px', color: 'var(--secondary)' }}>{featuredEvent.title}</h3>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <span>📅 {new Date(featuredEvent.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                    <span>📍 {featuredEvent.venue}</span>
                    {featuredEvent.speaker && <span>🎤 Speaker: {featuredEvent.speaker}</span>}
                  </div>
                  <p style={{ color: 'var(--text-main)', marginBottom: '24px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                    {featuredEvent.description.substring(0, 220)}...
                  </p>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {featuredEvent.registration_link && new Date(featuredEvent.date) >= new Date() && (
                      <a href={featuredEvent.registration_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                        Register Now
                      </a>
                    )}
                    <Link to="/events" className="btn btn-secondary btn-sm">
                      All Events
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      ) : null}

      {/* Editorial Marquee Divider */}
      <EditorialMarquee />

      {/* 7. Recent Highlights / Gallery Teaser */}
      <section className="section" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '100px 0', position: 'relative' }}>
        <OversizedText text="MOMENTS" speed={0.06} direction="left" />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <ScrollReveal delay={0} duration={700}>
              <div>
                <EditorialLabel number="06" label="RECENT ARCHIVE" />
                <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', margin: 0 }}>
                  Recent <WordHighlight>Moments</WordHighlight>
                </h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100} duration={700}>
              <Link to="/gallery" style={{ color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', textDecoration: 'none' }} className="text-hover-arrow">
                View Gallery <ArrowRight size={14} className="arrow-icon" style={{ transition: 'transform 0.2s ease' }} />
              </Link>
            </ScrollReveal>
          </div>

          {galleryTeaser.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px', backgroundColor: 'var(--bg-main)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Highlights will populate once pictures are uploaded to the CMS.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {galleryTeaser.map((img, idx) => (
                <ScrollReveal key={img.id} delay={idx * 100} duration={750} animationType="scale-up">
                  <div
                    style={{
                      aspectRatio: '4/3',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-main)'
                    }}
                    className="image-reveal-wrapper"
                  >
                    <img
                      src={img.url}
                      alt={img.caption || 'KLU ACM highlight'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      className="zoom-image"
                    />
                    {img.caption && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(15,23,42,0.85)',
                          color: '#fff',
                          padding: '8px',
                          fontSize: '0.75rem',
                          textAlign: 'center',
                        }}
                      >
                        {img.caption}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 8. Call To Action (Institutional Banner) */}
      <section className="section" style={{ backgroundColor: 'var(--bg-main)', padding: '100px 0' }}>
        <ScrollReveal delay={0} duration={850} yOffset={25}>
          <div 
            className="container" 
            style={{ 
              maxWidth: '900px', 
              textAlign: 'center',
              border: '1px solid var(--border)',
              padding: '48px 24px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#ffffff'
            }}
          >
            <h2 style={{ fontSize: '2rem', color: 'var(--secondary)', marginBottom: '12px' }}>
              Advancing Computing as a Science & Profession
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '28px', maxWidth: '600px', margin: '0 auto 28px auto' }}>
              Join the global computing community. Access research journals, network with student developers, and participate in national hackathons.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link to="/events" className="btn btn-primary">
                Explore Events
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                Contact Chapter
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Inject styling locally for responsive grid, visual container, and hover reveals */}
      <style>{`
        @media (max-width: 900px) {
          .hero-layout {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .featured-event-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        /* Premium hover transitions */
        .text-hover-line {
          position: relative;
        }
        .text-hover-line::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: var(--secondary);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .text-hover-line:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .text-hover-arrow:hover .arrow-icon {
          transform: translateX(4px);
        }

        .card-hover-border:hover {
          border-color: var(--primary) !important;
        }

        .image-reveal-wrapper:hover .zoom-image {
          transform: scale(1.03);
        }

        @keyframes sentenceReveal {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
