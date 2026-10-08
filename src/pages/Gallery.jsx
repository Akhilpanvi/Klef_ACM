import { useContext, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Upload, 
  Loader2,
  Calendar,
  Layers,
  ArrowLeft,
  Share2,
  Check,
  Maximize2,
  Edit3,
  ExternalLink,
  Info,
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

import { parseGalleryItem } from '../utils/dataHelpers.jsx';


export default function Gallery({ isVisualAdmin = false, isEditMode = false }) {
  const { siteData, setSiteData, triggerDataRefresh } = useContext(SiteDataContext);
  const rawGallery = siteData?.gallery || [];
  const gallery = [...rawGallery].sort((a, b) => {
    const orderA = parseGalleryItem(a).display_order;
    const orderB = parseGalleryItem(b).display_order;
    if (orderA !== orderB) return orderA - orderB;
    return (b.id || 0) - (a.id || 0);
  });
  const params = useParams();
  const navigate = useNavigate();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [zoomedPhoto, setZoomedPhoto] = useState(null); // { url, title, index, total }
  const [copiedLink, setCopiedLink] = useState(false);

  // Admin Add / Edit Event Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    description: '',
    images: [''],
    category: 'workshops'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [isUploadingMulti, setIsUploadingMulti] = useState(false);
  const multiFileInputRef = useRef(null);

  // Drag and drop interactive reordering states
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const dragSourceRef = useRef(null);

  // Reorder Gallery Items Handler
  const handleMoveGalleryItem = async (index, direction, e) => {
    e?.stopPropagation();
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= gallery.length) return;

    const updatedList = [...gallery];
    const [movedItem] = updatedList.splice(index, 1);
    updatedList.splice(targetIdx, 0, movedItem);

    const updateItemWithOrder = (item, newOrder) => {
      const parsed = parseGalleryItem(item);
      const cleanDesc = (item.description || item.bio || '').replace(/\n*<!--(?:KLEF|KLU)_GALLERY:[\s\S]*?-->/g, '').trim();
      const metadataPayload = {
        images: parsed.images,
        date: parsed.date || null,
        description: cleanDesc,
        display_order: newOrder
      };
      const serializedTag = `\n\n<!--KLEF_GALLERY:${JSON.stringify(metadataPayload)}-->`;
      return {
        ...item,
        display_order: newOrder,
        description: `${cleanDesc}${serializedTag}`
      };
    };

    const updatedPayloads = updatedList.map((item, idx) => updateItemWithOrder(item, idx + 1));

    // Optimistic instant UI update
    if (setSiteData) {
      setSiteData(prev => ({ ...prev, gallery: updatedPayloads }));
    }

    try {
      await Promise.all(updatedPayloads.map(payload => api.updateRow('gallery_images', payload)));
      await triggerDataRefresh(true);
    } catch (err) {
      console.error('Failed to move gallery item:', err);
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

    const updatedList = [...gallery];
    const [movedItem] = updatedList.splice(sourceIdx, 1);
    updatedList.splice(targetIdx, 0, movedItem);

    const updateItemWithOrder = (item, newOrder) => {
      const parsed = parseGalleryItem(item);
      const cleanDesc = (item.description || item.bio || '').replace(/\n*<!--(?:KLEF|KLU)_GALLERY:[\s\S]*?-->/g, '').trim();
      const metadataPayload = {
        images: parsed.images,
        date: parsed.date || null,
        description: cleanDesc,
        display_order: newOrder
      };
      const serializedTag = `\n\n<!--KLEF_GALLERY:${JSON.stringify(metadataPayload)}-->`;
      return {
        ...item,
        display_order: newOrder,
        description: `${cleanDesc}${serializedTag}`
      };
    };

    const updatedPayloads = updatedList.map((item, idx) => updateItemWithOrder(item, idx + 1));

    // Optimistic instant UI update
    if (setSiteData) {
      setSiteData(prev => ({ ...prev, gallery: updatedPayloads }));
    }
    setDraggedIdx(null);
    dragSourceRef.current = null;

    try {
      await Promise.all(updatedPayloads.map(payload => api.updateRow('gallery_images', payload)));
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

  // Deep Link Matcher for /Gallery/:eventTitle
  useEffect(() => {
    if (params.eventTitle && gallery.length > 0) {
      const targetSlug = decodeURIComponent(params.eventTitle).toLowerCase().replace(/-/g, ' ');
      const match = gallery.find(item => {
        const parsed = parseGalleryItem(item);
        const cleanT = parsed.title.toLowerCase();
        return cleanT === targetSlug || cleanT.replace(/\s+/g, '-') === params.eventTitle.toLowerCase();
      });
      if (match) {
        setSelectedEvent(match);
        setActiveSlideIndex(0);
      }
    } else if (!params.eventTitle) {
      setSelectedEvent(null);
    }
  }, [params.eventTitle, gallery]);

  // Lock body scroll and handle keyboard for Lightbox Popup
  useEffect(() => {
    if (zoomedPhoto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (zoomedPhoto) setZoomedPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoomedPhoto]);

  // Navigate to Event Detail Post
  const selectEvent = (item) => {
    if (!item) {
      setSelectedEvent(null);
      navigate('/Gallery', { replace: false });
      return;
    }
    setSelectedEvent(item);
    setActiveSlideIndex(0);
    const parsed = parseGalleryItem(item);
    const slug = encodeURIComponent(parsed.title.trim().replace(/\s+/g, '-'));
    navigate(`/Gallery/${slug}`, { replace: false });
  };

  const handleCopyEventLink = (item) => {
    const parsed = parseGalleryItem(item);
    const slug = encodeURIComponent(parsed.title.trim().replace(/\s+/g, '-'));
    const url = `${window.location.origin}/KLEF-ACM-SC/Gallery/${slug}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // ---------------------------------------------------------------------------
  // ADMIN EVENT GALLERY CRUD HANDLERS
  // ---------------------------------------------------------------------------
  const handleOpenAddEvent = () => {
    setEditingItem(null);
    setEventForm({
      title: '',
      date: '',
      description: '',
      images: [''],
      category: 'workshops'
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditEvent = (item, e) => {
    e?.stopPropagation();
    setEditingItem(item);
    const parsed = parseGalleryItem(item);
    setEventForm({
      title: parsed.title,
      date: parsed.date || '',
      description: parsed.description || '',
      images: parsed.images.length > 0 ? parsed.images : [''],
      category: item.category || 'workshops'
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleAddImageField = () => {
    setEventForm(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const handleUpdateImageField = (index, value) => {
    setEventForm(prev => {
      const nextImgs = [...prev.images];
      nextImgs[index] = value;
      return { ...prev, images: nextImgs };
    });
  };

  const handleRemoveImageField = (index) => {
    setEventForm(prev => {
      const nextImgs = prev.images.filter((_, idx) => idx !== index);
      return { ...prev, images: nextImgs.length > 0 ? nextImgs : [''] };
    });
  };

  // Multi-file upload from computer
  const handleMultiFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingMulti(true);
    setFormError('');

    try {
      const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64 = reader.result.split(',')[1];
              const res = await api.uploadImage(file.name, file.type, base64);
              if (res && res.url) resolve(res.url);
              else reject(new Error(`Failed to upload ${file.name}`));
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = () => reject(new Error(`Error reading ${file.name}`));
          reader.readAsDataURL(file);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setEventForm(prev => {
        const filteredCurrent = prev.images.filter(img => img.trim().length > 0);
        return {
          ...prev,
          images: [...filteredCurrent, ...uploadedUrls]
        };
      });
    } catch (err) {
      setFormError(err.message || 'Failed to upload one or more photographs');
    } finally {
      setIsUploadingMulti(false);
      if (multiFileInputRef.current) multiFileInputRef.current.value = '';
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.title.trim()) {
      setFormError('Event / Album Name is required.');
      return;
    }

    const cleanImages = eventForm.images.map(img => img.trim()).filter(Boolean);
    if (cleanImages.length === 0) {
      setFormError('At least one photograph is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const cleanDesc = (eventForm.description || '').replace(/\n*<!--(?:KLEF|KLU)_GALLERY:[\s\S]*?-->/g, '').trim();
      const currentOrder = Number(eventForm.display_order) || 0;
      const metadataPayload = {
        images: cleanImages,
        date: eventForm.date ? eventForm.date.trim() : null,
        description: cleanDesc,
        display_order: currentOrder
      };

      const serializedTag = `\n\n<!--KLEF_GALLERY:${JSON.stringify(metadataPayload)}-->`;
      const finalDescription = `${cleanDesc}${serializedTag}`;

      const rowPayload = {
        caption: eventForm.title.trim(),
        url: cleanImages[0],
        category: eventForm.category || 'workshops',
        description: finalDescription,
        event_date: eventForm.date ? eventForm.date.trim() : null,
        images: cleanImages,
        display_order: currentOrder
      };

      if (editingItem?.id) {
        rowPayload.id = editingItem.id;
        await api.updateRow('gallery_images', rowPayload);
      } else {
        await api.createRow('gallery_images', rowPayload);
      }

      await triggerDataRefresh(true);
      setModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Save gallery event error:', err);
      setFormError(err.message || 'Failed to save gallery event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (item, e) => {
    e?.stopPropagation();
    const parsed = parseGalleryItem(item);
    if (!window.confirm(`Are you sure you want to delete "${parsed.title}" and its photographs?`)) {
      return;
    }

    try {
      await api.deleteRow('gallery_images', item.id);
      await triggerDataRefresh(true);
      if (selectedEvent?.id === item.id) {
        setSelectedEvent(null);
        navigate('/Gallery', { replace: true });
      }
    } catch (err) {
      alert(`Failed to delete event: ${err.message}`);
    }
  };

  // Active parsed event data for single post detail view
  const currentEventData = selectedEvent ? parseGalleryItem(selectedEvent) : null;
  const currentImages = currentEventData?.images || [];

  return (
    <div style={{ backgroundColor: 'transparent', minHeight: '80vh', paddingBottom: '88px' }}>
      
      {/* Editorial Header */}
      <section className="page-hero bg-mesh">
        <div className="orb orb-red" />
        <div className="orb orb-blue" />
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ maxWidth: '760px' }}>
              <VisualEditable
                name="gallery_tag"
                as="span"
                defaultValue="CHAPTER ARCHIVE"
                className="editorial-kicker"
              />
              <VisualEditable
                name="gallery_title"
                as="h1"
                defaultValue="Visual Documentation & Gallery"
                style={{
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  fontWeight: '800',
                  color: 'var(--navy-900)',
                  letterSpacing: '0',
                  marginBottom: '12px',
                  lineHeight: '1.2',
                }}
              />
              <VisualEditable
                name="gallery_subtitle"
                as="p"
                defaultValue="A visual journey through KLEF ACM’s legacy, capturing memorable moments from hands-on hackathons, technical bootcamps, workshops, and community volunteer meetups."
                style={{
                  color: 'var(--slate-600)',
                  fontSize: '1.05rem',
                  lineHeight: '1.65',
                  margin: 0,
                }}
              />
            </div>

            {/* Admin Add Photos / Event Button */}
            {isVisualAdmin && (
              <button
                type="button"
                onClick={handleOpenAddEvent}
                className="btn btn-primary"
                style={{
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 22px',
                  fontWeight: '700'
                }}
              >
                <Plus size={18} />
                <span>Add Event Photos</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container" style={{ marginTop: '40px' }}>
        
        <AnimatePresence mode="wait">
          {/* ===================================================================
              VIEW 1: INSTAGRAM-STYLE MULTI-PICTURE EVENT POST DETAIL VIEW
              =================================================================== */}
          {selectedEvent && currentEventData ? (
            <motion.div
              key={selectedEvent.id || 'event-detail'}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ maxWidth: '860px', margin: '0 auto' }}
            >
              {/* Back Button & Actions Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => selectEvent(null)}
                  className="btn btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.88rem'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Gallery</span>
                </button>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyEventLink(selectedEvent)}
                    className="btn btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '0.86rem',
                      fontWeight: '600'
                    }}
                  >
                    {copiedLink ? <Check size={16} color="#16A34A" /> : <Share2 size={16} />}
                    <span>{copiedLink ? 'Link Copied!' : 'Share Post'}</span>
                  </button>

                  {isVisualAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditEvent(selectedEvent, e)}
                        className="btn btn-primary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          fontSize: '0.86rem',
                          fontWeight: '700'
                        }}
                      >
                        <Edit3 size={15} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteEvent(selectedEvent, e)}
                        className="btn btn-secondary"
                        style={{
                          color: '#DC2626',
                          borderColor: '#FECDD3',
                          backgroundColor: '#FFF1F2',
                          padding: '10px 14px',
                          borderRadius: '8px'
                        }}
                        title="Delete Event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Instagram-Style Post Frame */}
              <div
                style={{
                  backgroundColor: 'var(--card)',
                  borderRadius: '20px',
                  border: '1.5px solid var(--border-light)',
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden'
                }}
              >
                {/* 1. Instagram Post Multi-Image Slide Viewport */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    backgroundColor: '#090D16',
                    height: 'min(68vh, 560px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    userSelect: 'none'
                  }}
                >
                  {/* Current Active Image */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'zoom-in'
                    }}
                    onClick={() => {
                      if (currentImages[activeSlideIndex]) {
                        setZoomedPhoto({
                          url: currentImages[activeSlideIndex],
                          title: currentEventData.title,
                          index: activeSlideIndex + 1,
                          total: currentImages.length
                        });
                      }
                    }}
                    title="Click to view full screen"
                  >
                    <SafeImage
                      key={currentImages[activeSlideIndex] || activeSlideIndex}
                      src={currentImages[activeSlideIndex]}
                      alt={`${currentEventData.title} - Photo ${activeSlideIndex + 1}`}
                      fallbackIcon={ImageIcon}
                      fallbackText="Event Photo"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  </div>

                  {/* Top-Right Multi-Photo Counter Badge */}
                  {currentImages.length > 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(8px)',
                        color: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        zIndex: 10,
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                      }}
                    >
                      <Layers size={13} />
                      <span>{activeSlideIndex + 1} / {currentImages.length}</span>
                    </div>
                  )}

                  {/* Fullscreen Zoom Trigger Icon in bottom-right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentImages[activeSlideIndex]) {
                        setZoomedPhoto({
                          url: currentImages[activeSlideIndex],
                          title: currentEventData.title,
                          index: activeSlideIndex + 1,
                          total: currentImages.length
                        });
                      }
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '16px',
                      right: '16px',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(6px)',
                      color: '#FFFFFF',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 10,
                      transition: 'transform 0.2s ease'
                    }}
                    title="Expand photo"
                  >
                    <Maximize2 size={16} />
                  </button>

                  {/* Left Arrow Button */}
                  {currentImages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlideIndex(prev => (prev === 0 ? currentImages.length - 1 : prev - 1));
                      }}
                      style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        backdropFilter: 'blur(8px)',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '50%',
                        width: '42px',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                      title="Previous photo"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  )}

                  {/* Right Arrow Button */}
                  {currentImages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlideIndex(prev => (prev === currentImages.length - 1 ? 0 : prev + 1));
                      }}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        backdropFilter: 'blur(8px)',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '50%',
                        width: '42px',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                      title="Next photo"
                    >
                      <ChevronRight size={24} />
                    </button>
                  )}

                  {/* Instagram-Style Bottom Dots Indicator */}
                  {currentImages.length > 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        backdropFilter: 'blur(6px)',
                        zIndex: 10
                      }}
                    >
                      {currentImages.map((_, dotIdx) => (
                        <div
                          key={dotIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlideIndex(dotIdx);
                          }}
                          style={{
                            width: dotIdx === activeSlideIndex ? '18px' : '7px',
                            height: '7px',
                            borderRadius: '4px',
                            backgroundColor: dotIdx === activeSlideIndex ? '#5BBAE4' : 'rgba(255, 255, 255, 0.4)',
                            transition: 'all 0.25s ease',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip (Instagram style quick navigation) */}
                {currentImages.length > 1 && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '12px 24px',
                      backgroundColor: '#F8FAFC',
                      borderBottom: '1px solid var(--border-light)',
                      overflowX: 'auto'
                    }}
                  >
                    {currentImages.map((imgUrl, thumbIdx) => (
                      <div
                        key={thumbIdx}
                        onClick={() => setActiveSlideIndex(thumbIdx)}
                        style={{
                          width: '60px',
                          height: '46px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: thumbIdx === activeSlideIndex ? '2px solid var(--primary)' : '1px solid #CBD5E1',
                          opacity: thumbIdx === activeSlideIndex ? 1 : 0.65,
                          flexShrink: 0,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <SafeImage
                          src={imgUrl}
                          alt="thumbnail"
                          fallbackIcon={ImageIcon}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Post Details / Content Section */}
                <div style={{ padding: '32px 36px' }}>
                  
                  {/* Event Title */}
                  <h1
                    style={{
                      fontSize: 'clamp(24px, 3.5vw, 32px)',
                      fontWeight: '800',
                      color: 'var(--navy-900)',
                      margin: '0 0 14px 0',
                      letterSpacing: '0',
                      lineHeight: '1.25'
                    }}
                  >
                    {currentEventData.title}
                  </h1>

                  {/* Optional Event Date Badge (Shown ONLY if present, otherwise empty) */}
                  {currentEventData.date && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#F0F9FF',
                        color: '#0369A1',
                        border: '1px solid #BAE6FD',
                        fontSize: '0.84rem',
                        fontWeight: '700',
                        marginBottom: '20px'
                      }}
                    >
                      <Calendar size={14} />
                      <span>{currentEventData.date}</span>
                    </div>
                  )}

                  {/* Optional Event Description / Bio (Shown ONLY if present, otherwise empty) */}
                  {currentEventData.description && (
                    <div
                      style={{
                        marginTop: currentEventData.date ? '0' : '8px',
                        paddingTop: '16px',
                        borderTop: '1px solid #F1F5F9',
                        color: 'var(--slate-700)',
                        fontSize: '1rem',
                        lineHeight: '1.75',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {currentEventData.description}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* ===================================================================
               VIEW 2: MAIN GALLERY GRID (SHOWS ONLY PIC NAME AND PIC)
               =================================================================== */
            <motion.div
              key="gallery-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {gallery.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 20px', border: '1.5px dashed var(--slate-300)', borderRadius: '16px', backgroundColor: 'var(--card)' }}>
                  <ImageIcon size={48} style={{ color: 'var(--slate-400)', margin: '0 auto 16px auto' }} />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '8px' }}>No Event Photographs Available</h3>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>Photographs and albums from chapter activities will appear here.</p>
                  {isVisualAdmin && (
                    <button
                      type="button"
                      onClick={handleOpenAddEvent}
                      className="btn btn-primary"
                      style={{ marginTop: '16px', borderRadius: '6px' }}
                    >
                      <Plus size={16} /> Add First Event Gallery
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {isVisualAdmin && gallery.length > 0 && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '24px', backgroundColor: '#F0F9FF', border: '1.5px solid #BAE6FD', color: '#0369A1', fontSize: '0.86rem', fontWeight: '700', marginBottom: '24px' }}>
                      <GripVertical size={16} />
                      <span>✨ Drag & Drop any photo album to reorder, or use the arrow buttons!</span>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                    {gallery.map((item, idx) => {
                      const parsed = parseGalleryItem(item);
                      const photoCount = parsed.images.length;

                      const cardElement = (
                        <motion.div 
                          layout
                          layoutId={`gallery-${item.id || idx}`}
                          key={item.id || idx}
                          draggable={isVisualAdmin}
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDragLeave={(e) => handleDragLeave(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={handleDragEnd}
                          style={{
                            backgroundColor: 'var(--card)',
                            borderRadius: '16px',
                            border: dragOverIdx === idx && draggedIdx !== idx ? '2px dashed #0077B6' : '1.5px solid var(--border-light)',
                            boxShadow: dragOverIdx === idx && draggedIdx !== idx ? '0 16px 36px rgba(0, 119, 182, 0.2)' : '0 4px 18px rgba(0, 0, 0, 0.04)',
                            overflow: 'hidden',
                            cursor: isVisualAdmin ? (draggedIdx === idx ? 'grabbing' : 'grab') : 'pointer',
                            position: 'relative',
                            opacity: draggedIdx === idx ? 0.35 : 1,
                            transform: dragOverIdx === idx && draggedIdx !== idx ? 'scale(1.02)' : 'none',
                            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, opacity 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%'
                          }}
                          className="gallery-editorial-card"
                          onClick={() => {
                            if (!isVisualAdmin || draggedIdx === null) {
                              selectEvent(item);
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (!isVisualAdmin) {
                              e.currentTarget.style.transform = 'translateY(-6px)';
                              e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 119, 182, 0.12)';
                              e.currentTarget.style.borderColor = '#0077B6';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isVisualAdmin) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 0, 0, 0.04)';
                              e.currentTarget.style.borderColor = 'var(--border-light)';
                            }
                          }}
                        >
                          {/* Event Cover Photograph */}
                          <div style={{ height: '240px', backgroundColor: '#090D16', overflow: 'hidden', position: 'relative' }}>
                            <SafeImage
                              src={parsed.coverUrl}
                              alt={parsed.title}
                              fallbackIcon={ImageIcon}
                              fallbackText="Event Photo"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />

                            {/* Multi-Image Badge Indicator (Like Instagram carousel) */}
                            {photoCount > 1 && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '12px',
                                  right: '12px',
                                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                  backdropFilter: 'blur(6px)',
                                  color: '#FFFFFF',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: '800',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}
                              >
                                <Layers size={12} />
                                <span>{photoCount} Photos</span>
                              </div>
                            )}
                          </div>

                          {/* Card Content: ONLY Event Picture Name */}
                          <div style={{ padding: '18px 20px', flex: 1, display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--navy-900)', margin: 0, lineHeight: '1.35', letterSpacing: '-0.01em' }}>
                              {parsed.title}
                            </h3>
                          </div>

                          {/* Admin Action & Reorder Overlay on Card */}
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
                                  title="Drag to reposition album"
                                  style={{ cursor: 'grab', display: 'flex', alignItems: 'center', gap: '3px', color: '#94A3B8', padding: '2px 4px', userSelect: 'none' }}
                                >
                                  <GripVertical size={14} color="#CBD5E1" />
                                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#F8FAFC' }}>#{idx + 1}</span>
                                </div>

                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  title="Move Earlier"
                                  onClick={(e) => handleMoveGalleryItem(idx, -1, e)}
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
                                  disabled={idx === gallery.length - 1}
                                  title="Move Later"
                                  onClick={(e) => handleMoveGalleryItem(idx, 1, e)}
                                  style={{
                                    padding: '4px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: idx === gallery.length - 1 ? 'transparent' : 'rgba(255, 255, 255, 0.12)',
                                    color: idx === gallery.length - 1 ? 'rgba(255,255,255,0.25)' : '#FFFFFF',
                                    border: 'none',
                                    cursor: idx === gallery.length - 1 ? 'not-allowed' : 'pointer',
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
                                  onClick={(e) => handleOpenEditEvent(item, e)}
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
                                  onClick={(e) => handleDeleteEvent(item, e)}
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
                        <ScrollReveal key={item.id || idx} delay={idx * 30} duration={500} yOffset={16}>
                          {cardElement}
                        </ScrollReveal>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Free-form Page Blocks */}
        {!selectedEvent && (
          <PageBlockList blockKey="gallery_blocks" style={{ marginTop: '48px' }} />
        )}
      </div>

      {/* =======================================================================
          FULL-SCREEN PHOTO LIGHTBOX (Portaled directly to document.body, covers header)
          ======================================================================= */}
      {zoomedPhoto && typeof document !== 'undefined' && createPortal(
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
            padding: '16px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
          onClick={() => setZoomedPhoto(null)}
        >
          {/* Top-Right Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomedPhoto(null);
            }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '24px',
              zIndex: 2147483647,
              background: 'rgba(255, 255, 255, 0.22)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '50%',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Close (Esc)"
          >
            <X size={26} />
          </button>

          {/* Centered Lightbox Card */}
          <div
            style={{
              position: 'relative',
              maxWidth: 'min(92vw, 1100px)',
              maxHeight: 'min(90vh, 800px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '16px',
              boxShadow: '0 30px 70px rgba(0, 0, 0, 0.8)',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedPhoto.url}
              alt={zoomedPhoto.title}
              style={{
                maxHeight: 'min(76vh, 680px)',
                maxWidth: '100%',
                width: 'auto',
                height: 'auto',
                borderRadius: '12px',
                objectFit: 'contain',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'block',
              }}
            />

            {/* Caption */}
            <div style={{ marginTop: '12px', textAlign: 'center', width: '100%' }}>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: '800', margin: '0 0 2px 0' }}>
                {zoomedPhoto.title}
              </h4>
              {zoomedPhoto.total > 1 && (
                <span style={{ color: '#5BBAE4', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Photo {zoomedPhoto.index} of {zoomedPhoto.total}
                </span>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =======================================================================
          ADMIN ADD / EDIT EVENT GALLERY MODAL
          ======================================================================= */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 96000,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--card)',
              borderRadius: '20px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                  {editingItem ? 'Edit Gallery Event' : 'Add Event Photo Album'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Create an event with single or multiple Instagram-style photographs
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={22} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '18px', fontWeight: '600' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Event Name - COMPULSORY */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                  Event / Photograph Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Hackathon 2026, AI Cloud Summit"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                />
              </div>

              {/* Event Date - OPTIONAL */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F172A' }}>
                    Event Date
                  </label>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '600' }}>Optional</span>
                </div>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              {/* Event Description / Bio - OPTIONAL */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F172A' }}>
                    Event Description / Bio
                  </label>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: '600' }}>Optional</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Brief summary, winners list, notable highlights from the event..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', resize: 'vertical' }}
                />
              </div>

              {/* Photographs / Multiple Images - COMPULSORY */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', backgroundColor: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '800', color: '#0F172A' }}>
                      Event Photographs <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                      Add one or multiple photos (displayed side-by-side like Instagram)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddImageField}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#0077B6',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={14} /> Add URL Field
                  </button>
                </div>

                {/* Upload Multiple Files Button */}
                <div style={{ marginBottom: '14px' }}>
                  <input
                    type="file"
                    ref={multiFileInputRef}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleMultiFileUpload}
                  />
                  <button
                    type="button"
                    disabled={isUploadingMulti}
                    onClick={() => multiFileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1.5px dashed #0077B6',
                      backgroundColor: '#F0F9FF',
                      color: '#0077B6',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: '700',
                      fontSize: '0.86rem'
                    }}
                  >
                    {isUploadingMulti ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Uploading Photographs...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Upload Photos from Computer (Select Multiple)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Dynamic Image URLs List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {eventForm.images.map((imgUrl, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span 
                        style={{ 
                          fontSize: '0.74rem', 
                          fontWeight: '800', 
                          color: idx === 0 ? '#0077B6' : '#64748B', 
                          backgroundColor: 'var(--card)', 
                          border: '1px solid #CBD5E1', 
                          borderRadius: '6px', 
                          padding: '6px 8px', 
                          minWidth: '60px', 
                          textAlign: 'center' 
                        }}
                      >
                        {idx === 0 ? 'Cover' : `Photo ${idx + 1}`}
                      </span>
                      <input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={imgUrl}
                        onChange={(e) => handleUpdateImageField(idx, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.86rem',
                          backgroundColor: 'var(--card)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageField(idx)}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid #FECDD3',
                          backgroundColor: '#FFF1F2',
                          color: '#E11D48',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove photograph"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Live Preview Thumbnails Strip */}
                {eventForm.images.filter(Boolean).length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto', padding: '4px 0' }}>
                    {eventForm.images.filter(Boolean).map((imgUrl, pIdx) => (
                      <div
                        key={pIdx}
                        style={{
                          width: '54px',
                          height: '42px',
                          borderRadius: '4px',
                          border: '1px solid #CBD5E1',
                          overflow: 'hidden',
                          flexShrink: 0,
                          backgroundColor: '#000000'
                        }}
                      >
                        <SafeImage
                          src={imgUrl}
                          alt="preview"
                          fallbackIcon={ImageIcon}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'var(--card)', cursor: 'pointer', fontWeight: '700' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingMulti}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', fontWeight: '800', backgroundColor: '#0077B6', borderColor: '#0077B6' }}
                >
                  {isSubmitting ? 'Saving Event...' : editingItem ? 'Save Changes' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
