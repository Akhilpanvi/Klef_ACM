import { useContext, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import { SiteDataContext } from '../App';
import { ScrollReveal, TextReveal } from '../components/ScrollReveal';

export default function Gallery() {
  const { siteData } = useContext(SiteDataContext);
  const gallery = siteData?.gallery || [];

  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Derive unique categories from gallery data
  const categories = ['all', ...new Set(gallery.map(img => img.category).filter(Boolean))];

  // Filter images based on category selection
  const filteredImages = activeCategory === 'all' 
    ? gallery 
    : gallery.filter(img => img.category === activeCategory);

  // Navigate lightbox images
  const showPrevImage = (e) => {
    e.stopPropagation();
    if (lightboxIndex === null || filteredImages.length <= 1) return;
    setLightboxIndex((prevIndex) => (prevIndex === 0 ? filteredImages.length - 1 : prevIndex - 1));
  };

  const showNextImage = (e) => {
    e.stopPropagation();
    if (lightboxIndex === null || filteredImages.length <= 1) return;
    setLightboxIndex((prevIndex) => (prevIndex === filteredImages.length - 1 ? 0 : prevIndex + 1));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') showPrevImage(e);
      if (e.key === 'ArrowRight') showNextImage(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredImages]);

  const activeImage = lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '80vh' }}>
      {/* Editorial Header */}
      <section style={{ backgroundColor: 'var(--bg-main)', padding: '64px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
            Chapter Archive
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--secondary)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
            <TextReveal text="Chapter Gallery" duration={900} />
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '600px', margin: 0 }}>
            A visual documentation of our chapter's legacy. Explore photographs from hands-on hackathons, technical bootcamps, and volunteer meetups.
          </p>
        </div>
      </section>

      {/* Main Grid & Filters */}
      <div className="container" style={{ marginTop: '48px' }}>
        
        {/* Category Filters Bar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setLightboxIndex(null);
              }}
              className={`gallery-filter-btn ${activeCategory === cat ? 'active' : ''}`}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                border: '1px solid var(--border)',
                backgroundColor: activeCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                color: activeCategory === cat ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                boxShadow: 'none'
              }}
            >
              {cat === 'all' ? 'Show All' : cat}
            </button>
          ))}
        </div>

        {/* Gallery Image Grid */}
        {filteredImages.length === 0 ? (
          <div className="card text-center" style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
            <ImageIcon size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px auto', opacity: 0.6 }} />
            <h3 style={{ marginBottom: '8px' }}>No Media Available</h3>
            <p style={{ color: 'var(--text-muted)' }}>We haven't uploaded images to this category yet. Check back later!</p>
          </div>
        ) : (
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px',
              paddingBottom: '80px'
            }}
          >
            {filteredImages.map((img, index) => (
              <ScrollReveal key={img.id} delay={index * 40} duration={500} yOffset={15}>
                <div
                  onClick={() => setLightboxIndex(index)}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-card)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
                    aspectRatio: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                  className="gallery-grid-item"
                >
                  <img
                    src={img.url}
                    alt={img.caption || 'KLEF ACM Gallery image'}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)' }}
                    className="gallery-image-zoom"
                  />
                  
                  {/* Floating Category Tag */}
                  {img.category && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        pointerEvents: 'none',
                        zIndex: 3
                      }}
                    >
                      {img.category}
                    </span>
                  )}

                  {/* Hover Caption Overlay */}
                  <div 
                    className="gallery-caption-overlay"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      padding: '24px 16px 16px 16px',
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.5) 70%, transparent 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transform: 'translateY(100%)',
                      opacity: 0,
                      transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}
                  >
                    {img.caption && (
                      <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0, color: '#ffffff', lineHeight: '1.4' }}>
                        {img.caption}
                      </p>
                    )}
                    {img.date && (
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase' }}>
                        {new Date(img.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && activeImage && (
        <div 
          className="lightbox-overlay" 
          onClick={() => setLightboxIndex(null)}
          style={{ userSelect: 'none', animation: 'lightboxFadeIn 0.25s ease-out forwards' }}
        >
          {/* Close button */}
          <button 
            className="lightbox-close" 
            onClick={() => setLightboxIndex(null)}
            aria-label="Close lightbox"
          >
            <X size={32} />
          </button>

          {/* Left Arrow */}
          {filteredImages.length > 1 && (
            <button 
              onClick={showPrevImage}
              style={{
                position: 'absolute',
                left: '24px',
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: '12px',
                borderRadius: '50%',
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              className="lightbox-nav-btn"
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Image Container */}
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()} style={{ animation: 'lightboxScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <img
              src={activeImage.url}
              alt={activeImage.caption || 'Enlarged gallery visual'}
              className="lightbox-image"
              style={{ transition: 'opacity 0.2s ease-in-out' }}
            />
            {/* Metadata overlay */}
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <p className="lightbox-caption" style={{ fontWeight: '500' }}>
                {activeImage.caption || 'KLEF ACM Student Chapter Activity'}
              </p>
              {activeImage.gallery_albums?.name && (
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', display: 'block', marginTop: '4px' }}>
                  Album: {activeImage.gallery_albums.name}
                </span>
              )}
            </div>
          </div>

          {/* Right Arrow */}
          {filteredImages.length > 1 && (
            <button 
              onClick={showNextImage}
              style={{
                position: 'absolute',
                right: '24px',
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: '12px',
                borderRadius: '50%',
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              className="lightbox-nav-btn"
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>
      )}

      {/* Embedded CSS rules for hover animations */}
      <style>{`
        @keyframes lightboxFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lightboxScaleIn {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .gallery-grid-item {
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease !important;
        }
        .gallery-grid-item:hover {
          box-shadow: var(--shadow-lg) !important;
        }
        .gallery-grid-item:hover .gallery-image-zoom {
          transform: scale(1.05);
        }
        .gallery-grid-item:hover .gallery-caption-overlay {
          transform: translateY(0);
          opacity: 1;
        }

        .gallery-filter-btn:hover {
          transform: translateY(-2px);
          color: var(--secondary) !important;
          border-color: var(--secondary) !important;
        }
        .gallery-filter-btn.active:hover {
          color: #ffffff !important;
        }

        .lightbox-nav-btn:hover {
          background-color: rgba(255,255,255,0.2) !important;
        }
      `}</style>
    </div>
  );
}
