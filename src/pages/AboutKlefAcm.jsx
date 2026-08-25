import { useContext } from 'react';
import { SiteDataContext } from '../App';
import { ScrollReveal, TextReveal } from '../components/ScrollReveal';

export default function AboutKlefAcm() {
  const { siteData } = useContext(SiteDataContext);
  const pageData = siteData?.pages?.['about-klef-acm']?.content || {};

  // Factual defaults for the university chapter
  const introduction = pageData.introduction || 'KLU ACM is the student chapter associated with the Association for Computing Machinery at Koneru Lakshmaiah Education Foundation (Deemed to be University).';
  const purpose = pageData.purpose || 'The chapter creates direct pathways for student developers to learn computer science principles, explore emerging tech domains, collaborate on software codebases, develop technical leadership, and connect with peer engineers.';
  const community = pageData.community || 'Our chapter acts as an engineering hub for Computer Science & Engineering students. We cultivate student mentorship, open peer learning groups, and community hackathons.';
  const technicalGrowth = pageData.technical_growth || 'Through hands-on project labs, competitive programming events, and developer bootcamps, the chapter helps students prepare for modern engineering challenges.';
  const leadership = pageData.leadership || 'The student-led committee organizes, coordinates, and executes all chapter activities, providing students with leadership and coordination skills.';
  const facultySupport = pageData.faculty_support || '';
  const vision = pageData.vision || 'To foster a culture of technical curiosity, system engineering expertise, and computing research that builds the next generation of technology leaders.';
  const mission = pageData.mission || 'To host technical workshops, collaborative labs, and industry seminars that build computing expertise while adhering to ACM professional standards.';
  const achievements = pageData.achievements || '';
  const research = pageData.research || '';

  const activities = Array.isArray(pageData.activities)
    ? pageData.activities
    : ['Technical workshops', 'Competitive programming sessions', 'Student project showcases'];

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '80vh', paddingBottom: '80px' }}>
      {/* Page Title Header */}
      <section style={{ backgroundColor: 'var(--bg-main)', padding: '64px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
            University Chapter Profile
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--secondary)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
            <TextReveal text="KLEF ACM Student Chapter (KLU ACM)" duration={900} />
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '700px', margin: 0 }}>
            {introduction}
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="section" style={{ padding: '64px 0' }}>
        <div className="container" style={{ maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
          
          {/* Section: Purpose */}
          <ScrollReveal delay={0} duration={700}>
            <div>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', marginBottom: '16px', lineHeight: '1.1' }}>
                <SplitText line1="Our" line2="Purpose" delay={50} />
              </h2>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.7', margin: 0 }}>
                {purpose}
              </p>
            </div>
          </ScrollReveal>

          {/* Section: What We Do (Dynamic Activities List) */}
          <ScrollReveal delay={100} duration={750}>
            <div>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', marginBottom: '16px', lineHeight: '1.1' }}>
                <SplitText line1="What We" line2="Do" delay={150} />
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                Activities designed and executed by the student chapter:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="activities-list-grid">
                {activities.map((act, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>▪</span>
                    <span style={{ color: 'var(--text-main)', lineHeight: '1.5' }}>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Grid for Community, Growth, and Leadership */}
          <ScrollReveal delay={150} duration={800}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '32px 0' }} className="chapter-facets-grid">
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '12px', lineHeight: '1.1' }}>
                  <SplitText line1="Student" line2="Community" delay={100} />
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>{community}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '12px', lineHeight: '1.1' }}>
                  <SplitText line1="Technical" line2="Growth" delay={200} />
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>{technicalGrowth}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '12px', lineHeight: '1.1' }}>
                  <SplitText line1="Executive" line2="Leadership" delay={300} />
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>{leadership}</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Section: Vision & Mission */}
          <ScrollReveal delay={100} duration={800}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className="vision-mission-grid">
              <div style={{ backgroundColor: 'var(--bg-main)', padding: '24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '12px', marginTop: 0, lineHeight: '1.1' }}>
                  <SplitText line1="Our" line2="Vision" delay={100} />
                </h3>
                <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{vision}</p>
              </div>
              <div style={{ backgroundColor: 'var(--bg-main)', padding: '24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '12px', marginTop: 0, lineHeight: '1.1' }}>
                  <SplitText line1="Our" line2="Mission" delay={200} />
                </h3>
                <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{mission}</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Section: Faculty Coordinator Information */}
          <ScrollReveal delay={150} duration={850}>
            <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '12px', marginTop: 0, lineHeight: '1.1' }}>
                <SplitText line1="Faculty" line2="Support" delay={100} />
              </h3>
              {facultySupport ? (
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                  {facultySupport}
                </p>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>
                  Faculty coordinator information will be updated by the chapter.
                </p>
              )}
            </div>
          </ScrollReveal>

          {/* Section: Achievements & Research (Rendered conditionally) */}
          {(achievements || research) && (
            <ScrollReveal delay={200} duration={850}>
              <div style={{ display: 'grid', gridTemplateColumns: achievements && research ? '1fr 1fr' : '1fr', gap: '32px' }} className="extra-info-grid">
                {achievements && (
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '12px', marginTop: 0, lineHeight: '1.1' }}>
                      <SplitText line1="Chapter" line2="Achievements" delay={100} />
                    </h3>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{achievements}</p>
                  </div>
                )}
                {research && (
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--secondary)', marginBottom: '12px', marginTop: 0, lineHeight: '1.1' }}>
                      <SplitText line1="Computing" line2="Research" delay={200} />
                    </h3>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>{research}</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}

        </div>
      </section>

      {/* Media Queries */}
      <style>{`
        @media (max-width: 768px) {
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
