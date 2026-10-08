import { useContext, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  User, 
  Tag, 
  Search, 
  Globe, 
  ArrowRight, 
  ArrowLeft,
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Check, 
  Loader2,
  Camera,
  Share2,
  Maximize2,
  ExternalLink,
  Clock,
  Sparkles,
  GripVertical,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { SiteDataContext } from '../App';
import { ScrollReveal } from '../components/ScrollReveal';
import SafeImage from '../components/SafeImage';
import { api } from '../services/api';
import VisualEditable from '../components/VisualEditor/VisualEditable';
import PageBlockList from '../components/VisualEditor/PageBlockList';

import { parseEventData } from '../utils/dataHelpers.jsx';


export default function Events({ isVisualAdmin = false, isEditMode = false }) {
  const { siteData, setSiteData, triggerDataRefresh } = useContext(SiteDataContext);
  const events = siteData?.events || [];
  const params = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'past'
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Keyboard escape listener for lightbox
  useEffect(() => {
    if (zoomedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && zoomedImage) setZoomedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoomedImage]);

  // Admin Modal States
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().substring(0, 16),
    venue: '',
    speaker: '',
    registration_link: '',
    image_url: '',
    event_format: 'in_person', // 'in_person', 'online', 'hybrid'
    is_published: true,
    is_featured: false,
    display_order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Drag and drop interactive reordering states
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const dragSourceRef = useRef(null);

  // Reorder Events Handler
  const handleMoveEvent = async (index, direction, e) => {
    e?.stopPropagation();
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= filteredEvents.length) return;

    const updatedList = [...filteredEvents];
    const [movedItem] = updatedList.splice(index, 1);
    updatedList.splice(targetIdx, 0, movedItem);

    const updateItemWithOrder = (item, newOrder) => {
      const parsed = parseEventData(item);
      const metadataPayload = { event_format: parsed.event_format, display_order: newOrder };
      const rawDesc = (item.description || '').replace(/\n*<!--(?:KLEF|KLU)_EVENT:[\s\S]*?-->/g, '').trim();
      return {
        ...item,
        display_order: newOrder,
        description: `${rawDesc}\n\n<!--KLEF_EVENT:${JSON.stringify(metadataPayload)}-->`
      };
    };

    const updatedPayloads = updatedList.map((item, idx) => updateItemWithOrder(item, idx + 1));

    // Optimistic instant UI update
    if (setSiteData) {
      setSiteData(prev => ({ ...prev, events: updatedPayloads }));
    }

    try {
      await Promise.all(updatedPayloads.map(payload => api.updateRow('events', payload)));
      await triggerDataRefresh(true);
    } catch (err) {
      console.error('Failed to move event:', err);
    }
  };

  const handleDragStart = (e, index) => {
    if (!isVisualAdmin) return;
    dragSourceRef.current = index;
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch {}
  };

  const handleDragOver = (e, index) => {
    if (!isVisualAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDragLeave = (e, index) => {
    if (dragOverIdx === index) {
      setDragOverIdx(null);
    }
  };

  const handleDrop = async (e, targetIdx) => {
    if (!isVisualAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverIdx(null);

    let sourceIdx = dragSourceRef.current;
    if (sourceIdx === null || sourceIdx === undefined) {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw !== '') sourceIdx = parseInt(raw, 10);
      } catch {}
    }

    if (sourceIdx === null || isNaN(sourceIdx) || sourceIdx === targetIdx) {
      setDraggedIdx(null);
      dragSourceRef.current = null;
      return;
    }

    const updatedList = [...filteredEvents];
    const [movedItem] = updatedList.splice(sourceIdx, 1);
    updatedList.splice(targetIdx, 0, movedItem);

    const updateItemWithOrder = (item, newOrder) => {
      const parsed = parseEventData(item);
      const metadataPayload = { event_format: parsed.event_format, display_order: newOrder };
      const rawDesc = (item.description || '').replace(/\n*<!--(?:KLEF|KLU)_EVENT:[\s\S]*?-->/g, '').trim();
      return {
        ...item,
        display_order: newOrder,
        description: `${rawDesc}\n\n<!--KLEF_EVENT:${JSON.stringify(metadataPayload)}-->`
      };
    };

    const updatedPayloads = updatedList.map((item, idx) => updateItemWithOrder(item, idx + 1));

    // Optimistic instant UI update
    if (setSiteData) {
      setSiteData(prev => ({ ...prev, events: updatedPayloads }));
    }
    setDraggedIdx(null);
    dragSourceRef.current = null;

    try {
      await Promise.all(updatedPayloads.map(payload => api.updateRow('events', payload)));
      await triggerDataRefresh(true);
    } catch (err) {
      console.error('Failed to persist drag order:', err);
    }
  };

  const handleDragEnd = () => {
    setTimeout(() => {
      dragSourceRef.current = null;
      setDraggedIdx(null);
      setDragOverIdx(null);
    }, 100);
  };

  // Match deep-link route /Events/:eventName/:date or /Events/:eventName
  useEffect(() => {
    if (params.eventName && events.length > 0) {
      const targetSlug = decodeURIComponent(params.eventName).toLowerCase().replace(/-/g, ' ');
      const match = events.find(e => {
        const cleanTitle = (e.title || '').toLowerCase();
        const titleMatch = cleanTitle === targetSlug || 
                           cleanTitle.replace(/\s+/g, '-') === params.eventName.toLowerCase() ||
                           encodeURIComponent(cleanTitle) === encodeURIComponent(params.eventName.toLowerCase());
        if (params.date) {
          const dateStr = new Date(e.date).toISOString().split('T')[0];
          return titleMatch && (dateStr === params.date || String(e.date).startsWith(params.date));
        }
        return titleMatch;
      });
      if (match) {
        setSelectedEvent(match);
      }
    } else if (!params.eventName) {
      setSelectedEvent(null);
    }
  }, [params.eventName, params.date, events]);

  const now = new Date();

  // Helper to check if event is online / in-person / hybrid
  const getEventFormat = (event) => {
    return parseEventData(event).event_format;
  };

  // Filter events list
  const filteredEvents = events.filter(event => {
    // Admins see all; public sees only published
    if (!isVisualAdmin && !event.is_published) return false;

    // Time-based tab filter
    const eventDate = new Date(event.date);
    if (activeTab === 'upcoming' && eventDate < now) return false;
    if (activeTab === 'past' && eventDate >= now) return false;

    // Format / Location filter
    const format = getEventFormat(event);
    if (filterCategory === 'Online' && format !== 'online') return false;
    if (filterCategory === 'In-Person' && format !== 'in_person' && format !== 'hybrid') return false;

    // Search query filter
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (event.title || '').toLowerCase().includes(q) ||
      (event.description || '').toLowerCase().includes(q) ||
      (event.speaker || '').toLowerCase().includes(q) ||
      (event.venue || '').toLowerCase().includes(q);
      
    return matchesSearch;
  }).sort((a, b) => {
    const orderA = parseEventData(a).display_order;
    const orderB = parseEventData(b).display_order;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.date) - new Date(a.date);
  });

  const selectEvent = (event) => {
    if (event) {
      setSelectedEvent(event);
      const dateStr = new Date(event.date).toISOString().split('T')[0];
      const titleSlug = encodeURIComponent((event.title || 'event').replace(/\s+/g, '-'));
      navigate(`/Events/${titleSlug}/${dateStr}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSelectedEvent(null);
      navigate('/Events');
    }
  };

  const handleCopyLink = () => {
    if (!selectedEvent) return;
    const dateStr = new Date(selectedEvent.date).toISOString().split('T')[0];
    const titleSlug = encodeURIComponent((selectedEvent.title || 'event').replace(/\s+/g, '-'));
    const fullUrl = `${window.location.origin}/KLEF-ACM-SC/Events/${titleSlug}/${dateStr}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {});
  };

  // ---------------------------------------------------------------------------
  // ADMIN EVENT HANDLERS
  // ---------------------------------------------------------------------------
  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      date: new Date().toISOString().substring(0, 16),
      venue: '',
      speaker: '',
      registration_link: '',
      image_url: '',
      event_format: 'in_person',
      is_published: true,
      is_featured: false,
      display_order: events.length + 1,
    });
    setFormError('');
    setAdminModalOpen(true);
  };

  const handleOpenEditEvent = (event, e) => {
    if (e) e.stopPropagation();
    setEditingEvent(event);
    setEventForm({
      title: event.title || '',
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().substring(0, 16) : '',
      venue: event.venue || '',
      speaker: event.speaker || '',
      registration_link: event.registration_link || '',
      image_url: event.image_url || '',
      event_format: getEventFormat(event),
      is_published: event.is_published ?? true,
      is_featured: event.is_featured ?? false,
      display_order: event.display_order ?? 0,
    });
    setFormError('');
    setAdminModalOpen(true);
  };

  const handleDeleteEvent = async (event, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete event "${event.title}" from the database?`)) {
      return;
    }
    try {
      await api.deleteRow('events', event.id);
      await triggerDataRefresh(true);
      if (selectedEvent?.id === event.id) {
        selectEvent(null);
      }
    } catch (err) {
      alert(`Failed to delete event: ${err.message}`);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again after an error
    if (!file) return;

    setUploadingImage(true);
    setFormError('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1];
          const res = await api.uploadImage(file.name, file.type, base64);
          if (res && res.url) {
            setEventForm(prev => ({ ...prev, image_url: res.url }));
          } else {
            setFormError('Upload finished but no image URL was returned.');
          }
        } catch (uploadErr) {
          setFormError(uploadErr.message || 'Image upload failed');
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setFormError(err.message);
      setUploadingImage(false);
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date || !eventForm.venue) {
      setFormError('Please fill in Title, Date, and Venue.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const rawDesc = (eventForm.description || '').replace(/\n*<!--(?:KLEF|KLU)_EVENT:[\s\S]*?-->/g, '').trim();
      const currentOrder = Number(eventForm.display_order) || 0;
      const metadataPayload = {
        event_format: eventForm.event_format || 'in_person',
        display_order: currentOrder
      };
      const finalDesc = `${rawDesc}\n\n<!--KLEF_EVENT:${JSON.stringify(metadataPayload)}-->`;

      const payload = {
        ...eventForm,
        description: finalDesc,
        date: new Date(eventForm.date).toISOString(),
        display_order: currentOrder,
      };

      if (editingEvent) {
        payload.id = editingEvent.id;
        await api.updateRow('events', payload);
      } else {
        await api.createRow('events', payload);
      }

      await triggerDataRefresh(true);
      setAdminModalOpen(false);
      if (selectedEvent && selectedEvent.id === editingEvent?.id) {
        setSelectedEvent({ ...selectedEvent, ...payload });
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save event to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'transparent', minHeight: '80vh', paddingBottom: '88px' }}>
      {/* =======================================================================
          VIEW 1: DEDICATED FULL-PAGE EVENT DETAILS VIEW (/Events/:eventName/:date)
          ======================================================================= */}
      {selectedEvent ? (
        <div className="container" style={{ paddingTop: '40px' }}>
          {/* Top Navigation & Share Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <button
              type="button"
              onClick={() => selectEvent(null)}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '0.88rem'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to All Events</span>
            </button>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  fontSize: '0.86rem',
                  fontWeight: '700',
                  color: copiedLink ? '#059669' : 'var(--slate-700)',
                  borderColor: copiedLink ? '#10B981' : 'var(--border-light)',
                  backgroundColor: copiedLink ? '#ECFDF5' : '#FFFFFF'
                }}
                title="Copy Direct Link to Event"
              >
                {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Event'}</span>
              </button>

              {isVisualAdmin && (
                <button
                  type="button"
                  onClick={(e) => handleOpenEditEvent(selectedEvent, e)}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    fontSize: '0.86rem',
                    fontWeight: '700'
                  }}
                >
                  <Edit3 size={15} />
                  <span>Edit Event</span>
                </button>
              )}
            </div>
          </div>

          {/* Dedicated Event Article Card */}
          <article
            style={{
              backgroundColor: 'var(--card)',
              borderRadius: '16px',
              border: '1px solid var(--border-light)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
              maxWidth: '960px',
              margin: '0 auto'
            }}
          >
            {/* Event Banner (Uncropped with click-to-zoom Lightbox) */}
            {selectedEvent.image_url && (
              <div
                style={{
                  maxHeight: '440px',
                  width: '100%',
                  backgroundColor: '#070B14',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'zoom-in'
                }}
                onClick={() => setZoomedImage({ url: selectedEvent.image_url, title: selectedEvent.title })}
                title="Click to view full uncropped image"
              >
                <img
                  src={selectedEvent.image_url}
                  alt={selectedEvent.title}
                  style={{
                    maxHeight: '440px',
                    maxWidth: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(6px)',
                    color: '#FFFFFF',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Maximize2 size={13} />
                  <span>Click to Expand</span>
                </div>
              </div>
            )}

            {/* Event Details Content */}
            <div style={{ padding: 'clamp(24px, 4vw, 44px)' }}>
              {/* Badges Bar */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                {/* Status Badge */}
                {(() => {
                  const isPast = new Date(selectedEvent.date) < now;
                  return (
                    <span
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        backgroundColor: isPast ? '#DEF7EC' : '#E0F2FE',
                        color: isPast ? '#03543F' : '#0369A1',
                        border: `1px solid ${isPast ? '#BCF0DA' : '#BAE6FD'}`
                      }}
                    >
                      {isPast ? '✓ Completed Event' : '★ Upcoming Event'}
                    </span>
                  );
                })()}

                {/* Event Format Badge */}
                {(() => {
                  const fmt = getEventFormat(selectedEvent);
                  const isOnline = fmt === 'online';
                  const isHybrid = fmt === 'hybrid';
                  return (
                    <span
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        backgroundColor: isOnline ? '#F3E8FF' : (isHybrid ? '#FEF3C7' : '#F1F5F9'),
                        color: isOnline ? '#6B21A8' : (isHybrid ? '#92400E' : '#334155'),
                        border: `1px solid ${isOnline ? '#E9D5FF' : (isHybrid ? '#FDE68A' : '#E2E8F0')}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      {isOnline ? <Globe size={13} /> : <MapPin size={13} />}
                      <span>{isOnline ? 'Online / Virtual' : (isHybrid ? 'Hybrid (Online + Campus)' : 'In-Person / Offline')}</span>
                    </span>
                  );
                })()}
              </div>

              {/* Event Title */}
              <h1
                style={{
                  fontSize: 'clamp(26px, 4vw, 38px)',
                  fontWeight: '900',
                  color: 'var(--navy-900)',
                  lineHeight: '1.25',
                  letterSpacing: '0',
                  marginBottom: '24px'
                }}
              >
                {selectedEvent.title}
              </h1>

              {/* Quick Info Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  backgroundColor: '#F8FAFC',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)',
                  marginBottom: '32px'
                }}
              >
                {/* Date & Time */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: 'var(--card)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', color: '#0077B6' }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--slate-500)', letterSpacing: '0.04em' }}>Date & Schedule</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                      {new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </strong>
                    <div style={{ fontSize: '0.84rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                      {new Date(selectedEvent.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Location / Venue */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: 'var(--card)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', color: '#0077B6' }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--slate-500)', letterSpacing: '0.04em' }}>Location / Venue</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                      {selectedEvent.venue}
                    </strong>
                    <div style={{ fontSize: '0.84rem', color: 'var(--slate-600)', marginTop: '2px', textTransform: 'capitalize' }}>
                      {getEventFormat(selectedEvent).replace('_', ' ')} Format
                    </div>
                  </div>
                </div>

                {/* Speaker (if available) */}
                {selectedEvent.speaker && (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ backgroundColor: 'var(--card)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)', color: '#0077B6' }}>
                      <User size={20} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--slate-500)', letterSpacing: '0.04em' }}>Featured Speaker</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                        {selectedEvent.speaker}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Description */}
              <div style={{ marginBottom: '36px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '14px', letterSpacing: '-0.01em' }}>
                  About This Event
                </h3>
                <div
                  style={{
                    color: 'var(--slate-700)',
                    fontSize: '1.02rem',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {selectedEvent.description || 'Detailed agenda and topics for this session will be announced shortly.'}
                </div>
              </div>

              {/* Registration CTA (if registration link is present) */}
              {selectedEvent.registration_link && (
                <div
                  style={{
                    padding: '24px',
                    borderRadius: '12px',
                    backgroundColor: '#F0F9FF',
                    border: '1.5px solid #BAE6FD',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0369A1', margin: '0 0 4px 0' }}>
                      Interested in Participating?
                    </h4>
                    <p style={{ color: '#0C4A6E', fontSize: '0.92rem', margin: 0 }}>
                      Secure your seat and receive calendar reminders and event materials.
                    </p>
                  </div>

                  <a
                    href={selectedEvent.registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(0, 119, 182, 0.25)'
                    }}
                  >
                    <span>Register For This Event</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}
            </div>
          </article>
        </div>
      ) : (
        /* =======================================================================
            VIEW 2: MAIN EVENTS CATALOG GRID VIEW (/Events)
            ======================================================================= */
        <>
          {/* Editorial Header */}
          <section className="page-hero bg-mesh">
        <div className="orb orb-red" />
        <div className="orb orb-blue" />
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ maxWidth: '740px' }}>
                  <VisualEditable
                    name="events_tag"
                    as="span"
                    defaultValue="CHAPTER CATALOG"
                    className="editorial-kicker"
                  />
                  <VisualEditable
                    name="events_title"
                    as="h1"
                    defaultValue="Chapter Activities & Events"
                    style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800', color: 'var(--navy-900)', letterSpacing: '0', marginBottom: '12px', lineHeight: '1.2' }}
                  />
                  <VisualEditable
                    name="events_subtitle"
                    as="p"
                    defaultValue="Browse upcoming bootcamps, technical lectures, hands-on workshops, and past sessions organized by KLEF ACM."
                    style={{ color: 'var(--slate-600)', fontSize: '1.05rem', lineHeight: '1.65', margin: 0 }}
                  />
                </div>

                {/* Admin Add Event Button */}
                {isVisualAdmin && (
                  <button
                    type="button"
                    onClick={handleOpenAddEvent}
                    className="btn btn-primary"
                    style={{
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus size={18} />
                    <span>Add Event</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Filter & Search Bar */}
          <div className="container" style={{ marginTop: '40px' }}>
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                backgroundColor: 'var(--card)', 
                padding: '14px 18px', 
                borderRadius: '4px', 
                border: '1px solid var(--border-light)',
                gap: '20px',
                flexWrap: 'wrap'
              }}
              className="filters-row"
            >
              {/* Tabs: All / Upcoming / Past */}
              <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--slate-100)', padding: '3px', borderRadius: '4px' }}>
                <button 
                  onClick={() => setActiveTab('all')} 
                  style={{
                    padding: '6px 14px',
                    borderRadius: '2px',
                    fontSize: '0.82rem',
                    fontWeight: activeTab === 'all' ? '700' : '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'all' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'all' ? 'var(--primary)' : 'var(--slate-600)',
                    boxShadow: activeTab === 'all' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  All Events ({events.length})
                </button>
                <button 
                  onClick={() => setActiveTab('upcoming')} 
                  style={{
                    padding: '6px 14px',
                    borderRadius: '2px',
                    fontSize: '0.82rem',
                    fontWeight: activeTab === 'upcoming' ? '700' : '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'upcoming' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'upcoming' ? 'var(--primary)' : 'var(--slate-600)',
                    boxShadow: activeTab === 'upcoming' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  Upcoming ({events.filter(e => new Date(e.date) >= now).length})
                </button>
                <button 
                  onClick={() => setActiveTab('past')} 
                  style={{
                    padding: '6px 14px',
                    borderRadius: '2px',
                    fontSize: '0.82rem',
                    fontWeight: activeTab === 'past' ? '700' : '600',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === 'past' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'past' ? 'var(--primary)' : 'var(--slate-600)',
                    boxShadow: activeTab === 'past' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  Past ({events.filter(e => new Date(e.date) < now).length})
                </button>
              </div>

              {/* Search Box and Format Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end', minWidth: '280px' }}>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--slate-300)',
                    backgroundColor: 'var(--card)',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    color: 'var(--navy-700)'
                  }}
                >
                  <option value="all">All Locations (Online & In-Person)</option>
                  <option value="Online">Online / Virtual</option>
                  <option value="In-Person">In-Person / Campus</option>
                </select>

                <div style={{ position: 'relative', width: '100%', maxWidth: '240px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--slate-400)' }} />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 34px',
                      borderRadius: '4px',
                      border: '1px solid var(--slate-300)',
                      backgroundColor: 'var(--card)',
                      fontSize: '0.84rem',
                      color: 'var(--navy-900)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Events List Grid */}
          <section style={{ padding: '40px 0' }}>
            <div className="container">
              {filteredEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 20px', border: '1px dashed var(--slate-300)', borderRadius: '4px', backgroundColor: 'var(--card)' }}>
                  <Calendar size={44} style={{ color: 'var(--slate-400)', margin: '0 auto 16px auto' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '8px' }}>No Events Scheduled</h3>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>There are currently no events matching your selected filter.</p>
                  {isVisualAdmin && (
                    <button
                      type="button"
                      onClick={handleOpenAddEvent}
                      className="btn btn-primary"
                      style={{ marginTop: '16px', borderRadius: '4px' }}
                    >
                      <Plus size={16} /> Add First Event
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {isVisualAdmin && filteredEvents.length > 0 && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '24px', backgroundColor: '#F0F9FF', border: '1.5px solid #BAE6FD', color: '#0369A1', fontSize: '0.86rem', fontWeight: '700', marginBottom: '24px' }}>
                      <GripVertical size={16} />
                      <span>✨ Drag & Drop any event to reorder, or use the arrow buttons!</span>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' }}>
                    {filteredEvents.map((event, idx) => {
                      const isPast = new Date(event.date) < now;
                      const format = getEventFormat(event);
                      const cardElement = (
                        <motion.div 
                          layout
                          layoutId={`event-${event.id || idx}`}
                          key={event.id || idx}
                          draggable={isVisualAdmin}
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDragLeave={(e) => handleDragLeave(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={handleDragEnd}
                          className="event-card-container"
                          style={{
                            backgroundColor: 'var(--card)',
                            borderRadius: '12px',
                            border: dragOverIdx === idx && draggedIdx !== idx ? '2px dashed #0077B6' : '1px solid var(--border-light)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            position: 'relative',
                            cursor: isVisualAdmin ? (draggedIdx === idx ? 'grabbing' : 'grab') : 'pointer',
                            opacity: draggedIdx === idx ? 0.35 : 1,
                            transform: dragOverIdx === idx && draggedIdx !== idx ? 'scale(1.02)' : 'none',
                            boxShadow: dragOverIdx === idx && draggedIdx !== idx ? '0 16px 36px rgba(0, 119, 182, 0.2)' : '0 4px 18px rgba(0,0,0,0.04)',
                            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
                          }}
                          onClick={() => {
                            if (!isVisualAdmin || draggedIdx === null) {
                              selectEvent(event);
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (!isVisualAdmin) {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 119, 182, 0.08)';
                              e.currentTarget.style.borderColor = '#0077B6';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isVisualAdmin) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.04)';
                              e.currentTarget.style.borderColor = 'var(--border-light)';
                            }
                          }}
                        >
                          {/* Event Banner */}
                          <div style={{ height: '200px', backgroundColor: 'var(--navy-950)', position: 'relative', overflow: 'hidden' }}>
                            <SafeImage
                              src={event.image_url}
                              alt={event.title}
                              fallbackIcon={Calendar}
                              fallbackText="Event Photograph"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(7,11,20,0.75) 100%)' }} />
                            
                            {/* Status Badge */}
                            <span 
                              style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                backgroundColor: isPast ? '#059669' : 'var(--primary)',
                                color: '#FFFFFF',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                              }}
                            >
                              {isPast ? 'Completed' : 'Upcoming'}
                            </span>

                            {/* Format Badge on Banner */}
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '12px',
                                left: '12px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                                color: '#FFFFFF',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255,255,255,0.2)'
                              }}
                            >
                              {format === 'online' ? '🌐 Online' : (format === 'hybrid' ? '🔄 Hybrid' : '📍 Campus')}
                            </span>
                          </div>

                          {/* Card Content */}
                          <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              {/* Date row */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px' }}>
                                <Calendar size={13} />
                                <span>{new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                              </div>

                              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--navy-900)', lineHeight: '1.3', marginBottom: '8px', letterSpacing: '-0.015em' }}>
                                {event.title}
                              </h3>

                              <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                                {event.description?.substring(0, 110)}...
                              </p>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: '500' }}>
                                📍 {event.venue}
                              </span>
                              <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                View Details <ArrowRight size={13} />
                              </span>
                            </div>
                          </div>

                          {/* Admin Action & Reorder Overlay */}
                          {isVisualAdmin && (
                            <div 
                              style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                right: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                zIndex: 10,
                                pointerEvents: 'auto'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(15, 23, 42, 0.92)', padding: '4px 6px', borderRadius: '8px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                                <div 
                                  title="Drag to reposition event"
                                  style={{ cursor: 'grab', display: 'flex', alignItems: 'center', gap: '3px', color: '#94A3B8', padding: '2px 4px', userSelect: 'none' }}
                                >
                                  <GripVertical size={14} color="#CBD5E1" />
                                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#F8FAFC' }}>#{idx + 1}</span>
                                </div>

                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  title="Move Earlier"
                                  onClick={(e) => handleMoveEvent(idx, -1, e)}
                                  style={{
                                    padding: '4px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: idx === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.12)',
                                    color: idx === 0 ? 'rgba(255,255,255,0.25)' : '#FFFFFF',
                                    border: 'none',
                                    cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  <MoveUp size={13} />
                                </button>

                                <button
                                  type="button"
                                  disabled={idx === filteredEvents.length - 1}
                                  title="Move Later"
                                  onClick={(e) => handleMoveEvent(idx, 1, e)}
                                  style={{
                                    padding: '4px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: idx === filteredEvents.length - 1 ? 'transparent' : 'rgba(255, 255, 255, 0.12)',
                                    color: idx === filteredEvents.length - 1 ? 'rgba(255,255,255,0.25)' : '#FFFFFF',
                                    border: 'none',
                                    cursor: idx === filteredEvents.length - 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  <MoveDown size={13} />
                                </button>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                  type="button"
                                  title="Edit Event"
                                  onClick={(e) => handleOpenEditEvent(event, e)}
                                  style={{
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: '#0F172A',
                                    color: '#5BBAE4',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                  }}
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  title="Delete Event"
                                  onClick={(e) => handleDeleteEvent(event, e)}
                                  style={{
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: '#DC2626',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );

                      return isVisualAdmin ? (
                        cardElement
                      ) : (
                        <ScrollReveal key={event.id || idx} delay={idx * 40} duration={500} yOffset={16}>
                          {cardElement}
                        </ScrollReveal>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Free-Form Dynamic Content Blocks */}
              <PageBlockList blockKey="events_blocks" style={{ marginTop: '48px' }} />
            </div>
          </section>
        </>
      )}

      {/* =======================================================================
          ADMIN VISUAL EVENT FORM MODAL (WITH ONLINE/OFFLINE FORMAT)
          ======================================================================= */}
      {adminModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 96000,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setAdminModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--card)',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button
                type="button"
                onClick={() => setAdminModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '18px', fontWeight: '600' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Hackathon: Code Innovate 2026"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              {/* Format / Mode Selector (Online vs Offline/In-Person) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                    Event Format / Mode *
                  </label>
                  <select
                    value={eventForm.event_format}
                    onChange={(e) => setEventForm({ ...eventForm, event_format: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '600', backgroundColor: 'var(--card)' }}
                  >
                    <option value="in_person">In-Person (Offline on Campus)</option>
                    <option value="online">Online (Virtual Webinar / Meeting)</option>
                    <option value="hybrid">Hybrid (In-Person + Online Stream)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                    Venue / Room / Link *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE Seminar Hall or Zoom Meeting"
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                    Event Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                    Display Order / Position
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1, 2, 3..."
                    value={eventForm.display_order ?? ''}
                    onChange={(e) => setEventForm({ ...eventForm, display_order: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                    Keynote Speaker / Host
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. A. Sharma (ACM Distinguished)"
                    value={eventForm.speaker}
                    onChange={(e) => setEventForm({ ...eventForm, speaker: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                    Registration Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://forms.gle/..."
                    value={eventForm.registration_link}
                    onChange={(e) => setEventForm({ ...eventForm, registration_link: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              {/* Event Image Banner Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  Event Poster / Banner
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Image URL or upload from local files"
                    value={eventForm.image_url}
                    onChange={(e) => setEventForm({ ...eventForm, image_url: e.target.value })}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    <span>{uploadingImage ? 'Uploading…' : 'Upload'}</span>
                  </button>
                </div>
                {eventForm.image_url && (
                  <div style={{ marginTop: '10px', position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1', maxHeight: '180px', background: '#f1f5f9' }}>
                    <img src={eventForm.image_url} alt="Banner preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }}
                      onError={() => setFormError('The banner image URL could not be loaded. Check the link or upload again.')} />
                    <button type="button" onClick={() => setEventForm(prev => ({ ...prev, image_url: '' }))}
                      style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'rgba(15,23,42,0.75)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide comprehensive details about the session structure, prerequisites, takeaways..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', lineHeight: '1.6' }}
                />
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={eventForm.is_published}
                    onChange={(e) => setEventForm({ ...eventForm, is_published: e.target.checked })}
                  />
                  <span>Published to Public Site</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={eventForm.is_featured}
                    onChange={(e) => setEventForm({ ...eventForm, is_featured: e.target.checked })}
                  />
                  <span>Feature on Home Page</span>
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'var(--card)', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', borderRadius: '8px', fontWeight: '800', backgroundColor: '#0077B6', borderColor: '#0077B6' }}
                >
                  {isSubmitting ? 'Saving to Database...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-Screen High-Resolution Event Photo Lightbox Modal */}
      {zoomedImage && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 2147483647,
            backgroundColor: 'rgba(5, 10, 20, 0.95)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
          onClick={() => setZoomedImage(null)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomedImage(null);
            }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '24px',
              zIndex: 2147483647,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              transition: 'background-color 0.2s ease, transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Close (Esc)"
          >
            <X size={22} />
          </button>

          {/* Lightbox Image */}
          <div
            style={{
              maxWidth: '92vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedImage.url}
              alt={zoomedImage.title || 'Full resolution event image'}
              style={{
                maxWidth: '92vw',
                maxHeight: '82vh',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                display: 'block'
              }}
            />
            {zoomedImage.title && (
              <div style={{
                marginTop: '14px',
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: '700',
                letterSpacing: '-0.01em',
                textAlign: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                padding: '8px 20px',
                borderRadius: '999px',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {zoomedImage.title}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
