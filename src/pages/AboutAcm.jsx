import { useContext, useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SiteDataContext } from '../App';
import { ScrollReveal, TextReveal, SplitText } from '../components/ScrollReveal';

export default function AboutAcm() {
  const { siteData } = useContext(SiteDataContext);
  const pageData = siteData?.pages?.['about-acm']?.content || {};

  // Factual, authoritative summaries of ACM's global operations
  const introduction = pageData.introduction || "The Association for Computing Machinery (ACM) is the world's largest educational and scientific computing society, delivering resources that advance computing as a science and a profession.";
  const whatAcmIs = pageData.what_acm_is || "ACM is a global society of over 100,000 computing professionals, researchers, and educators. It serves as the primary gateway to computer science research and professional practice, providing opportunities for professional development, networking, and curricular design guidelines.";
  const purpose = pageData.purpose || "ACM's purpose is to advance computing as a science and a profession, promoting the highest standards and technical excellence. The society collectively advocates for ethical computing, the dissemination of cutting-edge research, and computing educational guidelines globally.";
  const community = pageData.community || "ACM brings together a diverse community of practitioners, educators, researchers, and students. By hosting active Special Interest Groups, chapters, and digital forums, ACM promotes collaboration and technical sharing across all domains of the computing profession.";
  const publications = pageData.publications || "ACM publishes prestigious journals, magazines, and technical newsletters. These peer-reviewed publications represent the foundational record of computer science progress, covering domains from compiler design to artificial intelligence.";
  const digitalLibrary = pageData.digital_library || "The ACM Digital Library is a comprehensive database containing bibliographic literature, research papers, and technical proceedings. It is the premier research repository in computer science, used worldwide by academic and corporate institutions.";
  const conferences = pageData.conferences || "ACM Special Interest Groups (SIGs) organize and sponsor over 170 international conferences and workshops annually. These events are the foremost venues for presenting breakthrough technologies and networking with senior researchers.";
  const awards = pageData.awards || "ACM honors technical achievement and service through a comprehensive awards program. Most notably, the ACM A.M. Turing Award—widely considered the 'Nobel Prize of Computing'—recognizes contributions of lasting technical importance.";
  const chapters = pageData.chapters || "ACM chapters serve as local hubs for members and the computing community. Professional Chapters provide networking for practitioners, while Student Chapters establish active computing environments in academic institutions.";
  const studentChapters = pageData.student_chapters || "ACM Student Chapters support students through workshops, hackathons, guest lectures, and networking. They encourage leadership development, collaborative engineering projects, and direct engagement with professional ACM structures.";
  const ethics = pageData.ethics || "ACM members and chapters operate under the ACM Code of Ethics and Professional Conduct. The Code outlines guidelines for computing practitioners to respect privacy, avoid harm, design for accessibility, and uphold professional integrity.";
  const acmW = pageData.acm_w || "ACM-W supports and advocates for the full engagement of women in computing globally. Through scholarships, local celebrations, and student chapters, ACM-W works to improve recruitment, retention, and mentoring of women in the computing community.";
  const acmIndia = pageData.acm_india || "ACM India promotes computing activities, academic collaborations, and research initiatives within the country. It assists Indian student and professional chapters in establishing high-quality workshops, networking, and career forums.";

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
    <div style={{ backgroundColor: '#ffffff', minHeight: '80vh', paddingBottom: '100px' }}>
      
      {/* Page Title Header */}
      <section style={{ backgroundColor: 'var(--bg-main)', padding: '64px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
            Parent Organization
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--secondary)', letterSpacing: '-0.02em', marginBottom: '16px', maxWidth: '650px' }}>
            <TextReveal text="Association for Computing Machinery" duration={900} />
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px', margin: 0 }}>
            {introduction}
          </p>
        </div>
      </section>

      {/* Mobile Anchor Navigation (Horizontal Tags) */}
      <div className="mobile-nav-tags-container" style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#ffffff', position: 'sticky', top: 'var(--header-height)', zIndex: 90 }}>
        <div className="container" style={{ overflowX: 'auto', whiteSpace: 'nowrap', padding: '12px 24px', display: 'flex', gap: '8px', scrollbarWidth: 'none' }}>
          {sections.map(sec => (
            <a 
              key={sec.id}
              href={`#${sec.id}`}
              onClick={(e) => handleAnchorClick(e, sec.id)}
              style={{ 
                fontSize: '0.75rem', 
                fontWeight: '600', 
                color: activeSection === sec.id ? 'var(--primary)' : 'var(--text-muted)', 
                border: '1px solid var(--border)', 
                borderColor: activeSection === sec.id ? 'var(--primary)' : 'var(--border)',
                padding: '6px 12px', 
                borderRadius: 'var(--radius-sm)', 
                textDecoration: 'none', 
                backgroundColor: activeSection === sec.id ? 'var(--primary-light)' : 'var(--bg-main)', 
                display: 'inline-block' 
              }}
              className="mobile-tag-link"
            >
              {sec.title}
            </a>
          ))}
        </div>
      </div>

      {/* Two Column Grid */}
      <section className="section" style={{ padding: '48px 0' }}>
        <div className="container about-acm-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '64px', alignItems: 'start' }}>
          
          {/* Left Column: Documentation Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {sections.map((sec, idx) => (
              <ScrollReveal key={sec.id} delay={0} duration={750} yOffset={25}>
                <div 
                  id={sec.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border)', 
                    paddingBottom: '32px',
                    scrollMarginTop: '120px' // fallback scroll boundary
                  }}
                >
                  <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 42px)', color: 'var(--secondary)', marginBottom: '16px', letterSpacing: '-0.03em', fontWeight: '800', lineHeight: '1.1' }}>
                    <SplitText line1={sec.line1} line2={sec.line2} delay={50} />
                  </h2>
                  <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.75', margin: 0 }}>
                    {sec.content}
                  </p>
                  {sec.link && (
                    <a 
                      href={sec.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', marginTop: '12px', textDecoration: 'none' }}
                      className="text-hover-line"
                    >
                      Official Reference <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Right Column: Sticky Sidebar Contents */}
          <div className="desktop-sidebar" style={{ position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Table of Contents anchors */}
            <div style={{ border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)' }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', marginTop: 0 }}>
                Table of Contents
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sections.map(sec => (
                  <li key={sec.id}>
                    <a 
                      href={`#${sec.id}`}
                      onClick={(e) => handleAnchorClick(e, sec.id)}
                      style={{ 
                        fontSize: '0.85rem', 
                        color: activeSection === sec.id ? 'var(--primary)' : 'var(--text-main)', 
                        textDecoration: 'none', 
                        fontWeight: '500', 
                        display: 'flex',
                        alignItems: 'center',
                        gap: activeSection === sec.id ? '8px' : '0px',
                        transform: activeSection === sec.id ? 'translateX(4px)' : 'translateX(0)',
                        transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)' 
                      }}
                      className="sidebar-anchor-link"
                    >
                      {activeSection === sec.id && (
                        <span style={{ 
                          width: '10px', 
                          height: '1.5px', 
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
            <div style={{ border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)' }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', marginTop: 0 }}>
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
                        fontSize: '0.9rem', 
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
