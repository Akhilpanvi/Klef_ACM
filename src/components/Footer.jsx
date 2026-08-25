import { Link } from 'react-router-dom';
import { ScrollReveal } from './ScrollReveal';

export default function Footer({ contact = {} }) {
  const currentYear = new Date().getFullYear();

  // Hide placeholder defaults to avoid displaying fake info
  const email = contact.email && contact.email !== 'acm.studentchapter@kluniversity.in' ? contact.email : '';
  const phone = contact.phone && contact.phone !== '+91 86323 99999' ? contact.phone : '';
  const socialLinks = contact.social_links || {};

  const hasSocials = socialLinks.linkedin || socialLinks.instagram || socialLinks.github;

  return (
    <footer className="footer" style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--secondary)', color: 'rgba(255,255,255,0.85)', padding: '64px 0 32px 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '48px', marginBottom: '32px' }} className="footer-grid">
          {/* Col 1: Chapter Details & Address */}
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              KLU ACM
            </h3>
            <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
              KLEF ACM Student Chapter
            </p>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.6)' }}>
              Koneru Lakshmaiah Education Foundation (Deemed to be University)<br />
              Green Fields, Vaddeswaram<br />
              Guntur District, Andhra Pradesh – 522302<br />
              India
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link></li>
              <li><Link to="/events" style={{ color: 'inherit', textDecoration: 'none' }}>Events</Link></li>
              <li><Link to="/gallery" style={{ color: 'inherit', textDecoration: 'none' }}>Gallery</Link></li>
              <li><Link to="/members" style={{ color: 'inherit', textDecoration: 'none' }}>Members</Link></li>
              <li><Link to="/about-acm" style={{ color: 'inherit', textDecoration: 'none' }}>About ACM</Link></li>
              <li><Link to="/about-klef-acm" style={{ color: 'inherit', textDecoration: 'none' }}>About KLU ACM</Link></li>
              <li><Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</Link></li>
            </ul>
          </div>

          {/* Col 3: Official ACM Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
              Official ACM Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <li><a href="https://www.acm.org" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>ACM Official Website</a></li>
              <li><a href="https://www.acm.org/about-acm/about-the-association-for-computing-machinery" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>ACM About</a></li>
              <li><a href="https://dl.acm.org" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>ACM Digital Library</a></li>
              <li><a href="https://www.acm.org/chapters" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>ACM Chapters</a></li>
              <li><a href="https://www.acm.org/membership" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>ACM Membership</a></li>
              <li><a href="https://www.acm.org/code-of-ethics" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>ACM Code of Ethics</a></li>
            </ul>
          </div>

          {/* Col 4: Chapter Contacts (Only rendered if configured) */}
          <div>
            {(email || phone || hasSocials) && (
              <>
                <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
                  Chapter Connection
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                  {email && (
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Email</span>
                      <a href={`mailto:${email}`} style={{ color: '#fff', textDecoration: 'none' }}>{email}</a>
                    </div>
                  )}
                  {phone && (
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Phone</span>
                      <a href={`tel:${phone}`} style={{ color: '#fff', textDecoration: 'none' }}>{phone}</a>
                    </div>
                  )}
                  {hasSocials && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      {socialLinks.linkedin && (
                        <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)' }} aria-label="LinkedIn">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </a>
                      )}
                      {socialLinks.instagram && (
                        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)' }} aria-label="Instagram">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                          </svg>
                        </a>
                      )}
                      {socialLinks.github && (
                        <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)' }} aria-label="GitHub">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Typographic Footer Statement */}
        <ScrollReveal delay={0} duration={850} yOffset={15} style={{ width: '100%', overflow: 'hidden', margin: '32px 0 24px 0' }}>
          <h2 style={{ 
            fontSize: 'clamp(32px, 8vw, 86px)', 
            fontWeight: '900', 
            color: 'rgba(255,255,255,0.05)', 
            letterSpacing: '-0.03em', 
            textTransform: 'uppercase',
            lineHeight: '0.95',
            margin: 0,
            whiteSpace: 'nowrap',
            userSelect: 'none',
            pointerEvents: 'none'
          }}>
            KLU ACM STUDENT CHAPTER
          </h2>
        </ScrollReveal>

        {/* Bottom copyright banner */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          <p>© {currentYear} KLU ACM Student Chapter. All Rights Reserved.</p>
          <p>Designed & Maintained by Professional Student Developers</p>
        </div>
      </div>
    </footer>
  );
}
