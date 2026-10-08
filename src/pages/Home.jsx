import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Code2,
  Trophy,
  Users,
  BookOpen,
  Briefcase,
  Calendar,
  FlaskConical,
  Globe,
  GraduationCap,
  MapPin,
  Mic,
  Newspaper,
  Target,
  Telescope

} from 'lucide-react';
import { SiteDataContext } from '../App';
import SafeImage from '../components/SafeImage';
import VisualEditable from '../components/VisualEditor/VisualEditable';
import PageBlockList from '../components/VisualEditor/PageBlockList';
import { parseMemberData } from '../utils/dataHelpers.jsx';

const ease = [0.16, 1, 0.3, 1];
const activityIcons = [Code2, Trophy, FlaskConical, Users];
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease }
});


const defaultActivities = [
  'Technical Workshops on Web Dev, AI/ML, Cloud Computing',
  'National-level Hackathons and Competitive Programming Contests',
  'Collaborative Research projects and Paper Presentations',
  'Mentorship sessions by alumni and industry experts'
];

const benefits = [
  { icon: BookOpen, title: 'ACM Digital Library', text: 'Peer-reviewed computing research, journals and conference proceedings.' },
  { icon: GraduationCap, title: 'Learning Center', text: 'Online courses, books and videos to keep technical skills current.' },
  { icon: FlaskConical, title: 'Student Research Competition', text: 'Present research at ACM conferences on a global stage.' },
  { icon: Newspaper, title: 'XRDS Magazine', text: 'ACM’s magazine written by and for students in computing.' },
  { icon: Globe, title: 'Global Network', text: 'Connect with 100,000+ ACM members and chapters worldwide.' },
  { icon: Briefcase, title: 'Career & Job Center', text: 'Internships, jobs and career resources from industry.' }
];

const initials = (name = '') => name.replace(/^(Dr|Mr|Ms|Mrs)\.?\s*/i, '').split(/\s+/).filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();

// Same URL shape Members.jsx uses for deep links
const profilePath = (m) =>
  `/Members/${encodeURIComponent((m.name || 'member').trim().replace(/\s+/g, '-'))}/${encodeURIComponent((m.role || 'Member').trim().replace(/\s+/g, '-'))}`;

function Avatar({ member, className }) {
  return (
    <div className={className}>
      {member.photograph_url
        ? <SafeImage src={member.photograph_url} alt={member.name} fit="cover" fallbackText={initials(member.name)} />
        : <span>{initials(member.name)}</span>}
    </div>
  );
}

export default function Home() {
  const { siteData } = useContext(SiteDataContext);
  const homeData = siteData?.pages?.home?.content || {};
  const chapterData = siteData?.pages?.['about-klef-acm']?.content || {};
  const events = siteData?.events || [];
  const members = [...(siteData?.members || [])].sort((a, b) => parseMemberData(a).display_order - parseMemberData(b).display_order);

  const featuredEvent = events.find(e => e.is_featured && e.is_published) || events.find(e => e.is_published);
  const isUpcoming = featuredEvent && new Date(featuredEvent.date) >= new Date();

  const facultyCount = members.filter(m => /faculty/i.test(m.role || '')).length;
  const studentCount = members.length - facultyCount;
  const leadership = members.slice(0, 3);
  const team = members.filter(m => m.photograph_url).slice(0, 8);

  const activities = Array.isArray(chapterData.activities) && chapterData.activities.length ? chapterData.activities : defaultActivities;
  const achievements = Array.isArray(homeData.achievements) ? homeData.achievements : [];
  const intro = homeData.introduction || {};

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <motion.div {...fadeUp(0)} className="editorial-kicker">KLEF ACM Student Chapter</motion.div>
            <motion.div {...fadeUp(0.08)}>
              <VisualEditable
                name="hero_title"
                as="h1"
                className="hero-title"
                defaultValue={homeData.hero_title || homeData.hero?.title || 'Empowering Future Computing Professionals'}
                style={{ margin: '6px 0 20px' }}
              />
            </motion.div>
            <motion.div {...fadeUp(0.16)}>
              <VisualEditable
                name="hero_description"
                as="p"
                className="lead"
                defaultValue={homeData.hero_description || 'A community of students and faculty at KL University advancing computing through workshops, research, hackathons and competitive programming.'}
                style={{ maxWidth: '580px', margin: '0 0 32px' }}
              />
            </motion.div>
            <motion.div {...fadeUp(0.24)} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/Events" className="btn btn-primary">{homeData.hero?.cta_events || 'Explore Events'} <ArrowRight size={16} /></Link>
              <Link to="/Members" className="btn btn-secondary">{homeData.hero?.cta_members || 'Meet Our Team'}</Link>
            </motion.div>
          </div>

          {/* Leadership + next event — real chapter data */}
          <motion.aside {...fadeUp(0.2)} className="panel lead-card" aria-label="Chapter leadership">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div className="editorial-kicker" style={{ margin: 0 }}>Chapter Leadership</div>
              <Link to="/Members" className="text-link" style={{ fontSize: '.84rem' }}>View all <ArrowRight size={14} /></Link>
            </div>
            {leadership.length ? leadership.map(m => (
              <Link key={m.id} to={profilePath(m)} className="lead-row">
                <Avatar member={m} className="lead-avatar" />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#0F1B2D', fontSize: '.98rem' }}>{m.name}</div>
                  <div style={{ fontSize: '.84rem', color: '#64748B' }}>{m.role}</div>
                </div>
              </Link>
            )) : (
              <p style={{ margin: '12px 0', fontSize: '.92rem' }}>Leadership details will appear here.</p>
            )}

            {featuredEvent && (
              <Link to="/Events" className="event-mini">
                <div className="date-chip">
                  <div>
                    <div style={{ fontSize: '.62rem', fontWeight: 700, letterSpacing: '.08em' }}>{new Date(featuredEvent.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{new Date(featuredEvent.date).getDate()}</div>
                  </div>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#0077B6' }}>{isUpcoming ? 'Upcoming event' : 'Latest event'}</div>
                  <div style={{ fontWeight: 700, color: '#0F1B2D', fontSize: '.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{featuredEvent.title}</div>
                  {featuredEvent.venue && <div style={{ fontSize: '.8rem', color: '#64748B' }}>{featuredEvent.venue}</div>}
                </div>
                <ArrowUpRight size={18} color="#0077B6" style={{ flexShrink: 0 }} />
              </Link>
            )}
          </motion.aside>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section style={{ padding: '40px 0 0' }}>
        <div className="container">
          <div className="stats-strip">
            <div className="stat"><div className="stat-value">{facultyCount}</div><div className="stat-label">Faculty mentors</div></div>
            <div className="stat"><div className="stat-value">{studentCount}</div><div className="stat-label">Student leaders &amp; members</div></div>
            <div className="stat"><div className="stat-value">{events.filter(e => e.is_published).length}</div><div className="stat-label">Chapter events</div></div>
            <div className="stat"><div className="stat-value">100K<sup>+</sup></div><div className="stat-label">ACM members worldwide</div></div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT / VISION / MISSION ================= */}
      <section className="section bg-white">
        <div className="container reveal">
          <div className="home-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', alignItems: 'start' }}>
            <div>
              <div className="editorial-kicker">About the Chapter</div>
              <VisualEditable
                name="intro_heading"
                as="h2"
                className="display-title"
                defaultValue={homeData.intro_heading || intro.heading || 'Advancing Computing as a Science & Profession'}
                style={{ marginBottom: '16px' }}
              />
              <VisualEditable
                name="intro_text"
                as="p"
                className="lead"
                defaultValue={homeData.intro_text || intro.text || chapterData.introduction || ''}
                style={{ marginBottom: '24px' }}
              />
              <Link to="/About-KLEF-ACM" className="text-link">Learn more about the chapter <ArrowRight size={15} /></Link>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div className="panel vm-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div className="icon-tile"><Telescope size={22} /></div>
                  <h3 style={{ margin: 0 }}>Our Vision</h3>
                </div>
                <p>{chapterData.vision || 'To create an environment of computational excellence, innovation and mentorship.'}</p>
              </div>
              <div className="panel vm-card red">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div className="icon-tile red"><Target size={22} /></div>
                  <h3 style={{ margin: 0 }}>Our Mission</h3>
                </div>
                <p>{chapterData.mission || 'To provide students with technical exposure, workshops, research guidance and competitive challenges.'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHAT WE DO ================= */}
      <section className="section bg-soft">
        <div className="container reveal">
          <div className="section-head center">
            <div className="editorial-kicker">What We Do</div>
            <h2 className="display-title">Chapter Activities</h2>
            <p className="lead">Programs that connect classroom learning with research and industry practice.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {activities.map((a, i) => {
              const Icon = activityIcons[i % activityIcons.length];
              return (
                <div key={i} className="panel feature-card ring-hover">
                  <div className={`icon-tile ${i % 2 ? 'red' : ''}`}><Icon size={22} /></div>
                  <h3>{String(a)}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= ACHIEVEMENTS ================= */}
      {achievements.length > 0 && (
        <section className="section bg-white">
          <div className="container reveal">
            <div className="section-head">
              <div className="editorial-kicker">Recognition</div>
              <h2 className="display-title">Chapter Achievements</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {achievements.map((a, i) => (
                <div key={i} className="panel ring-hover" style={{ padding: '26px', display: 'flex', gap: '18px' }}>
                  <div className={`icon-tile ${i % 2 ? '' : 'red'}`}><Award size={22} /></div>
                  <div>
                    <h3 style={{ fontSize: '1.08rem', marginBottom: '6px' }}>{a.title}</h3>
                    <p style={{ margin: 0, fontSize: '.94rem' }}>{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= FEATURED EVENT ================= */}
      {featuredEvent && (
        <section className="section bg-soft">
          <div className="container reveal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
              <div>
                <div className="editorial-kicker">Events</div>
                <h2 className="display-title" style={{ margin: 0 }}>{isUpcoming ? 'Upcoming Event' : 'Latest Event'}</h2>
              </div>
              <Link to="/Events" className="text-link">View all events <ArrowRight size={15} /></Link>
            </div>
            <div className="panel featured-event-grid" style={{ padding: '28px', display: 'grid', gridTemplateColumns: featuredEvent.image_url ? '1fr 1.3fr' : '1fr', gap: '32px', alignItems: 'center' }}>
              {featuredEvent.image_url && (
                <div style={{ borderRadius: '10px', overflow: 'hidden', background: 'var(--surface)', minHeight: '240px', maxHeight: '320px', display: 'flex' }}>
                  <SafeImage src={featuredEvent.image_url} alt={featuredEvent.title} fit="contain" style={{ maxHeight: '320px' }} fallbackIcon={Calendar} />
                </div>
              )}
              <div>
                <h3 style={{ fontSize: 'clamp(1.3rem, 2.4vw, 1.7rem)', fontWeight: 700, marginBottom: '14px' }}>{featuredEvent.title}</h3>
                <div style={{ display: 'flex', gap: '20px', color: '#64748B', fontSize: '.9rem', marginBottom: '16px', flexWrap: 'wrap', fontWeight: 500 }}>
                  <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}><Calendar size={15} color="#D32A38" />{new Date(featuredEvent.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                  {featuredEvent.venue && <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}><MapPin size={15} color="#0077B6" />{featuredEvent.venue}</span>}
                  {featuredEvent.speaker && <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}><Mic size={15} color="#D32A38" />{featuredEvent.speaker}</span>}
                </div>
                <p style={{ marginBottom: '24px', lineHeight: 1.75 }}>{featuredEvent.description?.substring(0, 260)}{featuredEvent.description?.length > 260 ? '…' : ''}</p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {featuredEvent.registration_link && isUpcoming && (
                    <a href={featuredEvent.registration_link} target="_blank" rel="noopener noreferrer" className="btn btn-red">Register <ArrowRight size={15} /></a>
                  )}
                  <Link to="/Events" className="btn btn-secondary">Event details</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= TEAM ================= */}
      {team.length > 0 && (
        <section className="section bg-white">
          <div className="container reveal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
              <div>
                <div className="editorial-kicker">Our Team</div>
                <h2 className="display-title" style={{ margin: 0 }}>Meet the People Behind the Chapter</h2>
              </div>
              <Link to="/Members" className="text-link">View full committee <ArrowRight size={15} /></Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {team.map(m => (
                <Link key={m.id} to={profilePath(m)} className="mcard">
                  <div className="mcard-media"><SafeImage src={m.photograph_url} alt={m.name} fit="cover" /></div>
                  <div className="mcard-glass">
                    <div style={{ minWidth: 0 }}>
                      <div className="mcard-role">{m.role}</div>
                      <h3 className="mcard-name">{m.name}</h3>
                    </div>
                    <span className="mcard-icon"><ArrowUpRight size={16} /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= WHY ACM ================= */}
      <section className="section bg-soft">
        <div className="container reveal">
          <div className="section-head center">
            <div className="editorial-kicker">ACM Membership</div>
            <h2 className="display-title">Why Join ACM</h2>
            <p className="lead">Membership connects you to the resources of the world’s largest educational and scientific computing society.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="panel ring-hover" style={{ padding: '22px', display: 'flex', gap: '16px' }}>
                  <div className={`icon-tile ${i % 2 ? 'red' : ''}`}><Icon size={22} /></div>
                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{b.title}</h3>
                    <p style={{ margin: 0, fontSize: '.92rem', lineHeight: 1.6 }}>{b.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <a href="https://www.acm.org/membership/membership-benefits" target="_blank" rel="noopener noreferrer" className="text-link">See all ACM member benefits <ArrowUpRight size={15} /></a>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="section bg-white">
        <div className="container reveal">
          <div className="cta-band">
            <div>
              <h2 className="display-title" style={{ margin: 0 }}>Become part of KLEF ACM</h2>
              <p>Join workshops, contribute to research and represent KL University in national contests.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/Contact" className="btn btn-white">Join the Chapter <ArrowRight size={16} /></Link>
              <Link to="/Events" className="btn btn-outline-white">Upcoming Events</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Free-form CMS blocks */}
      <div className="container">
        <PageBlockList blockKey="home_blocks" style={{ margin: '32px 0' }} />
      </div>
    </div>
  );
}
