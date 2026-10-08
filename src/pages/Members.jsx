import { useContext, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  User, 
  X, 
  ExternalLink, 
  ArrowUpRight,
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Loader2,
  Globe,
  ArrowLeft,
  Share2,
  Check,
  BookOpen,
  Maximize2,
  Link as LinkIcon,
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

import { 
  LinkedInIcon, 
  GitHubIcon, 
  TwitterIcon, 
  InstagramIcon, 
  cardColors, 
  CARD_PALETTES, 
  parseMemberData 
} from '../utils/dataHelpers.jsx';


export default function Members({ isVisualAdmin = false, isEditMode = false }) {
  const { siteData, setSiteData, siteDataLoading, triggerDataRefresh } = useContext(SiteDataContext);
  const rawMembers = siteData?.members || [];
  const members = [...rawMembers].sort((a, b) => {
    const orderA = parseMemberData(a).display_order;
    const orderB = parseMemberData(b).display_order;
    if (orderA !== orderB) return orderA - orderB;
    return (a.id || 0) - (b.id || 0);
  });
  const params = useParams();
  const navigate = useNavigate();

  const [selectedMember, setSelectedMember] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null); // { url, name, role }

  // Drag and drop interactive reordering states
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const dragSourceRef = useRef(null);

  // Admin Member Modal
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    role: '',
    category: 'chapter_member',
    photograph_url: '',
    biography: '',
    email: '',
    display_order: 0,
    is_active: true,
    custom_urls: [''], // Simple list of URLs only
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Reorder Members Handler (Move Up / Down & Drag-and-Drop)
  const handleMoveMember = async (index, direction, e) => {
    e?.stopPropagation();
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= members.length) return;

    const updatedList = [...members];
    const [movedItem] = updatedList.splice(index, 1);
    updatedList.splice(targetIdx, 0, movedItem);

    const updateItemWithOrder = (item, newOrder) => {
      const parsed = parseMemberData(item);
      const metadataPayload = { links: parsed.links, display_order: newOrder };
      const rawBio = (item.biography || item.description || '').replace(/\n*<!--(?:KLEF|KLU)_LINKS:[\s\S]*?-->/g, '').trim();
      return {
        ...item,
        display_order: newOrder,
        biography: `${rawBio}\n\n<!--KLEF_LINKS:${JSON.stringify(metadataPayload)}-->`
      };
    };

    const updatedPayloads = updatedList.map((item, idx) => updateItemWithOrder(item, idx + 1));

    // Optimistic instant UI update
    if (setSiteData) {
      setSiteData(prev => ({ ...prev, members: updatedPayloads }));
    }

    const dbPayloads = updatedList.map((item, idx) => {
      const newOrder = idx + 1;
      const parsed = parseMemberData(item);
      const metadataPayload = { links: parsed.links, display_order: newOrder };
      const rawBio = (item.biography || item.description || '').replace(/\n*<!--(?:KLEF|KLU)_LINKS:[\s\S]*?-->/g, '').trim();
      return {
        id: item.id,
        display_order: newOrder,
        biography: `${rawBio}\n\n<!--KLEF_LINKS:${JSON.stringify(metadataPayload)}-->`
      };
    });

    try {
      await api.updateRows('members', dbPayloads);
      await triggerDataRefresh(true);
    } catch (err) {
      console.error('Failed to move member:', err);
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

    const updatedList = [...members];
    const [movedItem] = updatedList.splice(sourceIdx, 1);
    updatedList.splice(targetIdx, 0, movedItem);

    const updateItemWithOrder = (item, newOrder) => {
      const parsed = parseMemberData(item);
      const metadataPayload = { links: parsed.links, display_order: newOrder };
      const rawBio = (item.biography || item.description || '').replace(/\n*<!--(?:KLEF|KLU)_LINKS:[\s\S]*?-->/g, '').trim();
      return {
        ...item,
        display_order: newOrder,
        biography: `${rawBio}\n\n<!--KLEF_LINKS:${JSON.stringify(metadataPayload)}-->`
      };
    };

    const updatedPayloads = updatedList.map((item, idx) => updateItemWithOrder(item, idx + 1));

    // Optimistic instant UI update (Zero-latency visual swap)
    if (setSiteData) {
      setSiteData(prev => ({ ...prev, members: updatedPayloads }));
    }
    setDraggedIdx(null);
    dragSourceRef.current = null;
    const dbPayloads = updatedList.map((item, idx) => {
      const newOrder = idx + 1;
      const parsed = parseMemberData(item);
      const metadataPayload = { links: parsed.links, display_order: newOrder };
      const rawBio = (item.biography || item.description || '').replace(/\n*<!--(?:KLEF|KLU)_LINKS:[\s\S]*?-->/g, '').trim();
      return {
        id: item.id,
        display_order: newOrder,
        biography: `${rawBio}\n\n<!--KLEF_LINKS:${JSON.stringify(metadataPayload)}-->`
      };
    });

    try {
      await api.updateRows('members', dbPayloads);
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

  // Match deep link /Members/:name or /Members/:name/:role
  useEffect(() => {
    if (params.name && members.length > 0) {
      const targetParam = decodeURIComponent(params.name).toLowerCase().replace(/-/g, ' ');
      const match = members.find(m => {
        const cleanName = (m.name || '').toLowerCase();
        return cleanName === targetParam || cleanName.replace(/\s+/g, '-') === params.name.toLowerCase();
      });
      if (match) {
        setSelectedMember(match);
      } else if (!siteDataLoading) {
        navigate('/Members', { replace: true });
      }
    } else if (!params.name) {
      setSelectedMember(null);
    }
  }, [params.name, members, siteDataLoading]);

  // Keyboard escape and body scroll lock for photo lightbox
  useEffect(() => {
    if (zoomedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (zoomedImage) {
          setZoomedImage(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoomedImage]);

  const selectMember = (member) => {
    if (!member) {
      setSelectedMember(null);
      navigate('/Members', { replace: false });
      return;
    }
    setSelectedMember(member);
    const nameSlug = encodeURIComponent((member.name || 'member').trim().replace(/\s+/g, '-'));
    const roleSlug = encodeURIComponent((member.role || 'Member').trim().replace(/\s+/g, '-'));
    navigate(`/Members/${nameSlug}/${roleSlug}`, { replace: false });
  };

  const getInitials = (name) => {
    if (!name) return 'KM';
    return name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleCopyProfileLink = (member) => {
    const nameSlug = encodeURIComponent((member.name || 'member').trim().replace(/\s+/g, '-'));
    const roleSlug = encodeURIComponent(((member.role || 'Member')).trim().replace(/\s+/g, '-'));
    const url = `${window.location.origin}/KLEF-ACM-SC/Members/${nameSlug}/${roleSlug}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // ---------------------------------------------------------------------------
  // ADMIN MEMBER HANDLERS (Clean Single URL Field System)
  // ---------------------------------------------------------------------------
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberForm({
      name: '',
      role: '',
      category: 'chapter_member',
      photograph_url: '',
      biography: '',
      email: '',
      display_order: members.length + 1,
      is_active: true,
      custom_urls: [''],
    });
    setFormError('');
    setMemberModalOpen(true);
  };

  const handleOpenEditMember = (member, e) => {
    e?.stopPropagation();
    setEditingMember(member);

    const parsed = parseMemberData(member);
    const initialUrls = parsed.rawUrls.length > 0 ? parsed.rawUrls : [''];

    setMemberForm({
      name: member.name || '',
      role: member.role || '',
      category: member.category || 'chapter_member',
      photograph_url: member.photograph_url || '',
      biography: parsed.bio,
      email: member.email || '',
      display_order: member.display_order || 0,
      is_active: member.is_active ?? true,
      custom_urls: initialUrls,
    });
    setFormError('');
    setMemberModalOpen(true);
  };

  const handleAddUrlField = () => {
    setMemberForm(prev => ({
      ...prev,
      custom_urls: [...prev.custom_urls, '']
    }));
  };

  const handleUpdateUrlField = (index, value) => {
    setMemberForm(prev => {
      const updated = [...prev.custom_urls];
      updated[index] = value;
      return { ...prev, custom_urls: updated };
    });
  };

  const handleRemoveUrlField = (index) => {
    setMemberForm(prev => {
      const updated = prev.custom_urls.filter((_, i) => i !== index);
      return { ...prev, custom_urls: updated.length > 0 ? updated : [''] };
    });
  };

  const handleDeleteMember = async (member, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete member "${member.name}" from the database?`)) {
      return;
    }
    try {
      await api.deleteRow('members', member.id);
      await triggerDataRefresh(true);
      if (selectedMember?.id === member.id) {
        selectMember(null);
      }
    } catch (err) {
      alert(`Failed to delete member: ${err.message}`);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setFormError('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1];
          const res = await api.uploadImage(file.name, file.type, base64);
          if (res && res.url) {
            setMemberForm(prev => ({ ...prev, photograph_url: res.url }));
          }
        } catch (uploadErr) {
          setFormError(uploadErr.message || 'Image upload failed');
        } finally {
          setUploadingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setFormError(err.message);
      setUploadingPhoto(false);
    }
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!memberForm.name.trim() || !memberForm.role.trim()) {
      setFormError('Member name and role are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const cleanUrls = (memberForm.custom_urls || [])
      .map(u => String(u || '').trim())
      .filter(Boolean);

    // Auto-classify URLs
    const structuredLinks = cleanUrls.map(url => {
      const uLower = url.toLowerCase();
      let label = 'Website';
      if (uLower.includes('linkedin.com')) label = 'LinkedIn';
      else if (uLower.includes('github.com')) label = 'GitHub';
      else if (uLower.includes('twitter.com') || uLower.includes('x.com')) label = 'Twitter / X';
      else if (uLower.includes('instagram.com')) label = 'Instagram';
      else if (uLower.includes('scholar.google')) label = 'Google Scholar';
      else if (uLower.includes('researchgate.net')) label = 'ResearchGate';
      return { label, url };
    });

    const li = cleanUrls.find(u => u.toLowerCase().includes('linkedin.com')) || '';
    const gh = cleanUrls.find(u => u.toLowerCase().includes('github.com')) || '';
    const pf = cleanUrls.find(u => !u.toLowerCase().includes('linkedin.com') && !u.toLowerCase().includes('github.com')) || '';

    // Guarantee persistence across all DB schemas by embedding links and display_order metadata in biography
    const rawBio = (memberForm.biography || '').replace(/\n*<!--(?:KLEF|KLU)_LINKS:[\s\S]*?-->/g, '').trim();
    const currentOrder = Number(memberForm.display_order) || 0;
    const metadataPayload = {
      links: structuredLinks,
      display_order: currentOrder
    };
    const finalBio = `${rawBio}\n\n<!--KLEF_LINKS:${JSON.stringify(metadataPayload)}-->`;

    const payload = {
      name: memberForm.name.trim(),
      role: memberForm.role.trim(),
      category: memberForm.category || 'chapter_member',
      photograph_url: (memberForm.photograph_url || '').trim(),
      biography: finalBio,
      email: (memberForm.email || '').trim(),
      display_order: Number(memberForm.display_order) || 0,
      is_active: Boolean(memberForm.is_active),
      linkedin_url: li,
      github_url: gh,
      portfolio_url: pf,
      social_links: structuredLinks
    };

    try {
      if (editingMember) {
        await api.updateRow('members', {
          id: editingMember.id,
          ...payload,
        });
      } else {
        await api.createRow('members', payload);
      }
      await triggerDataRefresh(true);
      setMemberModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to save member record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // MEMBER CARD RENDERER (Clean: ONLY Role & Person Name, ONLY LinkedIn on Card)
  // ---------------------------------------------------------------------------
  const renderMemberCard = (member, index) => {
    const hasPhoto = Boolean(member.photograph_url);
    const parsed = parseMemberData(member);
    const initials = getInitials(member.name);

    return (
      <motion.div 
        layout
        layoutId={`member-${member.id || index}`}
        key={member.id || index} 
        draggable={isVisualAdmin}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragLeave={(e) => handleDragLeave(e, index)}
        onDrop={(e) => handleDrop(e, index)}
        onDragEnd={handleDragEnd}
        style={{ 
          position: 'relative',
          boxShadow: dragOverIdx === index && draggedIdx !== index ? '0 16px 36px rgba(0, 119, 182, 0.25)' : undefined,
          cursor: isVisualAdmin ? (draggedIdx === index ? 'grabbing' : 'grab') : 'pointer',
          opacity: draggedIdx === index ? 0.35 : 1,
          transform: dragOverIdx === index && draggedIdx !== index ? 'scale(1.03) translateY(-4px)' : 'none',
          outline: dragOverIdx === index && draggedIdx !== index ? '3px dashed #0077B6' : 'none',
          outlineOffset: '4px',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, opacity 0.2s ease',
        }}
        className="mcard"
        onClick={() => {
          if (!isVisualAdmin || draggedIdx === null) {
            selectMember(member);
          }
        }}
      >
        {/* Full-bleed photo */}
        <div className="mcard-media">
          {hasPhoto ? (
            <SafeImage src={member.photograph_url} alt={member.name} fit="cover" fallbackIcon={User} fallbackText={member.name} />
          ) : (
            <div className="mcard-initials">{initials}</div>
          )}
        </div>

        {/* Glass caption */}
        <div className="mcard-glass">
          <div style={{ minWidth: 0 }}>
            <div className="mcard-role">{member.role}</div>
            <h3 className="mcard-name">{member.name}</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            {parsed.linkedinUrl && (
              <a href={parsed.linkedinUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn Profile" className="mcard-icon">
                <LinkedInIcon size={15} />
              </a>
            )}
            <button type="button" onClick={() => selectMember(member)} className="mcard-icon" title={`View ${member.name}'s profile`} aria-label={`View ${member.name}'s profile`}>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Admin Quick Actions & Reordering Controls */}
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
            {/* Reorder Grip & Arrows */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(15, 23, 42, 0.92)', padding: '4px 6px', borderRadius: '8px', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <div 
                title="Drag to reposition card"
                style={{ 
                  cursor: 'grab', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '3px', 
                  color: '#94A3B8',
                  padding: '2px 4px',
                  userSelect: 'none'
                }}
              >
                <GripVertical size={14} color="#CBD5E1" />
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#F8FAFC' }}>#{index + 1}</span>
              </div>

              <button
                type="button"
                disabled={index === 0}
                title="Move Card Earlier"
                onClick={(e) => handleMoveMember(index, -1, e)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '4px',
                  backgroundColor: index === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.12)',
                  color: index === 0 ? 'rgba(255,255,255,0.25)' : '#FFFFFF',
                  border: 'none',
                  cursor: index === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background-color 0.15s'
                }}
              >
                <MoveUp size={13} />
              </button>

              <button
                type="button"
                disabled={index === members.length - 1}
                title="Move Card Later"
                onClick={(e) => handleMoveMember(index, 1, e)}
                style={{
                  padding: '4px 6px',
                  borderRadius: '4px',
                  backgroundColor: index === members.length - 1 ? 'transparent' : 'rgba(255, 255, 255, 0.12)',
                  color: index === members.length - 1 ? 'rgba(255,255,255,0.25)' : '#FFFFFF',
                  border: 'none',
                  cursor: index === members.length - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background-color 0.15s'
                }}
              >
                <MoveDown size={13} />
              </button>
            </div>

            {/* Edit & Delete Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                title="Edit Member"
                onClick={(e) => handleOpenEditMember(member, e)}
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
                title="Delete Member"
                onClick={(e) => handleDeleteMember(member, e)}
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
  };

  // ---------------------------------------------------------------------------
  // DEDICATED FULL MEMBER PROFILE VIEW (Shows ALL links in Bio Page, Centered Zoomable Photo)
  // ---------------------------------------------------------------------------
  const renderDedicatedProfileView = () => {
    if (!selectedMember) return null;
    const parsed = parseMemberData(selectedMember);
    const initials = getInitials(selectedMember.name);
    const memberIndex = members.findIndex(m => m.id === selectedMember.id || (m.name && selectedMember.name && m.name.toLowerCase() === selectedMember.name.toLowerCase()));
    const paletteIndex = memberIndex >= 0 ? memberIndex % CARD_PALETTES.length : 0;
    const palette = CARD_PALETTES[paletteIndex];

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          maxWidth: '920px',
          margin: '0 auto',
          padding: '16px 0 64px 0'
        }}
      >
        {/* Navigation Back Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
          <button
            type="button"
            onClick={() => selectMember(null)}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.9rem'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Members Directory</span>
          </button>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleCopyProfileLink(selectedMember)}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '6px',
                fontSize: '0.86rem',
                fontWeight: '600'
              }}
            >
              {copiedLink ? <Check size={16} color="#16A34A" /> : <Share2 size={16} />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
            </button>

            {isVisualAdmin && (
              <button
                type="button"
                onClick={(e) => handleOpenEditMember(selectedMember, e)}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '0.86rem',
                  fontWeight: '700'
                }}
              >
                <Edit3 size={15} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Hero */}
        <div className="profile-hero bg-mesh" style={{ padding: 'clamp(36px, 6vw, 64px) 24px', textAlign: 'center' }}>
          <div className="orb orb-red" style={{ width: '360px', height: '360px' }} />
          <div className="orb orb-blue" style={{ width: '420px', height: '420px' }} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="profile-photo-ring"
            style={{ width: '180px', height: '180px', margin: '0 auto 24px', cursor: selectedMember.photograph_url ? 'zoom-in' : 'default' }}
            title={selectedMember.photograph_url ? 'Click to expand photo' : selectedMember.name}
            onClick={() => {
              if (selectedMember.photograph_url) {
                setZoomedImage({ url: selectedMember.photograph_url, name: selectedMember.name, role: selectedMember.role });
              }
            }}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: '26px', overflow: 'hidden', background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {selectedMember.photograph_url ? (
                <>
                  <SafeImage
                    src={selectedMember.photograph_url}
                    alt={selectedMember.name}
                    fallbackIcon={User}
                    fallbackText={selectedMember.name}
                    fit="cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(15,23,42,0.6)', borderRadius: '50%', width: '28px', height: '28px', display: 'grid', placeItems: 'center', color: '#fff' }}>
                    <Maximize2 size={13} />
                  </div>
                </>
              ) : (
                <span style={{ fontSize: '3.6rem', fontWeight: '900', color: palette.accent }}>{initials}</span>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
            <span className="hero-pill" style={{ paddingLeft: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.74rem' }}>
              {selectedMember.role}
            </span>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '600', letterSpacing: '0', lineHeight: '1.05', margin: '18px 0 8px', color: 'var(--navy-900)' }}>
              {selectedMember.name}
            </h1>
            <p style={{ fontSize: '0.95rem', margin: '0 0 28px', color: 'var(--slate-500)' }}>
              KLEF ACM Student Chapter · KL Deemed to be University
            </p>
          </motion.div>

          {parsed.links.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}
            >
              {parsed.links.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="profile-link-chip">
                    <Icon size={16} />
                    <span>{item.label}</span>
                    <ExternalLink size={12} style={{ opacity: 0.7 }} />
                  </a>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Biography */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}
          className="glass"
          style={{ marginTop: '-36px', marginInline: 'clamp(0px, 3vw, 32px)', padding: 'clamp(24px, 4vw, 40px)', position: 'relative', zIndex: 2 }}
        >
          <div className="editorial-kicker" style={{ marginBottom: '14px' }}>
            <BookOpen size={14} /> Biography
          </div>
          {parsed.bio ? (
            <div className="profile-biography-box" style={{ color: 'var(--navy-700)', fontSize: '1.04rem', lineHeight: '1.85', whiteSpace: 'pre-wrap' }}>
              {parsed.bio}
            </div>
          ) : (
            <p style={{ margin: 0, color: 'var(--slate-500)' }}>No biography has been published for this member yet.</p>
          )}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div style={{ minHeight: '80vh', paddingBottom: '88px' }}>
      {/* Editorial Header */}
      {!selectedMember && (
        <section className="page-hero bg-mesh">
          <div className="orb orb-red" />
          <div className="orb orb-blue" />
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
              <div style={{ maxWidth: '740px' }}>
                <VisualEditable
                  name="members_tag"
                  as="span"
                  defaultValue="EXECUTIVE LEADERSHIP"
                  className="editorial-kicker"
                />
                <VisualEditable
                  name="members_title"
                  as="h1"
                  defaultValue="Chapter Committee & Leadership"
                  style={{
                    fontSize: 'clamp(32px, 5vw, 56px)',
                    fontWeight: '800',
                    color: 'var(--navy-900)',
                    letterSpacing: '0',
                    marginBottom: '12px',
                    lineHeight: '1.2',
                  }}
                />
                <VisualEditable
                  name="members_subtitle"
                  as="p"
                  defaultValue="Faculty Mentors, Student Executive Officers, and Technical Division Leads guiding KLEF ACM."
                  style={{
                    color: 'var(--slate-600)',
                    fontSize: '1.1rem',
                    lineHeight: '1.65',
                    margin: 0,
                  }}
                />
              </div>

              {/* Admin Add Member Button */}
              {isVisualAdmin && (
                <button
                  type="button"
                  onClick={handleOpenAddMember}
                  className="btn btn-primary"
                  style={{
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={18} />
                  <span>Add Member</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Content Layout */}
      <div className="container" style={{ marginTop: selectedMember ? '32px' : '48px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* If a member is selected, show dedicated profile layout; otherwise show directory grid */}
        <AnimatePresence mode="wait">
          {selectedMember ? (
            renderDedicatedProfileView()
          ) : siteDataLoading && members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '72px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={36} className="animate-spin" color="#0077B6" style={{ marginBottom: '16px' }} />
              <p style={{ color: 'var(--slate-500)', fontSize: '0.94rem', fontWeight: '600' }}>Loading chapter leadership roster from database...</p>
            </div>
          ) : members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 20px', border: '1px dashed var(--slate-300)', borderRadius: '12px', backgroundColor: 'var(--card)' }}>
              <User size={44} style={{ color: 'var(--slate-400)', margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '8px' }}>No Members Added Yet</h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>Chapter leadership and members will appear here.</p>
              {isVisualAdmin && (
                <button
                  type="button"
                  onClick={handleOpenAddMember}
                  className="btn btn-primary"
                  style={{ marginTop: '16px', borderRadius: '4px' }}
                >
                  <Plus size={16} /> Add First Member
                </button>
              )}
            </div>
          ) : (
            <>
              {isVisualAdmin && members.length > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', borderRadius: '24px', backgroundColor: '#F0F9FF', border: '1.5px solid #BAE6FD', color: '#0369A1', fontSize: '0.86rem', fontWeight: '700', alignSelf: 'flex-start' }}>
                  <GripVertical size={16} />
                  <span>✨ Drag & Drop any card to reposition in real-time, or use the arrow buttons!</span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
                {members.map((member, idx) => (
                  isVisualAdmin ? (
                    renderMemberCard(member, idx)
                  ) : (
                    <ScrollReveal key={member.id || idx} delay={idx * 30} duration={500} yOffset={16}>
                      {renderMemberCard(member, idx)}
                    </ScrollReveal>
                  )
                ))}
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Free-form Page Blocks */}
        {!selectedMember && (
          <PageBlockList blockKey="members_blocks" style={{ marginTop: '32px' }} />
        )}
      </div>

      {/* High-Res Image Lightbox Popup Modal - Rendered directly to document.body so it overlays global header and all nav links */}
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
            padding: '16px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
          onClick={() => setZoomedImage(null)}
        >
          {/* Viewport Fixed Top-Right Close Button (Always visible on all screens/zooms) */}
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
              maxWidth: 'min(90vw, 480px)',
              maxHeight: 'min(86vh, 700px)',
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
              src={zoomedImage.url}
              alt={zoomedImage.name}
              style={{
                maxHeight: 'min(62vh, 480px)',
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
                {zoomedImage.name}
              </h4>
              <span style={{ color: '#5BBAE4', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {zoomedImage.role}
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Admin Visual In-Place Member Form Modal with Clean Single URL Fields */}
      {memberModalOpen && (
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
          onClick={() => setMemberModalOpen(false)}
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
                {editingMember ? 'Edit Member Profile' : 'Add Chapter Member'}
              </h3>
              <button
                type="button"
                onClick={() => setMemberModalOpen(false)}
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

            <form onSubmit={handleSaveMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. B. Tirapathi Reddy / Annie Maloji Spandana"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  Role / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faculty Chairperson / Chair / Web Master"
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  Member Photograph
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Direct Photo URL or upload below"
                    value={memberForm.photograph_url}
                    onChange={(e) => setMemberForm({ ...memberForm, photograph_url: e.target.value })}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePhotoUpload}
                  />
                  <button
                    type="button"
                    disabled={uploadingPhoto}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {uploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. member@kluniversity.in"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  Biography / Leadership Summary
                </label>
                <textarea
                  rows={4}
                  placeholder="Detailed biography, tech stack, research focus, achievements..."
                  value={memberForm.biography}
                  onChange={(e) => setMemberForm({ ...memberForm, biography: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', resize: 'vertical' }}
                />
              </div>

              {/* Clean Single URL Field Dynamic List (User only pastes URL!) */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '800', color: '#0f172a' }}>
                      Profile Links & Social URLs
                    </label>
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      Add LinkedIn, GitHub, Portfolio, or any custom URL (shown on member bio page)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUrlField}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#0077B6',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={14} /> Add URL
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(memberForm.custom_urls || []).map((urlValue, idx) => {
                    const uLower = (urlValue || '').toLowerCase();
                    let badgeLabel = 'URL';
                    let badgeColor = '#64748b';
                    if (uLower.includes('linkedin.com')) { badgeLabel = 'LinkedIn'; badgeColor = '#0A66C2'; }
                    else if (uLower.includes('github.com')) { badgeLabel = 'GitHub'; badgeColor = '#24292F'; }
                    else if (uLower.includes('leetcode.com') || uLower.includes('leetcode.cn')) { badgeLabel = 'LeetCode'; badgeColor = '#FFA116'; }
                    else if (uLower.includes('hackerrank.com')) { badgeLabel = 'HackerRank'; badgeColor = '#2EC866'; }
                    else if (uLower.includes('codechef.com')) { badgeLabel = 'CodeChef'; badgeColor = '#5B4638'; }
                    else if (uLower.includes('codeforces.com')) { badgeLabel = 'Codeforces'; badgeColor = '#1F8ACB'; }
                    else if (uLower.includes('geeksforgeeks.org')) { badgeLabel = 'GFG'; badgeColor = '#2F8D46'; }
                    else if (uLower.includes('kaggle.com')) { badgeLabel = 'Kaggle'; badgeColor = '#20BEFF'; }
                    else if (uLower.includes('gitlab.com')) { badgeLabel = 'GitLab'; badgeColor = '#FC6D26'; }
                    else if (uLower.includes('twitter.com') || uLower.includes('x.com')) { badgeLabel = 'Twitter/X'; badgeColor = '#0F1419'; }
                    else if (uLower.includes('instagram.com')) { badgeLabel = 'Instagram'; badgeColor = '#E1306C'; }
                    else if (uLower.includes('youtube.com') || uLower.includes('youtu.be')) { badgeLabel = 'YouTube'; badgeColor = '#FF0000'; }
                    else if (uLower.includes('medium.com')) { badgeLabel = 'Medium'; badgeColor = '#12100E'; }
                    else if (uLower.includes('scholar.google')) { badgeLabel = 'Scholar'; badgeColor = '#4285F4'; }
                    else if (uLower.includes('researchgate.net')) { badgeLabel = 'Research'; badgeColor = '#00CCBB'; }
                    else if (urlValue.trim()) { badgeLabel = 'Portfolio'; badgeColor = '#0077B6'; }


                    return (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span 
                          style={{ 
                            fontSize: '0.72rem', 
                            fontWeight: '800', 
                            color: badgeColor, 
                            backgroundColor: 'var(--card)', 
                            border: '1px solid #cbd5e1', 
                            borderRadius: '4px', 
                            padding: '6px 8px', 
                            minWidth: '70px', 
                            textAlign: 'center' 
                          }}
                        >
                          {badgeLabel}
                        </span>
                        <input
                          type="url"
                          placeholder="Paste URL (e.g. https://github.com/... or https://linkedin.com/...)"
                          value={urlValue}
                          onChange={(e) => handleUpdateUrlField(idx, e.target.value)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.86rem',
                            backgroundColor: 'var(--card)'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveUrlField(idx)}
                          style={{
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #fecdd3',
                            backgroundColor: '#fff1f2',
                            color: '#e11d48',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Remove URL"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setMemberModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'var(--card)', cursor: 'pointer', fontWeight: '700' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', fontWeight: '800', backgroundColor: '#0077B6', borderColor: '#0077B6' }}
                >
                  {isSubmitting ? 'Saving...' : editingMember ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
