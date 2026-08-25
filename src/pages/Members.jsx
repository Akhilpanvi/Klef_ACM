import { useContext, useState } from 'react';
import { Mail, User, X, Info } from 'lucide-react';
import { SiteDataContext } from '../App';
import { ScrollReveal, TextReveal } from '../components/ScrollReveal';

export default function Members() {
  const { siteData } = useContext(SiteDataContext);
  const members = siteData?.members || [];

  const [selectedMember, setSelectedMember] = useState(null);

  // Group members by category
  const faculty = members.filter(m => m.category === 'faculty_coordinator' && m.is_active);
  
  // Executive council includes: chair, vice_chair, secretary, treasurer, webmaster
  const execRoles = ['chair', 'vice_chair', 'secretary', 'treasurer', 'webmaster'];
  const executiveCouncil = members.filter(m => execRoles.includes(m.category) && m.is_active);
  
  // Technical and design leads
  const leads = members.filter(m => (m.category === 'technical_lead' || m.category === 'other_lead') && m.is_active);
  
  // General Student Members
  const studentMembers = members.filter(m => m.category === 'student_member' && m.is_active);

  // Helper to generate initials for avatar placeholder
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const renderMemberCard = (member) => {
    const hasPhoto = member.photograph_url && member.photograph_url.trim() !== '';

    return (
      <div 
        key={member.id} 
        className="card member-card" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          padding: '24px',
          transition: 'transform var(--transition-normal), border-color var(--transition-normal)'
        }}
      >
        {/* Photo Container */}
        {hasPhoto ? (
          <img
            src={member.photograph_url}
            alt={member.name}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--border)',
              marginBottom: '16px',
              backgroundColor: 'var(--bg-main)',
              transition: 'transform var(--transition-normal)'
            }}
            className="member-avatar"
          />
        ) : (
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: '700',
              border: '2px solid rgba(0, 92, 169, 0.15)',
              marginBottom: '16px',
              fontFamily: 'var(--font-heading)',
              transition: 'transform var(--transition-normal)'
            }}
            className="member-avatar"
          >
            {getInitials(member.name)}
          </div>
        )}

        {/* Details */}
        <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary)', fontWeight: '700', margin: 0 }}>
          {member.name}
        </h3>
        
        <div style={{ position: 'relative', overflow: 'hidden', width: '100%', minHeight: '50px', marginTop: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Role (Centered initially, slides up on hover) */}
          <div 
            className="member-role" 
            style={{ 
              fontSize: '0.8rem', 
              fontWeight: '600', 
              color: 'var(--primary)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.04em',
              transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              position: 'absolute',
              top: '8px'
            }}
          >
            {member.role}
          </div>

          {/* Socials & Bio Actions (Fades & slides up on hover) */}
          <div 
            className="member-socials-reveal" 
            style={{ 
              display: 'flex', 
              gap: '14px', 
              alignItems: 'center',
              transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
              opacity: 0,
              transform: 'translateY(24px)',
              position: 'absolute',
              top: '8px'
            }}
          >
            {member.linkedin_url && (
              <a 
                href={member.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }}
                className="social-icon"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            )}
            {member.email && (
              <a 
                href={`mailto:${member.email}`} 
                style={{ color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }}
                className="social-icon"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            )}
            {member.biography && member.biography.trim() !== '' && (
              <button
                onClick={() => setSelectedMember(member)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'color 0.2s'
                }}
                className="bio-btn"
                title="Read Biography"
              >
                <Info size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '80vh', paddingBottom: '80px' }}>
      {/* Editorial Header */}
      <section style={{ backgroundColor: 'var(--bg-main)', padding: '64px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
            Chapter Officers
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--secondary)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
            <TextReveal text="Our Chapter Committee" duration={900} />
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px', margin: 0 }}>
            Meet the faculty coordinators and student administrators executing the vision of the KLU ACM Student Chapter.
          </p>
        </div>
      </section>

      {/* 1. Faculty Coordinators Section */}
      {faculty.length > 0 && (
        <ScrollReveal delay={0} duration={700}>
          <div className="container" style={{ marginTop: '50px' }}>
            <h2 style={{ fontSize: '1.6rem', borderBottom: '2px solid var(--border)', paddingBottom: '8px', marginBottom: '24px' }}>
              Faculty Coordinators
            </h2>
            <div className="grid-3" style={{ justifyContent: 'center' }}>
              {faculty.map(renderMemberCard)}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* 2. Executive Council Section */}
      {executiveCouncil.length > 0 && (
        <ScrollReveal delay={100} duration={750}>
          <div className="container" style={{ marginTop: '50px' }}>
            <h2 style={{ fontSize: '1.6rem', borderBottom: '2px solid var(--border)', paddingBottom: '8px', marginBottom: '24px' }}>
              Executive Council
            </h2>
            <div className="grid-3">
              {executiveCouncil.map(renderMemberCard)}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* 3. Technical & Design Committee Leads */}
      {leads.length > 0 && (
        <ScrollReveal delay={150} duration={800}>
          <div className="container" style={{ marginTop: '50px' }}>
            <h2 style={{ fontSize: '1.6rem', borderBottom: '2px solid var(--border)', paddingBottom: '8px', marginBottom: '24px' }}>
              Technical & Editorial Leads
            </h2>
            <div className="grid-4">
              {leads.map(renderMemberCard)}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* 4. Student Members */}
      {studentMembers.length > 0 && (
        <ScrollReveal delay={200} duration={850}>
          <div className="container" style={{ marginTop: '50px' }}>
            <h2 style={{ fontSize: '1.6rem', borderBottom: '2px solid var(--border)', paddingBottom: '8px', marginBottom: '24px' }}>
              Student Members
            </h2>
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '20px' 
              }}
            >
              {studentMembers.map(renderMemberCard)}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Show empty state if no active members at all */}
      {members.length === 0 && (
        <div className="container text-center" style={{ marginTop: '80px' }}>
          <div className="card" style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
            <User size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px auto', opacity: 0.6 }} />
            <h3 style={{ marginBottom: '8px' }}>Team Roster Empty</h3>
            <p style={{ color: 'var(--text-muted)' }}>The chapter members list is currently being compiled by the administrator.</p>
          </div>
        </div>
      )}

      {/* Biography Modal */}
      {selectedMember && (
        <div className="modal-overlay" onClick={() => setSelectedMember(null)} style={{ animation: 'modalFadeIn 0.25s ease-out forwards' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ animation: 'modalScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <button className="modal-close" onClick={() => setSelectedMember(null)}>
              <X size={24} />
            </button>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
              {selectedMember.photograph_url ? (
                <img
                  src={selectedMember.photograph_url}
                  alt={selectedMember.name}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                />
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: '700'
                  }}
                >
                  {getInitials(selectedMember.name)}
                </div>
              )}
              <div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--secondary)' }}>{selectedMember.name}</h2>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)', textTransform: 'uppercase' }}>
                  {selectedMember.role}
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Biography
              </span>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {selectedMember.biography}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button onClick={() => setSelectedMember(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded social icons and bio buttons hover effects */}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .member-card:hover {
          border-color: var(--primary) !important;
        }
        
        .member-card:hover .member-avatar {
          transform: scale(1.04);
        }

        .member-card:hover .member-role {
          transform: translateY(-10px);
        }

        .member-card:hover .member-socials-reveal {
          transform: translateY(12px);
          opacity: 1;
        }

        .social-icon:hover {
          color: var(--primary) !important;
        }
        .bio-btn:hover {
          color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
}
