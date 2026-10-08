import { useContext } from 'react';
import { SiteDataContext } from '../App';
import { ScrollReveal, TextReveal, SplitText } from '../components/ScrollReveal';
import VisualEditable from '../components/VisualEditor/VisualEditable';
import PageBlockList from '../components/VisualEditor/PageBlockList';
import { Code, Terminal, Cpu, Shield, Users, Trophy, BookOpen, Lightbulb } from 'lucide-react';

export default function AboutKlefAcm() {
  const { siteData } = useContext(SiteDataContext);
  const pageData = siteData?.pages?.['about-klef-acm']?.content || {};

  const getString = (val, fallback = '') => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      if (val.heading && val.text) return `${val.heading}: ${val.text}`;
      return val.text || val.heading || val.description || val.value || fallback;
    }
    return String(val);
  };

  // Factual defaults for the university chapter
  const introduction = getString(pageData.introduction, 'KLEF ACM is the official student chapter of the Association for Computing Machinery at Koneru Lakshmaiah Education Foundation (Deemed to be University), operating under the Department of Computer Science & Engineering. The chapter empowers students to master cutting-edge technologies, build impactful software, and lead the future of computer science.');
  const purpose = getString(pageData.purpose, 'The chapter creates direct pathways for student developers to learn computer science principles, explore emerging tech domains, collaborate on software codebases, develop technical leadership, and connect with peer engineers and industry veterans.');
  const community = getString(pageData.community, 'Our chapter acts as an engineering hub for Computer Science & Engineering students. We cultivate student mentorship, open peer learning groups, collaborative development circles, and community hackathons.');
  const technicalGrowth = getString(pageData.technical_growth, 'Through hands-on project labs, competitive programming events, open-source sprints, and developer bootcamps, the chapter helps students prepare for modern engineering challenges and global coding competitions.');
  const leadership = getString(pageData.leadership, 'The student-led executive committee organizes, coordinates, and executes all chapter activities, providing students with direct project management, communication, and technical leadership experience.');
  const facultySupport = getString(pageData.faculty_support, '');
  const vision = getString(pageData.vision, 'To foster a culture of technical curiosity, system engineering expertise, and computing research that builds the next generation of software engineers, researchers, and technology leaders.');
  const mission = getString(pageData.mission, 'To host world-class technical workshops, collaborative labs, competitive coding tournaments, and industry seminars that build computing expertise while upholding the highest ACM professional standards.');
  const achievements = getString(pageData.achievements, '');
  const research = getString(pageData.research, '');

  const activities = Array.isArray(pageData.activities) && pageData.activities.length > 0
    ? pageData.activities
    : [
        'National Level Coding Competitions',
        'Distinguished Speaker Tech Talks & Panel Discussions',
        'Full-Stack Web & Cloud Architecture Workshops',
        'Machine Learning & Artificial Intelligence Seminars',
        'Cybersecurity & Capture The Flag (CTF) Challenges',
        'Open Source Contribution Sprints & Project Showcases',
        'Industry Expert Webinars & Alumni Tech Talks',
        'Peer Mentorship & Code Review Circles'
      ];

  const sigs = [
    {
      icon: Terminal,
      title: 'SIG-CP (Competitive Programming)',
      desc: 'Focuses on advanced data structures, algorithmic paradigms, time complexity optimization, and training for ICPC and international coding competitions.'
    },
    {
      icon: Code,
      title: 'SIG-DEV (Software & Cloud)',
      desc: 'Dedicated to modern full-stack development, cloud-native deployments, distributed architectures, microservices, and collaborative Git workflows.'
    },
    {
      icon: Cpu,
      title: 'SIG-AI (Data & Intelligence)',
      desc: 'Explores machine learning pipelines, deep learning models, natural language processing, computer vision, and responsible AI practices.'
    },
    {
      icon: Shield,
      title: 'SIG-SEC (Cybersecurity)',
      desc: 'Conducts hands-on penetration testing labs, vulnerability assessments, cryptography analysis, and Capture The Flag (CTF) competitions.'
    }
  ];

  return (
    <div style={{ backgroundColor: 'transparent', minHeight: '80vh', paddingBottom: '88px' }}>
      {/* Page Title Header */}
      <section className="page-hero bg-mesh">
        <div className="orb orb-red" />
        <div className="orb orb-blue" />
        <div className="container">
          <span className="editorial-kicker">
            University Chapter Profile
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800', color: 'var(--navy-900)', letterSpacing: '0', marginBottom: '16px' }}>
            <TextReveal text="KLEF ACM Student Chapter" duration={900} />
          </h1>
          <VisualEditable
            name="introduction"
            as="p"
            defaultValue={introduction}
            style={{ color: 'var(--slate-600)', fontSize: '1.05rem', lineHeight: '1.75', maxWidth: '820px', margin: 0 }}
          />
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="section" style={{ padding: '64px 0' }}>
        <div className="container" style={{ maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: '56px' }}>
          
          {/* Section: Purpose */}
          <ScrollReveal delay={0} duration={600}>
            <div>
              <div className="editorial-kicker">Founding Directive</div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '14px', lineHeight: '1.2' }}>
                <SplitText line1="Our" line2="Purpose" delay={50} />
              </h2>
              <VisualEditable
                name="purpose"
                as="p"
                defaultValue={purpose}
                style={{ color: 'var(--navy-700)', fontSize: '1.02rem', lineHeight: '1.8', margin: 0 }}
              />
            </div>
          </ScrollReveal>

          {/* Section: Special Interest Groups (SIGs) */}
          <ScrollReveal delay={50} duration={650}>
            <div>
              <div className="editorial-kicker">Specialized Technical Domains</div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '24px', lineHeight: '1.2' }}>
                <SplitText line1="Special Interest" line2="Groups (SIGs)" delay={100} />
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="sig-grid">
                {sigs.map((sig, idx) => {
                  const Icon = sig.icon;
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        backgroundColor: '#FFFFFF', 
                        padding: '24px', 
                        borderRadius: '4px', 
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '4px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                          <Icon size={18} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--navy-900)', margin: 0 }}>
                          {sig.title}
                        </h3>
                      </div>
                      <p style={{ color: 'var(--slate-600)', fontSize: '0.88rem', lineHeight: '1.65', margin: 0 }}>
                        {sig.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>

          {/* Section: What We Do (Activities Grid) */}
          <ScrollReveal delay={100} duration={650}>
            <div>
              <div className="editorial-kicker">Technical Calendar & Operations</div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '14px', lineHeight: '1.2' }}>
                <SplitText line1="What We" line2="Do" delay={150} />
              </h2>
              <p style={{ color: 'var(--slate-600)', fontSize: '1rem', lineHeight: '1.65', marginBottom: '24px' }}>
                Flagship events, workshops, competitive challenges, and technical initiatives engineered and executed by KLEF ACM:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px' }} className="activities-list-grid">
                {activities.map((act, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: 'flex', 
                      gap: '14px', 
                      alignItems: 'center', 
                      fontSize: '0.92rem', 
                      fontWeight: '700',
                      padding: '16px 20px', 
                      backgroundColor: '#FFFFFF', 
                      borderRadius: '4px', 
                      border: '1px solid var(--border-light)',
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    <div style={{ width: '28px', height: '28px', borderRadius: '2px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>0{idx + 1}</span>
                    </div>
                    <span style={{ color: 'var(--navy-900)', lineHeight: '1.4' }}>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Grid for Community, Growth, and Leadership */}
          <ScrollReveal delay={150} duration={700}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', padding: '40px 0' }} className="chapter-facets-grid">
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', fontWeight: '800', marginBottom: '12px', lineHeight: '1.2' }}>
                  <SplitText line1="Student" line2="Community" delay={100} />
                </h3>
                <VisualEditable
                  name="community"
                  as="p"
                  defaultValue={community}
                  style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: '1.65', margin: 0 }}
                />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', fontWeight: '800', marginBottom: '12px', lineHeight: '1.2' }}>
                  <SplitText line1="Technical" line2="Growth" delay={200} />
                </h3>
                <VisualEditable
                  name="technical_growth"
                  as="p"
                  defaultValue={technicalGrowth}
                  style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: '1.65', margin: 0 }}
                />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', fontWeight: '800', marginBottom: '12px', lineHeight: '1.2' }}>
                  <SplitText line1="Executive" line2="Leadership" delay={300} />
                </h3>
                <VisualEditable
                  name="leadership"
                  as="p"
                  defaultValue={leadership}
                  style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: '1.65', margin: 0 }}
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Section: Vision & Mission */}
          <ScrollReveal delay={100} duration={700}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }} className="vision-mission-grid">
              <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', fontWeight: '800', marginBottom: '12px', marginTop: 0, lineHeight: '1.2' }}>
                  <SplitText line1="Our" line2="Vision" delay={100} />
                </h3>
                <VisualEditable
                  name="vision"
                  as="p"
                  defaultValue={vision}
                  style={{ color: 'var(--slate-600)', fontSize: '0.92rem', lineHeight: '1.7', margin: 0 }}
                />
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', fontWeight: '800', marginBottom: '12px', marginTop: 0, lineHeight: '1.2' }}>
                  <SplitText line1="Our" line2="Mission" delay={200} />
                </h3>
                <VisualEditable
                  name="mission"
                  as="p"
                  defaultValue={mission}
                  style={{ color: 'var(--slate-600)', fontSize: '0.92rem', lineHeight: '1.7', margin: 0 }}
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Section: Faculty Coordinator Information */}
          {facultySupport && (
            <ScrollReveal delay={150} duration={750}>
              <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '20px', backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '0 4px 4px 0', border: '1px solid var(--border-light)', borderLeftColor: 'var(--primary)' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', fontWeight: '800', marginBottom: '10px', marginTop: 0, lineHeight: '1.2' }}>
                  <SplitText line1="Faculty" line2="Support" delay={100} />
                </h3>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                  {facultySupport}
                </p>
              </div>
            </ScrollReveal>
          )}

          {/* Section: Achievements & Research */}
          {(achievements || research) && (
            <ScrollReveal delay={200} duration={750}>
              <div style={{ display: 'grid', gridTemplateColumns: achievements && research ? '1fr 1fr' : '1fr', gap: '32px' }} className="extra-info-grid">
                {achievements && (
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', fontWeight: '800', marginBottom: '12px', marginTop: 0, lineHeight: '1.2' }}>
                      <SplitText line1="Chapter" line2="Achievements" delay={100} />
                    </h3>
                    <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>{achievements}</p>
                  </div>
                )}
                {research && (
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', fontWeight: '800', marginBottom: '12px', marginTop: 0, lineHeight: '1.2' }}>
                      <SplitText line1="Computing" line2="Research" delay={200} />
                    </h3>
                    <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', lineHeight: '1.65', margin: 0 }}>{research}</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}

          {/* Dynamic Custom Blocks */}
          {Array.isArray(pageData.custom_blocks) && pageData.custom_blocks.map((block, idx) => (
            <ScrollReveal key={block.id || idx} delay={150} duration={700}>
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '36px' }}>
                {block.subtitle && (
                  <span className="editorial-kicker">
                    {block.subtitle}
                  </span>
                )}
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '14px', lineHeight: '1.2' }}>
                  {block.title}
                </h2>
                <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0 }}>
                  {block.text}
                </p>
                {block.image_url && (
                  <div style={{ marginTop: '20px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-light)', maxWidth: '600px' }}>
                    <img src={block.image_url} alt={block.title} style={{ width: '100%', height: 'auto', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>
            </ScrollReveal>
          ))}

          {/* Free-Form Dynamic Content Blocks */}
          <PageBlockList blockKey="about_klef_blocks" style={{ marginTop: '36px' }} />

        </div>
      </section>

      {/* Media Queries */}
      <style>{`
        @media (max-width: 768px) {
          .sig-grid {
            grid-template-columns: 1fr !important;
          }
          .activities-list-grid {
            grid-template-columns: 1fr !important;
          }
          .chapter-facets-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .vision-mission-grid {
            grid-template-columns: 1fr !important;
          }
          .extra-info-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
