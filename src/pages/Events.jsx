import { useContext, useState } from 'react';
import { Calendar, MapPin, User, Tag, Search, Globe, ArrowRight, X } from 'lucide-react';
import { SiteDataContext } from '../App';
import { ScrollReveal, TextReveal } from '../components/ScrollReveal';

export default function Events() {
  const { siteData } = useContext(SiteDataContext);
  const events = siteData?.events || [];

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'past'
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Derive unique categories from events for filtering dropdown/buttons
  const categories = ['all', ...new Set(events.map(e => e.venue.toLowerCase().includes('online') ? 'Online' : 'In-Person'))];

  const now = new Date();

  // Filter events list
  const filteredEvents = events.filter(event => {
    if (!event.is_published) return false;

    // Time-based tab filter
    const eventDate = new Date(event.date);
    if (activeTab === 'upcoming' && eventDate < now) return false;
    if (activeTab === 'past' && eventDate >= now) return false;

    // Category filter (simplistic categorizer based on online/in-person or custom tags)
    const isOnline = event.venue.toLowerCase().includes('online');
    if (filterCategory === 'Online' && !isOnline) return false;
    if (filterCategory === 'In-Person' && isOnline) return false;

    // Search query filter
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesSearch;
  });

  const openEventModal = (event) => {
    setSelectedEvent(event);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '80vh' }}>
      {/* Editorial Header */}
      <section style={{ backgroundColor: 'var(--bg-main)', padding: '64px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
            Chapter Catalog
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--secondary)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
            <TextReveal text="Chapter Activities" duration={900} />
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px', margin: 0 }}>
            Empower your knowledge. Browse through our upcoming bootcamps, technical lectures, hands-on workshops, and past sessions.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="container" style={{ marginTop: '48px' }}>
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            backgroundColor: 'var(--bg-card)', 
            padding: '16px 24px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border)',
            gap: '24px',
            flexWrap: 'wrap'
          }}
          className="filters-row"
        >
          {/* Tabs: All / Upcoming / Past */}
          <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-main)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
            <button 
              onClick={() => setActiveTab('all')} 
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: '600',
                backgroundColor: activeTab === 'all' ? '#fff' : 'transparent',
                color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'all' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              All Events ({events.filter(e => e.is_published).length})
            </button>
            <button 
              onClick={() => setActiveTab('upcoming')} 
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: '600',
                backgroundColor: activeTab === 'upcoming' ? '#fff' : 'transparent',
                color: activeTab === 'upcoming' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'upcoming' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Upcoming ({events.filter(e => e.is_published && new Date(e.date) >= now).length})
            </button>
            <button 
              onClick={() => setActiveTab('past')} 
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: '600',
                backgroundColor: activeTab === 'past' ? '#fff' : 'transparent',
                color: activeTab === 'past' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'past' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Past ({events.filter(e => e.is_published && new Date(e.date) < now).length})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, justifyContent: 'flex-end', minWidth: '280px' }} className="search-group">
            {/* Category Select */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-main)',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">All Locations</option>
              <option value="Online">Online</option>
              <option value="In-Person">In-Person</option>
            </select>

            <div style={{ position: 'relative', width: '100%', maxWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-main)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Events List Grid */}
      <section className="section">
        <div className="container">
          {filteredEvents.length === 0 ? (
            <div className="card text-center" style={{ padding: '60px 20px' }}>
              <Calendar size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px auto', opacity: 0.6 }} />
              <h3 style={{ marginBottom: '8px' }}>No Events Found</h3>
              <p style={{ color: 'var(--text-muted)' }}>There are no events matching your selected filter options or search queries.</p>
            </div>
          ) : (
            <div className="grid-3">
              {filteredEvents.map((event, idx) => {
                const isPast = new Date(event.date) < now;
                return (
                  <ScrollReveal key={event.id} delay={idx * 80} duration={600} yOffset={20}>
                    <div 
                      className="card event-card" 
                      style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', transition: 'border-color 0.2s ease, transform 0.2s ease' }}
                      onClick={() => openEventModal(event)}
                    >
                      {/* Event Banner */}
                      <div
                        style={{
                          height: '180px',
                          backgroundColor: 'var(--bg-main)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundImage: event.image_url ? `url(${event.image_url})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          marginBottom: '20px',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)',
                          fontSize: '0.8rem',
                          fontWeight: '500'
                        }}
                      >
                        {!event.image_url && <span>Event Photograph Placeholder</span>}
                      </div>

                      {/* Status Badge */}
                      <span 
                        className={`badge ${isPast ? 'badge-success' : 'badge-primary'}`}
                        style={{ position: 'absolute', top: '20px', right: '20px' }}
                      >
                        {isPast ? 'Completed' : 'Upcoming'}
                      </span>

                      {/* Typographic Date & Title Block */}
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid var(--border)', paddingRight: '12px', minWidth: '42px' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', lineHeight: '1' }}>
                            {new Date(event.date).getDate()}
                          </span>
                          <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary)', lineHeight: '1.25', margin: 0 }}>
                            {event.title}
                          </h3>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px', flexGrow: 1 }}>
                        {event.description.substring(0, 120)}...
                      </p>

                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifySelf: 'flex-end', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {event.venue}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }} className="details-link">
                          Details <ArrowRight size={14} className="arrow-icon" style={{ transition: 'transform 0.2s ease' }} />
                        </span>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. Event Details Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={closeEventModal} style={{ animation: 'modalFadeIn 0.25s ease-out forwards' }}>
          <div className="modal-content" style={{ maxWidth: '700px', animation: 'modalScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeEventModal}>
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', marginBottom: '16px' }}>
              {selectedEvent.title}
            </h2>

            {selectedEvent.image_url && (
              <img
                src={selectedEvent.image_url}
                alt={selectedEvent.title}
                style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--border)' }}
              />
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '0.9rem' }}>
              <div>
                <span style={{ fontWeight: '600', color: 'var(--secondary)' }}>📅 Date & Time:</span>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                  {new Date(selectedEvent.date).toLocaleDateString('en-US', { dateStyle: 'full' })} at {new Date(selectedEvent.date).toLocaleTimeString('en-US', { timeStyle: 'short' })}
                </p>
              </div>
              <div>
                <span style={{ fontWeight: '600', color: 'var(--secondary)' }}>📍 Venue:</span>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{selectedEvent.venue}</p>
              </div>
              <div>
                <span style={{ fontWeight: '600', color: 'var(--secondary)' }}>🎤 Keynote Speaker:</span>
                <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{selectedEvent.speaker}</p>
              </div>
              <div>
                <span style={{ fontWeight: '600', color: 'var(--secondary)' }}>🏷️ Status:</span>
                <p style={{ marginTop: '4px' }}>
                  <span className={`badge ${new Date(selectedEvent.date) < now ? 'badge-success' : 'badge-primary'}`}>
                    {new Date(selectedEvent.date) < now ? 'Completed' : 'Upcoming'}
                  </span>
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <span style={{ fontWeight: '600', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Event Description:</span>
              <p style={{ color: 'var(--text-main)', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                {selectedEvent.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <button onClick={closeEventModal} className="btn btn-secondary btn-sm">
                Close
              </button>
              {selectedEvent.registration_link && new Date(selectedEvent.date) >= now && (
                <a 
                  href={selectedEvent.registration_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary btn-sm"
                >
                  Confirm Seat Registration <Globe size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .event-card {
          cursor: pointer;
        }
        .event-card:hover {
          border-color: var(--primary) !important;
          transform: translateY(-2px);
        }
        .event-card:hover .details-link .arrow-icon {
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .filters-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .search-group {
            justify-content: stretch !important;
          }
        }
      `}</style>
    </div>
  );
}
