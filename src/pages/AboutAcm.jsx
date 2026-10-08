import { useContext, useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SiteDataContext } from '../App';
import { ScrollReveal, SplitText } from '../components/ScrollReveal';
import VisualEditable from '../components/VisualEditor/VisualEditable';
import PageBlockList from '../components/VisualEditor/PageBlockList';

export default function AboutAcm() {
  const { siteData } = useContext(SiteDataContext);
  const pageData = siteData?.pages?.['about-acm']?.content || {};

  const getString = (val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      if (val.heading && val.text) return `${val.heading}: ${val.text}`;
      return val.text || val.heading || val.description || val.value || fallback;
    }
    return String(val);
  };

  // Factual, authoritative summaries of ACM's global operations
  const introduction = getString(pageData.introduction, "The Association for Computing Machinery (ACM) is the world's largest educational and scientific computing society, delivering resources that advance computing as a science and a profession.");
  const whatAcmIs = getString(pageData.what_acm_is, "ACM is a global society of over 100,000 computing professionals, researchers, and educators. It serves as the primary gateway to computer science research and professional practice, providing opportunities for professional development, networking, and curricular design guidelines.");
  const purpose = getString(pageData.purpose, "ACM's purpose is to advance computing as a science and a profession, promoting the highest standards and technical excellence. The society collectively advocates for ethical computing, the dissemination of cutting-edge research, and computing educational guidelines globally.");
  const community = getString(pageData.community, "ACM brings together a diverse community of practitioners, educators, researchers, and students. By hosting active Special Interest Groups, chapters, and digital forums, ACM promotes collaboration and technical sharing across all domains of the computing profession.");
  const publications = getString(pageData.publications, "ACM publishes prestigious journals, magazines, and technical newsletters. These peer-reviewed publications represent the foundational record of computer science progress, covering domains from compiler design to artificial intelligence.");
  const digitalLibrary = getString(pageData.digital_library, "The ACM Digital Library is a comprehensive database containing bibliographic literature, research papers, and technical proceedings. It is the premier research repository in computer science, used worldwide by academic and corporate institutions.");
  const conferences = getString(pageData.conferences, "ACM Special Interest Groups (SIGs) organize and sponsor over 170 international conferences and workshops annually. These events are the foremost venues for presenting breakthrough technologies and networking with senior researchers.");
  const awards = getString(pageData.awards, "ACM honors technical achievement and service through a comprehensive awards program. Most notably, the ACM A.M. Turing Award—widely considered the 'Nobel Prize of Computing'—recognizes contributions of lasting technical importance.");
  const chapters = getString(pageData.chapters, "ACM chapters serve as local hubs for members and the computing community. Professional Chapters provide networking for practitioners, while Student Chapters establish active computing environments in academic institutions.");
  const studentChapters = getString(pageData.student_chapters, "ACM Student Chapters support students through workshops, hackathons, guest lectures, and networking. They encourage leadership development, collaborative engineering projects, and direct engagement with professional ACM structures.");
  const ethics = getString(pageData.ethics, "ACM members and chapters operate under the ACM Code of Ethics and Professional Conduct. The Code outlines guidelines for computing practitioners to respect privacy, avoid harm, design for accessibility, and uphold professional integrity.");
  const acmW = getString(pageData.acm_w, "ACM-W supports and advocates for the full engagement of women in computing globally. Through scholarships, local celebrations, and student chapters, ACM-W works to improve recruitment, retention, and mentoring of women in the computing community.");
  const acmIndia = getString(pageData.acm_india, "ACM India promotes computing activities, academic collaborations, and research initiatives within the country. It assists Indian student and professional chapters in establishing high-quality workshops, networking, and career forums.");

  // Parse official links
  const defaultLinks = [
    { label: "ACM Official Website", url: "https://www.acm.org" },
    { label: "ACM About Section", url: "https://www.acm.org/about-acm/about-the-association-for-computing-machinery" },
    { label: "ACM Digital Library", url: "https://dl.acm.org" },
    { label: "ACM Chapters Directory", url: "https://www.acm.org/chapters" },
    { label: "ACM Membership", url: "https://www.acm.org/membership" },
    { label: "ACM Code of Ethics", url: "https://www.acm.org/code-of-ethics" },
    { label: "ACM-W", url: "https://women.acm.org" },
    { label: "ACM India", url: "https://india.acm.org" }
  ];

  const officialLinks = pageData.official_links 
    ? pageData.official_links.split('\n').map(line => {
        const parts = line.split('|');
        if (parts.length >= 2) {
          return { label: parts[0].trim(), url: parts[1].trim() };
        }
        return null;
      }).filter(Boolean)
    : defaultLinks;

  const sections = [
    { id: 'what-is-acm', title: 'What is ACM?', line1: 'What is', line2: 'ACM?', content: whatAcmIs },
    { id: 'purpose', title: "ACM's Mission", line1: "ACM's", line2: 'Mission', content: purpose },
    { id: 'community', title: 'ACM & Computing Community', line1: 'ACM & Computing', line2: 'Community', content: community },
    { id: 'publications', title: 'ACM Publications', line1: 'ACM', line2: 'Publications', content: publications },
    { id: 'digital-library', title: 'ACM Digital Library', line1: 'ACM Digital', line2: 'Library', content: digitalLibrary, link: 'https://dl.acm.org' },
    { id: 'conferences', title: 'ACM Conferences', line1: 'ACM', line2: 'Conferences', content: conferences },
    { id: 'awards', title: 'ACM Awards (Turing Award)', line1: 'ACM Awards', line2: '(Turing Award)', content: awards },
    { id: 'chapters', title: 'ACM Chapters', line1: 'ACM', line2: 'Chapters', content: chapters },
    { id: 'student-chapters', title: 'ACM Student Chapters', line1: 'ACM Student', line2: 'Chapters', content: studentChapters },
    { id: 'ethics', title: 'ACM Code of Ethics', line1: 'ACM Code of', line2: 'Ethics', content: ethics, link: 'https://www.acm.org/code-of-ethics' },
    { id: 'acm-w', title: 'ACM-W', line1: 'About', line2: 'ACM-W', content: acmW, link: 'https://women.acm.org' },
    { id: 'acm-india', title: 'ACM in India', line1: 'ACM in', line2: 'India', content: acmIndia, link: 'https://india.acm.org' },
  ];

  const [activeSection, setActiveSection] = useState('what-is-acm');

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-25% 0px -55% 0px',
      threshold: 0.05
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach(sec => {
        const el = document.getElementById(sec.id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const handleAnchorClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 90; // account for header offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div style={{ backgroundColor: 'transparent', minHeight: '80vh', paddingBottom: '88px' }}>
      {/* Page Title Header */}
      <section className="page-hero bg-mesh">
        <div className="orb orb-red" />
        <div className="orb orb-blue" />
        <div className="container">
          <VisualEditable
            name="page_tag"
            as="span"
            defaultValue="Parent Organization"
            className="editorial-kicker"
          />
          <VisualEditable
            name="page_title"
            as="h1"
            defaultValue="Association for Computing Machinery"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800', color: 'var(--navy-900)', letterSpacing: '0', marginBottom: '16px', maxWidth: '720px' }}
          />
          <VisualEditable
            name="introduction"
            as="p"
            defaultValue={introduction}
            style={{ color: 'var(--slate-600)', fontSize: '1.05rem', lineHeight: '1.7', maxWidth: '680px', margin: 0 }}
          />
        </div>
      </section>

      {/* Mobile Anchor Navigation */}
      <div className="mobile-nav-tags-container" style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--card)', position: 'sticky', top: 'var(--header-height)', zIndex: 90 }}>
        <div className="container" style={{ overflowX: 'auto', whiteSpace: 'nowrap', padding: '12px 24px', display: 'flex', gap: '8px', scrollbarWidth: 'none' }}>
          {sections.map(sec => (
            <a 
              key={sec.id}
              href={`#${sec.id}`}
              onClick={(e) => handleAnchorClick(e, sec.id)}
              style={{ 
                fontSize: '0.78rem', 
                fontWeight: '600', 
                color: activeSection === sec.id ? 'var(--primary)' : 'var(--slate-600)', 
                border: '1px solid var(--border-light)', 
                borderColor: activeSection === sec.id ? 'var(--primary)' : 'var(--border-light)',
                padding: '6px 14px', 
                borderRadius: '2px', 
                textDecoration: 'none', 
                backgroundColor: activeSection === sec.id ? 'var(--primary-light)' : '#FFFFFF', 
                display: 'inline-block' 
              }}
              className="mobile-tag-link"
            >
              {sec.title}
            </a>
          ))}
        </div>
      </div>

      {/* Two Column Layout Grid */}
      <section className="section" style={{ padding: '56px 0' }}>
        <div className="container about-acm-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '64px', alignItems: 'start' }}>
          
          {/* Left Column: Documentation Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {sections.map((sec, idx) => (
              <ScrollReveal key={sec.id} delay={0} duration={600} yOffset={20}>
                <div 
                  id={sec.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-light)', 
                    paddingBottom: '36px',
                    scrollMarginTop: '110px'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--primary)', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                    0{idx + 1} //
                  </span>
                  <h2 style={{ fontSize: 'clamp(24px, 3.2vw, 36px)', color: 'var(--navy-900)', marginBottom: '14px', letterSpacing: '0', fontWeight: '800', lineHeight: '1.2' }}>
                    <SplitText line1={sec.line1} line2={sec.line2} delay={50} />
                  </h2>
                  <VisualEditable
                    name={sec.id}
                    as="p"
                    defaultValue={sec.content}
                    style={{ color: 'var(--slate-600)', fontSize: '1rem', lineHeight: '1.8', margin: 0 }}
                  />
                  {sec.link && (
                    <a 
                      href={sec.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.86rem', color: 'var(--primary)', fontWeight: '700', marginTop: '16px', textDecoration: 'none' }}
                      className="text-hover-line"
                    >
                      Official Reference <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </ScrollReveal>
            ))}

            {/* Free-Form Content Blocks */}
            <PageBlockList blockKey="about_acm_blocks" style={{ marginTop: '32px' }} />
          </div>

          {/* Right Column: Sticky Sidebar Contents */}
          <div className="desktop-sidebar" style={{ position: 'sticky', top: '110px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Table of Contents anchors */}
            <div style={{ border: '1px solid var(--border-light)', padding: '28px', borderRadius: '4px', backgroundColor: 'var(--card)' }}>
              <h3 style={{ fontSize: '0.78rem', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', marginBottom: '16px', marginTop: 0 }}>
                Table of Contents
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sections.map(sec => (
                  <li key={sec.id}>
                    <a 
                      href={`#${sec.id}`}
                      onClick={(e) => handleAnchorClick(e, sec.id)}
                      style={{ 
                        fontSize: '0.86rem', 
                        color: activeSection === sec.id ? 'var(--primary)' : 'var(--navy-700)', 
                        textDecoration: 'none', 
                        fontWeight: activeSection === sec.id ? '700' : '500', 
                        display: 'flex',
                        alignItems: 'center',
                        gap: activeSection === sec.id ? '8px' : '0px',
                        transform: activeSection === sec.id ? 'translateX(4px)' : 'translateX(0)',
                        transition: 'all 0.2s ease' 
                      }}
                      className="sidebar-anchor-link"
                    >
                      {activeSection === sec.id && (
                        <span style={{ 
                          width: '8px', 
                          height: '2px', 
                          backgroundColor: 'var(--primary)', 
                          display: 'inline-block' 
                        }} />
                      )}
                      {sec.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Official Explore Links */}
            <div style={{ border: '1px solid var(--border-light)', padding: '28px', borderRadius: '4px', backgroundColor: 'var(--card)' }}>
              <h3 style={{ fontSize: '0.78rem', color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px', marginBottom: '16px', marginTop: 0 }}>
                Explore ACM
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {officialLinks.map((link, idx) => (
                  <li key={idx}>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        fontSize: '0.88rem', 
                        color: 'var(--primary)', 
                        textDecoration: 'none', 
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px' 
                      }}
                      className="text-hover-line"
                    >
                      {link.label} <ArrowUpRight size={14} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Style extensions */}
      <style>{`
        .mobile-nav-tags-container {
          display: none;
        }
        
        .sidebar-anchor-link:hover {
          color: var(--primary) !important;
        }

        .mobile-tag-link:hover {
          background-color: var(--primary-light) !important;
          border-color: var(--primary) !important;
          color: var(--primary) !important;
        }

        @media (max-width: 900px) {
          .about-acm-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-nav-tags-container {
            display: block !important;
          }
        }
        
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
          background-color: var(--primary);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .text-hover-line:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }
      `}</style>
    </div>
  );
}
