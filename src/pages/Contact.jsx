import { useContext, useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, User } from 'lucide-react';
import { SiteDataContext } from '../App';
import { ScrollReveal, TextReveal } from '../components/ScrollReveal';

export default function Contact() {
  const { siteData } = useContext(SiteDataContext);
  const contact = siteData?.contact || {};

  // Read exact contact properties, hiding mock defaults
  const email = contact.email && contact.email !== 'acm.studentchapter@kluniversity.in' ? contact.email : '';
  const phone = contact.phone && contact.phone !== '+91 86323 99999' ? contact.phone : '';
  const contactPerson = contact.contact_person || '';
  const mapUrl = contact.map_url || '';

  // Address defaults exclusively to the required university campus address
  const address = contact.address || `Koneru Lakshmaiah Education Foundation (Deemed to be University)
Green Fields, Vaddeswaram
Guntur District, Andhra Pradesh
India – 522302`;

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill out all required fields.');
      return;
    }
    setLoading(true);

    // Simulate sending message
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '80vh', paddingBottom: '80px' }}>
      {/* Page Header */}
      <section style={{ backgroundColor: 'var(--bg-main)', padding: '64px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
            Chapter Connection
          </span>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '800', color: 'var(--secondary)', letterSpacing: '-0.03em', marginBottom: '20px', lineHeight: '1.1' }}>
            <SplitText line1="CONTACT" line2="KLU ACM" delay={50} />
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', maxWidth: '600px', margin: 0 }}>
            Have questions about chapter memberships, coding activities, hackathons, or computing workshops? Get in touch with our committee.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="section" style={{ padding: '64px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '64px' }} className="contact-grid">
          
          {/* Column 1: Info & Map */}
          <ScrollReveal delay={0} duration={800}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ border: '1px solid var(--border)', padding: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 style={{ fontSize: '1.3rem', color: 'var(--secondary)', margin: 0, paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  Chapter Directory
                </h2>
                
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <MapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '3px' }} />
                  <div>
                    <span style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', letterSpacing: '0.05em' }}>Campus Address</span>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>{address}</p>
                  </div>
                </div>

                {contactPerson && (
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <User size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '3px' }} />
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', letterSpacing: '0.05em' }}>Contact Representative</span>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>{contactPerson}</p>
                    </div>
                  </div>
                )}

                {email && (
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <Mail size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '3px' }} />
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', letterSpacing: '0.05em' }}>Email Channel</span>
                      <a href={`mailto:${email}`} style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>{email}</a>
                    </div>
                  </div>
                )}

                {phone && (
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <Phone size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '3px' }} />
                    <div>
                      <span style={{ fontWeight: '700', fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', letterSpacing: '0.05em' }}>Office Desk</span>
                      <a href={`tel:${phone}`} style={{ fontSize: '0.9rem', color: 'var(--text-main)', textDecoration: 'none', fontWeight: '500' }}>{phone}</a>
                    </div>
                  </div>
                )}

                {!email && !phone && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    Electronic contact channels will be updated by the chapter committee.
                  </div>
                )}
              </div>

              {/* Map Iframe */}
              {mapUrl && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '300px' }}>
                  <iframe
                    title="KLEF ACM Location Map"
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Column 2: Message Form */}
          <ScrollReveal delay={150} duration={850}>
            <div style={{ border: '1px solid var(--border)', padding: '32px', borderRadius: 'var(--radius-sm)' }}>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--secondary)', margin: 0, paddingBottom: '12px', borderBottom: '1px solid var(--border)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={20} style={{ color: 'var(--primary)' }} />
                Inquiry Form
              </h2>

            {submitted ? (
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  ✓
                </div>
                <div>
                  <h4 style={{ color: 'var(--secondary)', marginBottom: '4px', marginTop: 0 }}>Message Received</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Thank you for writing. A KLU ACM chapter representative will respond shortly.</p>
                </div>
                <button onClick={() => setSubmitted(false)} className="btn btn-secondary btn-sm" style={{ marginTop: '8px' }}>
                  New Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Student / Faculty"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    placeholder="Topic of inquiry"
                    className="form-control"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea
                    rows="5"
                    required
                    placeholder="Write details of your question..."
                    className="form-control"
                    style={{ resize: 'vertical' }}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
                >
                  {loading ? 'Submitting Form...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </ScrollReveal>

      </div>
    </section>

      {/* Local responsive style */}
      <style>{`
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </div>
  );
}
