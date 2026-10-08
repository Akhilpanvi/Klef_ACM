import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Check, X, Upload, Save, Eye, EyeOff, Sparkles, PlusCircle, 
  MinusCircle, Image as ImageIcon, Calendar, Users, Layers, ExternalLink, MoveUp, 
  MoveDown, MapPin, Mail, Phone, Clock, FileText, CheckCircle2, AlertCircle, RefreshCw, Award, Maximize2, GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { SiteDataContext } from '../App';
import { broadcastDataChange } from '../services/realtime';
import SafeImage from '../components/SafeImage';
import { parseMemberData, parseGalleryItem, parseEventData } from '../utils/dataHelpers.jsx';


export default function AdminEditPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const { triggerDataRefresh } = useContext(SiteDataContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // CMS States depending on active section
  const [pageData, setPageData] = useState(null); // Used for Home, About and Contact pages
  const [listData, setListData] = useState([]);   // Used for Events, Gallery, Members lists
  const [albums, setAlbums] = useState([]);       // For gallery album association
  
  // Modal states for CRUD operations
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null); // { url, title }

  // Drag and drop interactive reordering states
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const dragSourceRef = useRef(null);

  // Lightbox keyboard and scroll lock
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lightboxImage) setLightboxImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxImage]);

  // Load section data from live API
  const loadSectionData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setPageData(null);
    setListData([]);

    try {
      if (['home', 'about-acm', 'about-klef-acm'].includes(section)) {
        const data = await api.getTable('pages');
        const activePage = data.find(p => p.slug === section);
        if (activePage) {
          // Normalize content and custom blocks
          const content = activePage.content || {};
          if (!Array.isArray(content.custom_blocks)) {
            content.custom_blocks = [];
          }
          setPageData({ ...activePage, content });
        } else {
          setPageData({ 
            slug: section, 
            title: `${section.toUpperCase()} Page`, 
            content: { hero: {}, stats: {}, introduction: {}, custom_blocks: [] } 
          });
        }
      } else if (section === 'contact') {
        const data = await api.getTable('contact_settings');
        const activeContact = data.find(c => c.key === 'contact_info');
        if (activeContact) {
          setPageData(activeContact);
        } else {
          setPageData({ 
            key: 'contact_info', 
            value: {
              email: 'acm.studentchapter@kluniversity.in',
              phone: '+91 863 2399999',
              address: 'Department of Computer Science & Engineering\nKoneru Lakshmaiah Education Foundation\nGreen Fields, Vaddeswaram, Andhra Pradesh 522302',
              directions_url: 'https://maps.app.goo.gl/uLVUEpEqWxLT5MFS7',
              contact_person: 'Faculty & Student Leadership Committee'
            } 
          });
        }
      } else if (section === 'events') {
        const data = await api.getTable('events');
        const sorted = [...data].sort((a, b) => {
          const orderA = parseEventData(a).display_order;
          const orderB = parseEventData(b).display_order;
          if (orderA !== orderB) return orderA - orderB;
          return new Date(b.date) - new Date(a.date);
        });
        setListData(sorted);
      } else if (section === 'gallery') {
        const [images, alb] = await Promise.all([
          api.getTable('gallery_images'),
          api.getTable('gallery_albums')
        ]);
        const sorted = [...images].sort((a, b) => {
          const orderA = parseGalleryItem(a).display_order;
          const orderB = parseGalleryItem(b).display_order;
          if (orderA !== orderB) return orderA - orderB;
          return (b.id || 0) - (a.id || 0);
        });
        setListData(sorted);
        setAlbums(alb);

        if (alb.length === 0) {
          const defAlbum = await api.createRow('gallery_albums', { name: 'General', description: 'Chapter activities' });
          setAlbums([defAlbum]);
        }
      } else if (section === 'members') {
        const data = await api.getTable('members');
        const sorted = [...data].sort((a, b) => {
          const orderA = parseMemberData(a).display_order;
          const orderB = parseMemberData(b).display_order;
          if (orderA !== orderB) return orderA - orderB;
          return (a.id || 0) - (b.id || 0);
        });
        setListData(sorted);
      } else if (section === 'audit-logs') {
        const data = await api.getTable('audit_logs');
        setListData(data);
      } else {
        navigate('/admin');
      }
    } catch (err) {
      console.error(`Error loading section ${section}:`, err);
      setError(err.message || 'Failed to fetch data from database. Ensure Supabase schema has been executed in the SQL Editor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSectionData();
    setModalOpen(false);
    setCurrentItem(null);
  }, [section]);

  // Image upload with clean base64 decoding and instant UI preview
  const handleImageUpload = async (e, fieldName, targetBlockIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size exceeds 5MB limit.');
      return;
    }

    setUploadingImage(true);
    setError('');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const rawBase64 = reader.result.split(',')[1] || reader.result;
        const res = await api.uploadImage(file.name, file.type, rawBase64);
        const uploadedUrl = res.url || reader.result;

        if (targetBlockIndex !== null && pageData) {
          // Update custom block image
          const updatedBlocks = [...(pageData.content.custom_blocks || [])];
          updatedBlocks[targetBlockIndex] = {
            ...updatedBlocks[targetBlockIndex],
            [fieldName]: uploadedUrl
          };
          setPageData({
            ...pageData,
            content: { ...pageData.content, custom_blocks: updatedBlocks }
          });
        } else if (currentItem) {
          setCurrentItem({ ...currentItem, [fieldName]: uploadedUrl });
        } else if (pageData) {
          setPageData({
            ...pageData,
            content: { ...pageData.content, [fieldName]: uploadedUrl }
          });
        }
        setSuccess('Image uploaded and preview updated!');
      } catch (err) {
        console.error('Image upload failed:', err);
        // Fallback: use data URI directly in state so user is never blocked
        const fallbackUrl = reader.result;
        if (targetBlockIndex !== null && pageData) {
          const updatedBlocks = [...(pageData.content.custom_blocks || [])];
          updatedBlocks[targetBlockIndex] = {
            ...updatedBlocks[targetBlockIndex],
            [fieldName]: fallbackUrl
          };
          setPageData({
            ...pageData,
            content: { ...pageData.content, custom_blocks: updatedBlocks }
          });
        } else if (currentItem) {
          setCurrentItem({ ...currentItem, [fieldName]: fallbackUrl });
        } else if (pageData) {
          setPageData({
            ...pageData,
            content: { ...pageData.content, [fieldName]: fallbackUrl }
          });
        }
        setSuccess('Image preview loaded directly!');
      } finally {
        setUploadingImage(false);
      }
    };
  };

  // Add Custom Content Block to page
  const handleAddCustomBlock = () => {
    if (!pageData) return;
    const newBlock = {
      id: `block-${Date.now()}`,
      title: 'New Chapter Highlight Block',
      subtitle: 'Custom Section Category',
      text: 'Add detailed description, announcements, event recaps, or initiative highlights here.',
      image_url: '',
      button_text: 'Learn More',
      button_url: '/events',
      layout: 'side_by_side' // 'side_by_side', 'full_banner', 'card'
    };
    const updatedBlocks = [...(pageData.content.custom_blocks || []), newBlock];
    setPageData({
      ...pageData,
      content: { ...pageData.content, custom_blocks: updatedBlocks }
    });
    setSuccess('New content block added! Scroll down to edit.');
  };

  // Remove Custom Content Block
  const handleRemoveCustomBlock = (index) => {
    if (!pageData) return;
    const updatedBlocks = (pageData.content.custom_blocks || []).filter((_, i) => i !== index);
    setPageData({
      ...pageData,
      content: { ...pageData.content, custom_blocks: updatedBlocks }
    });
  };

  // Move Block Order
  const handleMoveBlock = (index, direction) => {
    if (!pageData) return;
    const blocks = [...(pageData.content.custom_blocks || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const temp = blocks[index];
    blocks[index] = blocks[targetIdx];
    blocks[targetIdx] = temp;
    setPageData({
      ...pageData,
      content: { ...pageData.content, custom_blocks: blocks }
    });
  };

  // Move List Item Order (Events, Gallery, Members)
  const handleMoveListItem = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= listData.length) return;

    const updatedList = [...listData];
    const [movedItem] = updatedList.splice(index, 1);
    updatedList.splice(targetIdx, 0, movedItem);

    const targetTable = section === 'events' ? 'events' : (section === 'members' ? 'members' : 'gallery_images');

    const updateItemWithOrder = (item, newOrder) => {
      const payload = { ...item, display_order: newOrder };
      if (section === 'members') {
        const parsed = parseMemberData(item);
        const metadataPayload = { links: parsed.links, display_order: newOrder };
        const rawBio = (item.biography || item.description || '').replace(/\n*<!--(?:KLEF|KLU)_LINKS:[\s\S]*?-->/g, '').trim();
        payload.biography = `${rawBio}\n\n<!--KLEF_LINKS:${JSON.stringify(metadataPayload)}-->`;
      } else if (section === 'gallery') {
        const parsed = parseGalleryItem(item);
        const metadataPayload = { images: parsed.images, date: parsed.date || null, description: parsed.description || '', display_order: newOrder };
        const rawDesc = (item.description || '').replace(/\n*<!--(?:KLEF|KLU)_GALLERY:[\s\S]*?-->/g, '').trim();
        payload.description = `${rawDesc}\n\n<!--KLEF_GALLERY:${JSON.stringify(metadataPayload)}-->`;
      } else if (section === 'events') {
        const parsed = parseEventData(item);
        const metadataPayload = { event_format: parsed.event_format || 'in_person', display_order: newOrder };
        const rawDesc = (item.description || '').replace(/\n*<!--(?:KLEF|KLU)_EVENT:[\s\S]*?-->/g, '').trim();
        payload.description = `${rawDesc}\n\n<!--KLEF_EVENT:${JSON.stringify(metadataPayload)}-->`;
      }
      return payload;
    };

    const updatedPayloads = updatedList.map((item, idx) => updateItemWithOrder(item, idx + 1));
    setListData(updatedPayloads);

    const dbPayloads = updatedList.map((item, idx) => {
      const newOrder = idx + 1;
      const minimal = { id: item.id, display_order: newOrder };
      if (section === 'members') {
        const parsed = parseMemberData(item);
        const metadataPayload = { links: parsed.links, display_order: newOrder };
        const rawBio = (item.biography || item.description || '').replace(/\n*<!--(?:KLEF|KLU)_LINKS:[\s\S]*?-->/g, '').trim();
        minimal.biography = `${rawBio}\n\n<!--KLEF_LINKS:${JSON.stringify(metadataPayload)}-->`;
      } else if (section === 'gallery') {
        const parsed = parseGalleryItem(item);
        const metadataPayload = { images: parsed.images, date: parsed.date || null, description: parsed.description || '', display_order: newOrder };
        const rawDesc = (item.description || '').replace(/\n*<!--(?:KLEF|KLU)_GALLERY:[\s\S]*?-->/g, '').trim();
        minimal.description = `${rawDesc}\n\n<!--KLEF_GALLERY:${JSON.stringify(metadataPayload)}-->`;
      } else if (section === 'events') {
        const parsed = parseEventData(item);
        const metadataPayload = { event_format: parsed.event_format || 'in_person', display_order: newOrder };
        const rawDesc = (item.description || '').replace(/\n*<!--(?:KLEF|KLU)_EVENT:[\s\S]*?-->/g, '').trim();
        minimal.description = `${rawDesc}\n\n<!--KLEF_EVENT:${JSON.stringify(metadataPayload)}-->`;
      }
      return minimal;
    });

    try {
      await api.updateRows(targetTable, dbPayloads);
      setSuccess(`Display order updated!`);
      triggerDataRefresh(true);
      broadcastDataChange(targetTable);
    } catch (err) {
      console.error('Failed to persist order change:', err);
      setError('Failed to persist order: ' + err.message);
    }
  };

  // Drag & Drop Handlers (Instagram-style smooth card repositioning)
  const handleDragStart = (e, index) => {
    dragSourceRef.current = index;
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch {}
  };

  const handleDragOver = (e, index) => {
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

    const updatedList = [...listData];
    const [movedItem] = updatedList.splice(sourceIdx, 1);
    updatedList.splice(targetIdx, 0, movedItem);

    const targetTable = section === 'events' ? 'events' : (section === 'members' ? 'members' : 'gallery_images');

    const updateItemWithOrder = (item, newOrder) => {
      const payload = { ...item, display_order: newOrder };
      if (section === 'members') {
        const parsed = parseMemberData(item);
        const metadataPayload = { links: parsed.links, display_order: newOrder };
        const rawBio = (item.biography || item.description || '').replace(/\n*<!--(?:KLEF|KLU)_LINKS:[\s\S]*?-->/g, '').trim();
        payload.biography = `${rawBio}\n\n<!--KLEF_LINKS:${JSON.stringify(metadataPayload)}-->`;
      } else if (section === 'gallery') {
        const parsed = parseGalleryItem(item);
        const metadataPayload = { images: parsed.images, date: parsed.date || null, description: parsed.description || '', display_order: newOrder };
        const rawDesc = (item.description || '').replace(/\n*<!--(?:KLEF|KLU)_GALLERY:[\s\S]*?-->/g, '').trim();
        payload.description = `${rawDesc}\n\n<!--KLEF_GALLERY:${JSON.stringify(metadataPayload)}-->`;
      } else if (section === 'events') {
        const parsed = parseEventData(item);
        const metadataPayload = { event_format: parsed.event_format || 'in_person', display_order: newOrder };
        const rawDesc = (item.description || '').replace(/\n*<!--(?:KLEF|KLU)_EVENT:[\s\S]*?-->/g, '').trim();
        payload.description = `${rawDesc}\n\n<!--KLEF_EVENT:${JSON.stringify(metadataPayload)}-->`;
      }
      return payload;
    };

    const updatedPayloads = updatedList.map((item, idx) => updateItemWithOrder(item, idx + 1));
    setListData(updatedPayloads);
    setDraggedIdx(null);
    dragSourceRef.current = null;

    const dbPayloads = updatedList.map((item, idx) => {
      const newOrder = idx + 1;
      const minimal = { id: item.id, display_order: newOrder };
      if (section === 'members') {
        const parsed = parseMemberData(item);
        const metadataPayload = { links: parsed.links, display_order: newOrder };
        const rawBio = (item.biography || item.description || '').replace(/\n*<!--(?:KLEF|KLU)_LINKS:[\s\S]*?-->/g, '').trim();
        minimal.biography = `${rawBio}\n\n<!--KLEF_LINKS:${JSON.stringify(metadataPayload)}-->`;
      } else if (section === 'gallery') {
        const parsed = parseGalleryItem(item);
        const metadataPayload = { images: parsed.images, date: parsed.date || null, description: parsed.description || '', display_order: newOrder };
        const rawDesc = (item.description || '').replace(/\n*<!--(?:KLEF|KLU)_GALLERY:[\s\S]*?-->/g, '').trim();
        minimal.description = `${rawDesc}\n\n<!--KLEF_GALLERY:${JSON.stringify(metadataPayload)}-->`;
      } else if (section === 'events') {
        const parsed = parseEventData(item);
        const metadataPayload = { event_format: parsed.event_format || 'in_person', display_order: newOrder };
        const rawDesc = (item.description || '').replace(/\n*<!--(?:KLEF|KLU)_EVENT:[\s\S]*?-->/g, '').trim();
        minimal.description = `${rawDesc}\n\n<!--KLEF_EVENT:${JSON.stringify(metadataPayload)}-->`;
      }
      return minimal;
    });

    try {
      await api.updateRows(targetTable, dbPayloads);
      setSuccess(`Display order updated! Position #${sourceIdx + 1} moved to #${targetIdx + 1}`);
      triggerDataRefresh(true);
      broadcastDataChange(targetTable);
    } catch (err) {
      console.error('Failed to persist drag order:', err);
      setError('Failed to persist order: ' + err.message);
    }
  };

  const handleDragEnd = () => {
    setTimeout(() => {
      dragSourceRef.current = null;
      setDraggedIdx(null);
      setDragOverIdx(null);
    }, 100);
  };

  // Save Page Settings (Home, About, Contact)
  const handleSavePageSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let res;
      if (section === 'contact') {
        res = await api.updateRow('contact_settings', pageData);
      } else {
        res = await api.updateRow('pages', pageData);
      }
      
      if (res.error) throw new Error(res.error);
      
      setSuccess('Page content published live to database and public website!');
      await triggerDataRefresh(true);
      broadcastDataChange(section === 'contact' ? 'contact_settings' : 'pages');

      // Automatically redirect to review live page
      const publicPathMap = {
        'home': '/Admin/Home',
        'about-acm': '/Admin/About-ACM',
        'about-klu-acm': '/Admin/About-KLEF-ACM',
        'about-klef-acm': '/Admin/About-KLEF-ACM',
        'contact': '/Admin/Contact',
        'events': '/Admin/Events',
        'gallery': '/Admin/Gallery',
        'members': '/Admin/Members'
      };
      const dest = publicPathMap[section] || `/Admin/${section}`;
      setTimeout(() => {
        navigate(dest);
      }, 700);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Save CRUD List Item (Events, Gallery, Members)
  const handleSaveCRUDItem = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let res;
      const targetTable = section === 'events' ? 'events' : (section === 'members' ? 'members' : 'gallery_images');
      let payloadToSave = { ...currentItem };

      if (payloadToSave.display_order !== undefined && payloadToSave.display_order !== '') {
        payloadToSave.display_order = Number(payloadToSave.display_order) || 0;
      }

      if (section === 'members') {
        const rawUrls = Array.isArray(payloadToSave.custom_urls) 
          ? payloadToSave.custom_urls.map(u => String(u || '').trim()).filter(Boolean)
          : (Array.isArray(payloadToSave.social_links) ? payloadToSave.social_links.map(l => String(l.url || l || '').trim()).filter(Boolean) : []);

        const structuredLinks = rawUrls.map(url => {
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

        const li = rawUrls.find(u => u.toLowerCase().includes('linkedin.com')) || payloadToSave.linkedin_url || '';
        const gh = rawUrls.find(u => u.toLowerCase().includes('github.com')) || payloadToSave.github_url || '';
        const pf = rawUrls.find(u => !u.toLowerCase().includes('linkedin.com') && !u.toLowerCase().includes('github.com')) || payloadToSave.portfolio_url || '';

        const currentOrder = payloadToSave.display_order !== undefined && payloadToSave.display_order !== null && payloadToSave.display_order !== '' 
          ? Number(payloadToSave.display_order) 
          : (payloadToSave.id ? (parseMemberData(payloadToSave).display_order || 0) : (listData.length + 1));

        const rawBio = (payloadToSave.description || payloadToSave.biography || '').replace(/\n*<!--(?:KLEF|KLU)_LINKS:[\s\S]*?-->/g, '').trim();
        const metadataPayload = {
          links: structuredLinks,
          display_order: currentOrder
        };
        const finalBio = `${rawBio}\n\n<!--KLEF_LINKS:${JSON.stringify(metadataPayload)}-->`;

        payloadToSave.biography = finalBio;
        payloadToSave.display_order = currentOrder;
        payloadToSave.linkedin_url = li;
        payloadToSave.github_url = gh;
        payloadToSave.portfolio_url = pf;
        payloadToSave.social_links = structuredLinks;
        delete payloadToSave.custom_urls;
        delete payloadToSave.description;
      } else if (section === 'gallery') {
        const rawImages = Array.isArray(payloadToSave.images)
          ? payloadToSave.images.map(img => String(img || '').trim()).filter(Boolean)
          : (payloadToSave.url ? [payloadToSave.url.trim()] : []);

        if (rawImages.length === 0) {
          throw new Error('At least one photograph is required.');
        }

        const dateVal = payloadToSave.event_date || payloadToSave.date || '';
        const cleanDesc = (payloadToSave.description || '').replace(/\n*<!--(?:KLEF|KLU)_GALLERY:[\s\S]*?-->/g, '').trim();
        const currentOrder = payloadToSave.display_order !== undefined && payloadToSave.display_order !== null && payloadToSave.display_order !== '' 
          ? Number(payloadToSave.display_order) 
          : (payloadToSave.id ? (parseGalleryItem(payloadToSave).display_order || 0) : (listData.length + 1));

        const metadataPayload = {
          images: rawImages,
          date: dateVal ? String(dateVal).split('T')[0] : null,
          description: cleanDesc,
          display_order: currentOrder
        };

        const serializedTag = `\n\n<!--KLEF_GALLERY:${JSON.stringify(metadataPayload)}-->`;
        const finalDescription = cleanDesc ? `${cleanDesc}${serializedTag}` : serializedTag.trim();

        payloadToSave.caption = (payloadToSave.caption || payloadToSave.title || 'Event Photograph').trim();
        payloadToSave.url = rawImages[0];
        payloadToSave.description = finalDescription;
        payloadToSave.display_order = currentOrder;
        payloadToSave.event_date = dateVal ? String(dateVal).split('T')[0] : null;
        payloadToSave.images = rawImages;
      } else if (section === 'events') {
        const cleanDesc = (payloadToSave.description || '').replace(/\n*<!--(?:KLEF|KLU)_EVENT:[\s\S]*?-->/g, '').trim();
        const parsedExisting = parseEventData(payloadToSave);
        const currentOrder = payloadToSave.display_order !== undefined && payloadToSave.display_order !== null && payloadToSave.display_order !== '' 
          ? Number(payloadToSave.display_order) 
          : (payloadToSave.id ? (parsedExisting.display_order || 0) : (listData.length + 1));
        const currentFormat = payloadToSave.event_format || parsedExisting.event_format || 'in_person';

        const metadataPayload = {
          event_format: currentFormat,
          display_order: currentOrder
        };

        const serializedTag = `\n\n<!--KLEF_EVENT:${JSON.stringify(metadataPayload)}-->`;
        const finalDescription = cleanDesc ? `${cleanDesc}${serializedTag}` : serializedTag.trim();

        payloadToSave.description = finalDescription;
        payloadToSave.display_order = currentOrder;
      }

      if (payloadToSave.id) {
        res = await api.updateRow(targetTable, payloadToSave);
      } else {
        res = await api.createRow(targetTable, payloadToSave);
      }

      if (res && res.error) throw new Error(res.error);

      setSuccess('Database record updated successfully!');
      setModalOpen(false);
      setCurrentItem(null);
      loadSectionData();
      triggerDataRefresh();
      broadcastDataChange(targetTable);
    } catch (err) {
      console.error('CRUD action failed:', err);
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Item
  const handleDeleteCRUDItem = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this record?')) return;

    try {
      const table = section === 'events' ? 'events' : (section === 'members' ? 'members' : 'gallery_images');
      const res = await api.deleteRow(table, id);
      if (res.error) throw new Error(res.error);

      setSuccess('Record successfully deleted.');
      loadSectionData();
      triggerDataRefresh();
      broadcastDataChange(table);
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Deletion failed: ' + err.message);
    }
  };

  // Toggle status
  const handleToggleStatus = async (item, field) => {
    try {
      const table = section === 'events' ? 'events' : 'members';
      const updatedItem = { ...item, [field]: !item[field] };
      const res = await api.updateRow(table, updatedItem);
      if (res.error) throw new Error(res.error);

      setSuccess(`Status updated!`);
      loadSectionData();
      triggerDataRefresh();
      broadcastDataChange(table);
    } catch (err) {
      console.error('Status toggle failed:', err);
      setError('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading visual studio editor...</p>
      </div>
    );
  }

  const publicLink = section === 'home' ? '/' : (section === 'about-klef-acm' ? '/about-klef-acm' : (section === 'about-acm' ? '/about-acm' : (section === 'contact' ? '/contact' : `/${section}`)));

  return (
    <div>
      {/* Studio Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid var(--border)', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.6rem', color: 'var(--secondary)', margin: 0, textTransform: 'capitalize' }}>
              {section.replace('-', ' ')} Studio
            </h1>
            <span style={{ fontSize: '0.75rem', padding: '4px 10px', backgroundColor: 'rgba(0, 133, 202, 0.1)', color: 'var(--primary)', borderRadius: '999px', fontWeight: '700' }}>
              Live Visual CMS
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
            Visual block editor & real-time media management. All updates persist directly to database.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            to={publicLink}
            target="_blank"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Eye size={15} />
            <span>Preview Live Site</span>
            <ExternalLink size={13} />
          </Link>

          {['home', 'about-acm', 'about-klef-acm'].includes(section) && (
            <button
              type="button"
              onClick={handleAddCustomBlock}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={15} />
              <span>Add Custom Block</span>
            </button>
          )}

          {['home', 'about-acm', 'about-klef-acm', 'contact'].includes(section) && (
            <button
              type="button"
              disabled={saving}
              onClick={handleSavePageSettings}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
            >
              <Save size={15} />
              <span>{saving ? 'Publishing...' : 'Publish Live Updates'}</span>
            </button>
          )}

          {['events', 'gallery', 'members'].includes(section) && (
            <button 
              onClick={() => {
                const defaultItem = 
                  section === 'events' ? { title: '', description: '', date: new Date().toISOString().substring(0, 16), venue: '', speaker: '', registration_link: '', image_url: '', is_published: true, is_featured: false } :
                  section === 'members' ? { name: '', role: '', category: 'student_member', photograph_url: '', biography: '', linkedin_url: '', email: '', display_order: 0, is_active: true } :
                  { album_id: albums[0]?.id || '', url: '', caption: '', category: 'workshops', date: '', description: '', images: [''] };
                setCurrentItem(defaultItem);
                setModalOpen(true);
              }} 
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add New {section === 'events' ? 'Event' : (section === 'members' ? 'Member' : 'Photo Album')}
            </button>
          )}
        </div>
      </div>

      {/* Status Notifications */}
      {success && (
        <div className="alert alert-success" style={{ padding: '12px 16px', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-danger" style={{ padding: '12px 16px', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* =======================================================================
          1. VISUAL HOME PAGE STUDIO
          ======================================================================= */}
      {section === 'home' && pageData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* BLOCK 1: Hero Banner Visual Block */}
          <div className="card" style={{ border: '2px solid var(--primary-light)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--secondary)' }}>Hero Section & Main Showcase Banner</h3>
              </div>
              <span className="badge badge-primary">Primary Section</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700' }}>Hero Headline</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Empowering Future Computing Professionals"
                    value={pageData.content.hero?.title || ''}
                    onChange={(e) => setPageData({
                      ...pageData,
                      content: { ...pageData.content, hero: { ...pageData.content.hero, title: e.target.value } }
                    })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700' }}>Hero Subtitle</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. KLEF ACM Student Chapter at KL Deemed to be University"
                    value={pageData.content.hero?.subtitle || ''}
                    onChange={(e) => setPageData({
                      ...pageData,
                      content: { ...pageData.content, hero: { ...pageData.content.hero, subtitle: e.target.value } }
                    })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700' }}>Hero Description Paragraph</label>
                  <textarea
                    rows="4"
                    className="form-control"
                    placeholder="Detailed introductory statement..."
                    value={pageData.content.hero?.description || ''}
                    onChange={(e) => setPageData({
                      ...pageData,
                      content: { ...pageData.content, hero: { ...pageData.content.hero, description: e.target.value } }
                    })}
                  />
                </div>
              </div>

              {/* Live Hero Image Media Frame */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px', backgroundColor: 'var(--bg-main)' }}>
                <label className="form-label" style={{ fontWeight: '700', marginBottom: '10px', display: 'block' }}>
                  Hero Showcase Image
                </label>
                
                <div 
                  style={{
                    width: '100%',
                    height: '180px',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px dashed var(--border)',
                    backgroundColor: '#ffffff',
                    marginBottom: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <SafeImage
                    src={pageData.content.hero_image_url}
                    alt="Hero Preview"
                    fallbackIcon={ImageIcon}
                    fallbackText="No Hero Image Uploaded"
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', margin: 0, justifyContent: 'center' }}>
                    <Upload size={14} />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageUpload(e, 'hero_image_url')}
                    />
                  </label>

                  {pageData.content.hero_image_url && (
                    <button
                      type="button"
                      onClick={() => setPageData({
                        ...pageData,
                        content: { ...pageData.content, hero_image_url: '' }
                      })}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Remove image"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                    placeholder="Or paste direct image URL..."
                    value={pageData.content.hero_image_url || ''}
                    onChange={(e) => setPageData({
                      ...pageData,
                      content: { ...pageData.content, hero_image_url: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK 2: Statistics & Metrics Block */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Sparkles size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--secondary)' }}>Chapter Statistics Counters</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Events Count</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Optional (e.g. 10)"
                  value={pageData.content.stats?.events_count ?? ''}
                  onChange={(e) => setPageData({
                    ...pageData,
                    content: { ...pageData.content, stats: { ...pageData.content.stats, events_count: e.target.value === '' ? '' : parseInt(e.target.value) || 0 } }
                  })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Active Members</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Optional (e.g. 50)"
                  value={pageData.content.stats?.members_count ?? ''}
                  onChange={(e) => setPageData({
                    ...pageData,
                    content: { ...pageData.content, stats: { ...pageData.content.stats, members_count: e.target.value === '' ? '' : parseInt(e.target.value) || 0 } }
                  })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Technical Workshops</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Optional (e.g. 5)"
                  value={pageData.content.stats?.workshops_count ?? ''}
                  onChange={(e) => setPageData({
                    ...pageData,
                    content: { ...pageData.content, stats: { ...pageData.content.stats, workshops_count: e.target.value === '' ? '' : parseInt(e.target.value) || 0 } }
                  })}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Active Projects / SIGs</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Optional (e.g. 3)"
                  value={pageData.content.stats?.projects_count ?? ''}
                  onChange={(e) => setPageData({
                    ...pageData,
                    content: { ...pageData.content, stats: { ...pageData.content.stats, projects_count: e.target.value === '' ? '' : parseInt(e.target.value) || 0 } }
                  })}
                />
              </div>
            </div>
          </div>

          {/* BLOCK 3: Chapter Introduction & Editorial Highlights */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <FileText size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--secondary)' }}>Chapter Mission & Editorial Segments</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Introduction Heading</label>
              <input
                type="text"
                className="form-control"
                value={pageData.content.introduction?.heading || ''}
                onChange={(e) => setPageData({
                  ...pageData,
                  content: { ...pageData.content, introduction: { ...pageData.content.introduction, heading: e.target.value } }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Introduction Text</label>
              <textarea
                rows="4"
                className="form-control"
                value={pageData.content.introduction?.text || ''}
                onChange={(e) => setPageData({
                  ...pageData,
                  content: { ...pageData.content, introduction: { ...pageData.content.introduction, text: e.target.value } }
                })}
              />
            </div>

            {/* Editorial Showcase Photos */}
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <label className="form-label" style={{ fontWeight: '700', marginBottom: '16px', display: 'block' }}>
                Editorial Highlight Photos (Community, Awards, Research)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                
                {/* Community Photo */}
                <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Community Photo</span>
                  <div style={{ width: '100%', height: '110px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
                    <SafeImage
                      src={pageData.content.community_image_url}
                      alt="Community Preview"
                      fallbackIcon={Users}
                      fallbackText="No Photo"
                    />
                  </div>
                  <label className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center', cursor: 'pointer', justifyContent: 'center' }}>
                    <Upload size={13} /> Upload Image
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'community_image_url')} />
                  </label>
                </div>

                {/* Awards Photo */}
                <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Awards Photo</span>
                  <div style={{ width: '100%', height: '110px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
                    <SafeImage
                      src={pageData.content.awards_image_url}
                      alt="Awards Preview"
                      fallbackIcon={Award}
                      fallbackText="No Photo"
                    />
                  </div>
                  <label className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center', cursor: 'pointer', justifyContent: 'center' }}>
                    <Upload size={13} /> Upload Image
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'awards_image_url')} />
                  </label>
                </div>

                {/* Research Photo */}
                <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Research Photo</span>
                  <div style={{ width: '100%', height: '110px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
                    <SafeImage
                      src={pageData.content.research_image_url}
                      alt="Research Preview"
                      fallbackIcon={FileText}
                      fallbackText="No Photo"
                    />
                  </div>
                  <label className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center', cursor: 'pointer', justifyContent: 'center' }}>
                    <Upload size={13} /> Upload Image
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'research_image_url')} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK 4: Chapter Committee & Leadership Group Photograph */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Users size={20} style={{ color: 'var(--primary)' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--secondary)' }}>Chapter Committee & Leadership Group Photograph</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  This official group photo is showcased on the Home page under "Chapter Committee & Leadership" above the Explore Members Directory link.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', alignItems: 'center' }}>
              <div>
                <label className="form-label" style={{ fontWeight: '700' }}>Direct Group Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://... (or upload from computer on the right)"
                  value={pageData.content.team_group_image_url || ''}
                  onChange={(e) => setPageData({
                    ...pageData,
                    content: { ...pageData.content, team_group_image_url: e.target.value }
                  })}
                />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>
                  Supports high-resolution PNG, JPG, or WebP cohort photographs.
                </p>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px', backgroundColor: 'var(--bg-main)' }}>
                <div 
                  style={{
                    width: '100%',
                    height: '140px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: '#ffffff',
                    marginBottom: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <SafeImage
                    src={pageData.content.team_group_image_url}
                    alt="Chapter Committee Group Photo Preview"
                    fallbackIcon={Users}
                    fallbackText="No Group Photo Uploaded"
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <label className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', margin: 0, justifyContent: 'center' }}>
                    <Upload size={14} />
                    <span>Upload Group Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageUpload(e, 'team_group_image_url')}
                    />
                  </label>

                  {pageData.content.team_group_image_url && (
                    <button
                      type="button"
                      onClick={() => setPageData({
                        ...pageData,
                        content: { ...pageData.content, team_group_image_url: '' }
                      })}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Remove group photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC CUSTOM BLOCKS LIST */}
          {(pageData.content.custom_blocks || []).map((block, bIdx) => (
            <div key={block.id || bIdx} className="card" style={{ border: '1px solid var(--primary)', padding: '28px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#ffffff', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                    {bIdx + 1}
                  </span>
                  <h4 style={{ margin: 0, color: 'var(--secondary)' }}>Custom Section Block</h4>
                </div>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button type="button" onClick={() => handleMoveBlock(bIdx, -1)} disabled={bIdx === 0} className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }}>
                    <MoveUp size={14} />
                  </button>
                  <button type="button" onClick={() => handleMoveBlock(bIdx, 1)} disabled={bIdx === (pageData.content.custom_blocks.length - 1)} className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }}>
                    <MoveDown size={14} />
                  </button>
                  <button type="button" onClick={() => handleRemoveCustomBlock(bIdx)} className="btn btn-secondary btn-sm" style={{ padding: '6px 8px', color: 'var(--danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Block Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={block.title || ''}
                      onChange={(e) => {
                        const updated = [...pageData.content.custom_blocks];
                        updated[bIdx].title = e.target.value;
                        setPageData({ ...pageData, content: { ...pageData.content, custom_blocks: updated } });
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Block Subtitle / Category</label>
                    <input
                      type="text"
                      className="form-control"
                      value={block.subtitle || ''}
                      onChange={(e) => {
                        const updated = [...pageData.content.custom_blocks];
                        updated[bIdx].subtitle = e.target.value;
                        setPageData({ ...pageData, content: { ...pageData.content, custom_blocks: updated } });
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Block Description Text</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      value={block.text || ''}
                      onChange={(e) => {
                        const updated = [...pageData.content.custom_blocks];
                        updated[bIdx].text = e.target.value;
                        setPageData({ ...pageData, content: { ...pageData.content, custom_blocks: updated } });
                      }}
                    />
                  </div>
                </div>

                {/* Block Image Upload */}
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '16px', backgroundColor: 'var(--bg-main)' }}>
                  <label className="form-label" style={{ fontWeight: '700', marginBottom: '8px', display: 'block' }}>Section Image</label>
                  <div style={{ width: '100%', height: '120px', borderRadius: '4px', backgroundColor: '#ffffff', border: '1px solid var(--border)', marginBottom: '10px', overflow: 'hidden' }}>
                    <SafeImage
                      src={block.image_url}
                      alt="Block preview"
                      fallbackIcon={ImageIcon}
                      fallbackText="No Section Image"
                    />
                  </div>
                  <label className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center', cursor: 'pointer', justifyContent: 'center' }}>
                    <Upload size={13} /> Upload Image
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'image_url', bIdx)} />
                  </label>
                </div>
              </div>
            </div>
          ))}

          {/* Bottom Save Trigger */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' }}>
            <button type="button" onClick={handleAddCustomBlock} className="btn btn-secondary">
              <PlusCircle size={16} /> Add Custom Block
            </button>
            <button type="button" disabled={saving} onClick={handleSavePageSettings} className="btn btn-primary" style={{ fontWeight: '700', padding: '12px 28px' }}>
              <Save size={18} /> {saving ? 'Publishing Updates...' : 'Publish Live Updates'}
            </button>
          </div>
        </div>
      )}

      {/* =======================================================================
          2. VISUAL ABOUT PAGES STUDIO (About KLEF ACM & About Global ACM)
          ======================================================================= */}
      {['about-acm', 'about-klef-acm'].includes(section) && pageData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ color: 'var(--secondary)', marginBottom: '20px' }}>Chapter Overview & Statements</h3>
            
            <div className="form-group">
              <label className="form-label">Main Heading / Statement</label>
              <input
                type="text"
                className="form-control"
                value={pageData.content.heading || pageData.content.title || ''}
                onChange={(e) => setPageData({
                  ...pageData,
                  content: { ...pageData.content, heading: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Chapter Introduction</label>
              <textarea
                rows="4"
                className="form-control"
                value={pageData.content.introduction || pageData.content.intro || ''}
                onChange={(e) => setPageData({
                  ...pageData,
                  content: { ...pageData.content, introduction: e.target.value }
                })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Vision Statement</label>
                <textarea
                  rows="4"
                  className="form-control"
                  value={pageData.content.vision || ''}
                  onChange={(e) => setPageData({
                    ...pageData,
                    content: { ...pageData.content, vision: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mission Statement</label>
                <textarea
                  rows="4"
                  className="form-control"
                  value={pageData.content.mission || ''}
                  onChange={(e) => setPageData({
                    ...pageData,
                    content: { ...pageData.content, mission: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Blocks */}
          {(pageData.content.custom_blocks || []).map((block, bIdx) => (
            <div key={block.id || bIdx} className="card" style={{ border: '1px solid var(--primary)', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, color: 'var(--secondary)' }}>Custom Section #{bIdx + 1}</h4>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button type="button" onClick={() => handleMoveBlock(bIdx, -1)} disabled={bIdx === 0} className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }} title="Move block up">
                    <MoveUp size={14} />
                  </button>
                  <button type="button" onClick={() => handleMoveBlock(bIdx, 1)} disabled={bIdx === ((pageData.content.custom_blocks || []).length - 1)} className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }} title="Move block down">
                    <MoveDown size={14} />
                  </button>
                  <button type="button" onClick={() => handleRemoveCustomBlock(bIdx)} className="btn btn-secondary btn-sm" style={{ padding: '6px 8px', color: 'var(--danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={block.title || ''}
                  onChange={(e) => {
                    const updated = [...pageData.content.custom_blocks];
                    updated[bIdx].title = e.target.value;
                    setPageData({ ...pageData, content: { ...pageData.content, custom_blocks: updated } });
                  }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content Text</label>
                <textarea
                  rows="3"
                  className="form-control"
                  value={block.text || ''}
                  onChange={(e) => {
                    const updated = [...pageData.content.custom_blocks];
                    updated[bIdx].text = e.target.value;
                    setPageData({ ...pageData, content: { ...pageData.content, custom_blocks: updated } });
                  }}
                />
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={handleAddCustomBlock} className="btn btn-secondary">
              <PlusCircle size={16} /> Add Custom Block
            </button>
            <button type="button" disabled={saving} onClick={handleSavePageSettings} className="btn btn-primary" style={{ fontWeight: '700', padding: '12px 28px' }}>
              <Save size={18} /> {saving ? 'Publishing Updates...' : 'Publish Live Updates'}
            </button>
          </div>
        </div>
      )}

      {/* =======================================================================
          3. VISUAL CONTACT DESK STUDIO
          ======================================================================= */}
      {section === 'contact' && pageData && (
        <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ color: 'var(--secondary)', margin: 0 }}>Chapter Contact Information & Campus Directions</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Official Contact Email</label>
              <input
                type="email"
                className="form-control"
                value={pageData.value?.email || ''}
                onChange={(e) => setPageData({
                  ...pageData,
                  value: { ...pageData.value, email: e.target.value }
                })}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Helpdesk Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={pageData.value?.phone || ''}
                onChange={(e) => setPageData({
                  ...pageData,
                  value: { ...pageData.value, phone: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Google Maps Directions Link (URL)</label>
            <input
              type="text"
              className="form-control"
              value={pageData.value?.directions_url || 'https://maps.app.goo.gl/uLVUEpEqWxLT5MFS7'}
              onChange={(e) => setPageData({
                ...pageData,
                value: { ...pageData.value, directions_url: e.target.value }
              })}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Campus Address</label>
            <textarea
              rows="4"
              className="form-control"
              value={pageData.value?.address || ''}
              onChange={(e) => setPageData({
                ...pageData,
                value: { ...pageData.value, address: e.target.value }
              })}
            />
          </div>

          <button type="button" disabled={saving} onClick={handleSavePageSettings} className="btn btn-primary" style={{ alignSelf: 'flex-start', fontWeight: '700', padding: '12px 28px' }}>
            <Save size={18} /> {saving ? 'Publishing Updates...' : 'Publish Contact Settings'}
          </button>
        </div>
      )}

      {/* =======================================================================
          4. VISUAL EVENTS LIST STUDIO
          ======================================================================= */}
      {section === 'events' && (
        <div>
          {listData.length > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: 'rgba(0, 92, 169, 0.08)', border: '1px solid rgba(0, 92, 169, 0.18)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '700', marginBottom: '18px' }}>
              <GripVertical size={15} />
              <span>Drag & Drop cards to reposition like Instagram, or use the arrows</span>
            </div>
          )}

          {listData.length === 0 ? (
            <div className="card text-center" style={{ padding: '60px 20px' }}>
              <Calendar size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px auto', opacity: 0.5 }} />
              <h3>No Events Listed Yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Create coding competitions, hackathons, and guest workshops.</p>
              <button 
                onClick={() => {
                  setCurrentItem({ title: '', description: '', date: new Date().toISOString().substring(0, 16), venue: '', speaker: '', registration_link: '', image_url: '', display_order: listData.length + 1, is_published: true, is_featured: false });
                  setModalOpen(true);
                }} 
                className="btn btn-primary"
              >
                <Plus size={16} /> Create First Event
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {listData.map((ev, evIdx) => (
                <motion.div 
                  layout
                  layoutId={`ev-${ev.id || evIdx}`}
                  key={ev.id || evIdx} 
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, evIdx)}
                  onDragOver={(e) => handleDragOver(e, evIdx)}
                  onDragLeave={(e) => handleDragLeave(e, evIdx)}
                  onDrop={(e) => handleDrop(e, evIdx)}
                  onDragEnd={handleDragEnd}
                  className="card" 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    padding: '20px', 
                    position: 'relative',
                    cursor: draggedIdx === evIdx ? 'grabbing' : 'grab',
                    opacity: draggedIdx === evIdx ? 0.4 : 1,
                    transform: dragOverIdx === evIdx && draggedIdx !== evIdx ? 'scale(1.02) translateY(-4px)' : 'none',
                    outline: dragOverIdx === evIdx && draggedIdx !== evIdx ? '2.5px dashed var(--primary)' : 'none',
                    outlineOffset: '4px',
                    boxShadow: dragOverIdx === evIdx && draggedIdx !== evIdx ? '0 12px 30px rgba(0, 92, 169, 0.2)' : undefined,
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, opacity 0.2s ease'
                  }}
                >
                  {/* Event Banner Image (Uncropped, Click-to-Zoom Lightbox) */}
                  <div 
                    style={{ 
                      width: '100%', 
                      height: '170px', 
                      borderRadius: '6px', 
                      backgroundColor: '#090D16', 
                      border: '1px solid var(--border)', 
                      marginBottom: '16px', 
                      overflow: 'hidden', 
                      position: 'relative',
                      cursor: ev.image_url ? 'zoom-in' : 'grab',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={() => {
                      if (ev.image_url) setLightboxImage({ url: ev.image_url, title: ev.title });
                    }}
                    title={ev.image_url ? 'Click to view full uncropped image' : 'Drag card to reposition'}
                  >
                    <SafeImage
                      src={ev.image_url}
                      alt={ev.title}
                      fallbackIcon={Calendar}
                      fallbackText="No Banner Image"
                      fit="contain"
                    />
                    {ev.image_url && (
                      <span style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(15,23,42,0.85)', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Maximize2 size={11} /> Full Size
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span 
                        title="Drag this card to reposition"
                        style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: '800', 
                          backgroundColor: 'var(--bg-main)', 
                          border: '1px solid var(--border)', 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          color: 'var(--primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'grab'
                        }}
                      >
                        <GripVertical size={13} style={{ color: 'var(--text-muted)' }} />
                        #{evIdx + 1}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary)', margin: 0 }}>{ev.title}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        {ev.event_format === 'online' || ev.venue?.toLowerCase().includes('online') ? '🌐 Online' : (ev.event_format === 'hybrid' ? '🔄 Hybrid' : '📍 Campus')}
                      </span>
                      <span className={`badge ${ev.is_published ? 'badge-success' : 'badge-primary'}`}>
                        {ev.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 12px 0' }}>
                    📅 {new Date(ev.date).toLocaleDateString('en-US', { dateStyle: 'medium' })} • 📍 {ev.venue}
                  </p>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', flexGrow: 1, marginBottom: '16px', lineHeight: '1.5' }}>
                    {ev.description ? ev.description.substring(0, 90) + '...' : 'No description.'}
                  </p>

                  {/* Actions & Reordering Controls */}
                  <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Reordering Buttons */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleMoveListItem(evIdx, -1)}
                        disabled={evIdx === 0}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 8px' }}
                        title="Move Event Up"
                      >
                        <MoveUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveListItem(evIdx, 1)}
                        disabled={evIdx === listData.length - 1}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 8px' }}
                        title="Move Event Down"
                      >
                        <MoveDown size={13} />
                      </button>
                    </div>

                    {/* Edit, Status, Delete */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleToggleStatus(ev, 'is_published')}
                        className="btn btn-secondary btn-sm"
                        title={ev.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {ev.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button
                        onClick={() => {
                          setCurrentItem({ ...ev, date: new Date(ev.date).toISOString().substring(0, 16), display_order: ev.display_order ?? evIdx + 1 });
                          setModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCRUDItem(ev.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =======================================================================
          5. VISUAL GALLERY STUDIO
          ======================================================================= */}
      {section === 'gallery' && (
        <div>
          {listData.length > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: 'rgba(0, 92, 169, 0.08)', border: '1px solid rgba(0, 92, 169, 0.18)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '700', marginBottom: '18px' }}>
              <GripVertical size={15} />
              <span>Drag & Drop photos to reposition like Instagram, or use the arrows</span>
            </div>
          )}

          {listData.length === 0 ? (
            <div className="card text-center" style={{ padding: '60px 20px' }}>
              <ImageIcon size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px auto', opacity: 0.5 }} />
              <h3>No Photographs Uploaded</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Upload photos from hackathons, seminars, and chapter meetings.</p>
              <button 
                onClick={() => {
                  setCurrentItem({ album_id: albums[0]?.id || '', url: '', caption: '', category: 'workshops', display_order: listData.length + 1, images: [''] });
                  setModalOpen(true);
                }} 
                className="btn btn-primary"
              >
                <Plus size={16} /> Upload First Photo
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {listData.map((img, imgIdx) => {
                const parsed = parseGalleryItem(img);
                return (
                  <motion.div 
                    layout
                    layoutId={`gallery-${img.id || imgIdx}`}
                    key={img.id || imgIdx} 
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, imgIdx)}
                    onDragOver={(e) => handleDragOver(e, imgIdx)}
                    onDragLeave={(e) => handleDragLeave(e, imgIdx)}
                    onDrop={(e) => handleDrop(e, imgIdx)}
                    onDragEnd={handleDragEnd}
                    className="card" 
                    style={{ 
                      padding: '16px', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: draggedIdx === imgIdx ? 'grabbing' : 'grab',
                      opacity: draggedIdx === imgIdx ? 0.4 : 1,
                      transform: dragOverIdx === imgIdx && draggedIdx !== imgIdx ? 'scale(1.02) translateY(-4px)' : 'none',
                      outline: dragOverIdx === imgIdx && draggedIdx !== imgIdx ? '2.5px dashed var(--primary)' : 'none',
                      outlineOffset: '4px',
                      boxShadow: dragOverIdx === imgIdx && draggedIdx !== imgIdx ? '0 12px 30px rgba(0, 92, 169, 0.2)' : undefined,
                      transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, opacity 0.2s ease'
                    }}
                  >
                    {/* Uncropped Gallery Thumbnail with Lightbox Click */}
                    <div 
                      style={{ 
                        width: '100%', 
                        height: '180px', 
                        borderRadius: '6px', 
                        backgroundColor: '#090D16', 
                        border: '1px solid var(--border)', 
                        marginBottom: '12px', 
                        overflow: 'hidden', 
                        position: 'relative',
                        cursor: parsed.coverUrl ? 'zoom-in' : 'grab',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => {
                        if (parsed.coverUrl) setLightboxImage({ url: parsed.coverUrl, title: parsed.title });
                      }}
                      title="Click to view full uncropped image"
                    >
                      <SafeImage
                        src={parsed.coverUrl}
                        alt={parsed.title}
                        fallbackIcon={ImageIcon}
                        fallbackText="Gallery Image"
                        fit="contain"
                      />
                      {parsed.images.length > 1 && (
                        <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(15,23,42,0.85)', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700', backdropFilter: 'blur(4px)' }}>
                          {parsed.images.length} Photos
                        </span>
                      )}
                      <span style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(15,23,42,0.85)', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Maximize2 size={11} /> View
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span 
                        title="Drag this card to reposition"
                        style={{ 
                          fontSize: '0.72rem', 
                          fontWeight: '800', 
                          backgroundColor: 'var(--bg-main)', 
                          border: '1px solid var(--border)', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          color: 'var(--primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          cursor: 'grab'
                        }}
                      >
                        <GripVertical size={12} style={{ color: 'var(--text-muted)' }} />
                        #{imgIdx + 1}
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--secondary)', margin: 0, lineHeight: '1.3' }}>
                        {parsed.title}
                      </h4>
                    </div>

                    {parsed.date && (
                      <span style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '6px' }}>
                        📅 {parsed.date}
                      </span>
                    )}

                    {/* Actions & Reordering Controls */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border)', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleMoveListItem(imgIdx, -1)}
                          disabled={imgIdx === 0}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 8px' }}
                          title="Move Photo Up"
                        >
                          <MoveUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveListItem(imgIdx, 1)}
                          disabled={imgIdx === listData.length - 1}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 8px' }}
                          title="Move Photo Down"
                        >
                          <MoveDown size={13} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentItem({
                              ...img,
                              caption: parsed.title,
                              date: parsed.date,
                              description: parsed.description,
                              images: parsed.images.length > 0 ? parsed.images : [''],
                              url: parsed.coverUrl,
                              display_order: img.display_order ?? imgIdx + 1
                            });
                            setModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCRUDItem(img.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =======================================================================
          6. VISUAL MEMBERS & LEADERSHIP STUDIO
          ======================================================================= */}
      {section === 'members' && (
        <div>
          {listData.length > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: 'rgba(0, 92, 169, 0.08)', border: '1px solid rgba(0, 92, 169, 0.18)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '700', marginBottom: '18px' }}>
              <GripVertical size={15} />
              <span>Drag & Drop members to reposition like Instagram, or use the arrows</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {listData.map((member, mIdx) => (
              <motion.div 
                layout
                layoutId={`member-${member.id || mIdx}`}
                key={member.id || mIdx} 
                draggable={true}
                onDragStart={(e) => handleDragStart(e, mIdx)}
                onDragOver={(e) => handleDragOver(e, mIdx)}
                onDragLeave={(e) => handleDragLeave(e, mIdx)}
                onDrop={(e) => handleDrop(e, mIdx)}
                onDragEnd={handleDragEnd}
                className="card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center', 
                  padding: '24px', 
                  position: 'relative',
                  cursor: draggedIdx === mIdx ? 'grabbing' : 'grab',
                  opacity: draggedIdx === mIdx ? 0.4 : 1,
                  transform: dragOverIdx === mIdx && draggedIdx !== mIdx ? 'scale(1.02) translateY(-4px)' : 'none',
                  outline: dragOverIdx === mIdx && draggedIdx !== mIdx ? '2.5px dashed var(--primary)' : 'none',
                  outlineOffset: '4px',
                  boxShadow: dragOverIdx === mIdx && draggedIdx !== mIdx ? '0 12px 30px rgba(0, 92, 169, 0.2)' : undefined,
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, opacity 0.2s ease'
                }}
              >
                {/* Member Profile Photo (Uncropped, Click-to-Zoom Lightbox) */}
                <div 
                  style={{ 
                    width: '90px', 
                    height: '90px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--bg-main)', 
                    border: '2.5px solid var(--primary)', 
                    marginBottom: '14px', 
                    overflow: 'hidden', 
                    cursor: member.photograph_url ? 'zoom-in' : 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                  }}
                  onClick={() => {
                    if (member.photograph_url) setLightboxImage({ url: member.photograph_url, title: member.name });
                  }}
                  title={member.photograph_url ? 'Click to view full uncropped photo' : 'Drag card to reposition'}
                >
                  <SafeImage
                    src={member.photograph_url}
                    alt={member.name}
                    fallbackIcon={Users}
                    fallbackText="Photo"
                    fit="cover"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span 
                    title="Drag this card to reposition"
                    style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: '800', 
                      backgroundColor: 'var(--bg-main)', 
                      border: '1px solid var(--border)', 
                      padding: '1px 6px', 
                      borderRadius: '4px', 
                      color: 'var(--primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      cursor: 'grab'
                    }}
                  >
                    <GripVertical size={11} style={{ color: 'var(--text-muted)' }} />
                    #{mIdx + 1}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary)', margin: 0 }}>{member.name}</h3>
                </div>

                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>{member.role}</span>
                <span className="badge badge-primary" style={{ textTransform: 'capitalize', fontSize: '0.7rem', marginBottom: '16px' }}>
                  {member.category ? member.category.replace('_', ' ') : 'Member'}
                </span>

                {/* Actions & Reordering Controls */}
                <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '12px', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleMoveListItem(mIdx, -1)}
                      disabled={mIdx === 0}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 8px' }}
                      title="Move Member Up"
                    >
                      <MoveUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveListItem(mIdx, 1)}
                      disabled={mIdx === listData.length - 1}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 8px' }}
                      title="Move Member Down"
                    >
                      <MoveDown size={13} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        const parsed = parseMemberData(member);
                        setCurrentItem({
                          ...member,
                          biography: parsed.bio,
                          description: parsed.bio,
                          custom_urls: parsed.rawUrls.length > 0 ? parsed.rawUrls : [''],
                          display_order: member.display_order ?? mIdx + 1
                        });
                        setModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCRUDItem(member.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL: CRUD CREATE & EDIT MODAL
          ======================================================================= */}
      {modalOpen && currentItem && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalOpen(false)}>
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.4rem', color: 'var(--secondary)', marginBottom: '20px' }}>
              {currentItem.id ? 'Edit' : 'Create'} {section === 'events' ? 'Event' : (section === 'members' ? 'Member' : 'Photo')}
            </h2>

            <form onSubmit={handleSaveCRUDItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* EVENT FIELDS */}
              {section === 'events' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Event Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Algorithmic Sprint Hackathon"
                      value={currentItem.title || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Date & Time <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <input
                        type="datetime-local"
                        required
                        className="form-control"
                        value={currentItem.date || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, date: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Venue / Room</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. CSE Seminar Hall 1"
                        value={currentItem.venue || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, venue: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Keynote Speaker</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Speaker name"
                        value={currentItem.speaker || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, speaker: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Registration Link</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://forms.gle/..."
                        value={currentItem.registration_link || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, registration_link: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Event Format / Mode <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <select
                        className="form-control"
                        value={currentItem.event_format || (currentItem.venue?.toLowerCase().includes('online') ? 'online' : 'in_person')}
                        onChange={(e) => setCurrentItem({ ...currentItem, event_format: e.target.value })}
                      >
                        <option value="in_person">In-Person (Offline on Campus)</option>
                        <option value="online">Online (Virtual Webinar / Meeting)</option>
                        <option value="hybrid">Hybrid (In-Person + Online Stream)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Display Order / Position</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 1, 2, 3..."
                        value={currentItem.display_order ?? ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, display_order: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Event Description</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      placeholder="Event details, schedule, prerequisites..."
                      value={currentItem.description || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                    />
                  </div>

                  {/* Banner Image with Choose File & Contain Preview */}
                  <div className="form-group">
                    <label className="form-label">Event Banner Photo</label>
                    {currentItem.image_url && (
                      <div 
                        style={{ 
                          marginBottom: '10px', 
                          width: '100%', 
                          height: '160px', 
                          borderRadius: '6px', 
                          border: '1px solid var(--border)', 
                          backgroundColor: '#090D16', 
                          overflow: 'hidden', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          cursor: 'zoom-in'
                        }}
                        onClick={() => setLightboxImage({ url: currentItem.image_url, title: currentItem.title || 'Event Banner' })}
                        title="Click to zoom preview"
                      >
                        <SafeImage src={currentItem.image_url} alt="Event Preview" fit="contain" />
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <Upload size={14} />
                        <span>{uploadingImage ? 'Uploading...' : 'Choose a File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload(e, 'image_url')}
                        />
                      </label>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or enter direct URL below:</span>
                    </div>

                    <input
                      type="text"
                      placeholder="https://example.com/banner.jpg"
                      className="form-control"
                      style={{ marginTop: '8px', fontSize: '0.85rem' }}
                      value={currentItem.image_url || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, image_url: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={currentItem.is_published || false}
                        onChange={(e) => setCurrentItem({ ...currentItem, is_published: e.target.checked })}
                      />
                      <span>Publish Live on Website</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={currentItem.is_featured || false}
                        onChange={(e) => setCurrentItem({ ...currentItem, is_featured: e.target.checked })}
                      />
                      <span>Featured Event</span>
                    </label>
                  </div>
                </>
              )}

              {/* GALLERY EVENT FIELDS */}
              {section === 'gallery' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Event / Photograph Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. National Hackathon 2026, AI Cloud Summit"
                      value={currentItem.caption || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, caption: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label">Event Date</label>
                        <small style={{ color: 'var(--text-muted)' }}>Optional</small>
                      </div>
                      <input
                        type="date"
                        className="form-control"
                        value={currentItem.date || currentItem.event_date || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, date: e.target.value, event_date: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-control"
                        value={currentItem.category || 'workshops'}
                        onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                      >
                        <option value="workshops">Workshops</option>
                        <option value="competitions">Competitions & Hackathons</option>
                        <option value="seminars">Seminars</option>
                        <option value="socials">Socials & Meetups</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Display Order</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 1, 2, 3..."
                        value={currentItem.display_order ?? ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, display_order: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label">Event Description / Bio</label>
                      <small style={{ color: 'var(--text-muted)' }}>Optional</small>
                    </div>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Brief summary, winners list, notable highlights from the event..."
                      value={currentItem.description || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                    />
                  </div>

                  {/* Multi-Photo Management Section */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', backgroundColor: 'var(--surface)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <label className="form-label" style={{ marginBottom: 2 }}>Event Photographs <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Add multiple photos (displayed side-by-side like Instagram without cropping)</small>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentImgs = Array.isArray(currentItem.images) ? currentItem.images : [currentItem.url || ''];
                          setCurrentItem({
                            ...currentItem,
                            images: [...currentImgs, '']
                          });
                        }}
                        className="btn btn-outline-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Add URL Field
                      </button>
                    </div>

                    {/* Dynamic Image URLs List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(Array.isArray(currentItem.images) ? currentItem.images : [currentItem.url || '']).map((imgVal, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '6px 8px', borderRadius: '4px', backgroundColor: 'var(--background)', border: '1px solid var(--border)', minWidth: '60px', textAlign: 'center' }}>
                            {idx === 0 ? 'Cover' : `Photo ${idx + 1}`}
                          </span>
                          <input
                            type="url"
                            placeholder="https://example.com/photo.jpg"
                            value={imgVal}
                            onChange={(e) => {
                              const newImgs = [...(Array.isArray(currentItem.images) ? currentItem.images : [currentItem.url || ''])];
                              newImgs[idx] = e.target.value;
                              setCurrentItem({
                                ...currentItem,
                                images: newImgs,
                                url: newImgs[0] || ''
                              });
                            }}
                            className="form-control form-control-sm"
                            style={{ flex: 1 }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImgs = (Array.isArray(currentItem.images) ? currentItem.images : [currentItem.url || '']).filter((_, i) => i !== idx);
                              setCurrentItem({
                                ...currentItem,
                                images: newImgs.length > 0 ? newImgs : [''],
                                url: newImgs[0] || ''
                              });
                            }}
                            className="btn btn-sm btn-outline-danger"
                            style={{ padding: '6px 10px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Upload File Input */}
                    <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Upload size={14} />
                        <span>Choose a File</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = async () => {
                              try {
                                const base64 = reader.result.split(',')[1] || reader.result;
                                const res = await api.uploadImage(file.name, file.type, base64);
                                if (res && res.url) {
                                  const currentImgs = Array.isArray(currentItem.images) ? currentItem.images.filter(Boolean) : (currentItem.url ? [currentItem.url] : []);
                                  const updated = [...currentImgs, res.url];
                                  setCurrentItem({
                                    ...currentItem,
                                    images: updated,
                                    url: updated[0] || ''
                                  });
                                }
                              } catch (err) {
                                alert('Upload failed: ' + err.message);
                              }
                            };
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* MEMBER FIELDS */}
              {section === 'members' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Dr. K. Srinivas"
                        value={currentItem.name || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Role Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Faculty Coordinator / Chapter Lead"
                        value={currentItem.role || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, role: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Committee Category</label>
                      <select
                        className="form-control"
                        value={currentItem.category || 'student_member'}
                        onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                      >
                        <option value="faculty_coordinator">Faculty Coordinator</option>
                        <option value="chair">Chapter Chair</option>
                        <option value="vice_chair">Vice Chair</option>
                        <option value="technical_lead">Technical / SIG Lead</option>
                        <option value="secretary">Secretary</option>
                        <option value="treasurer">Treasurer</option>
                        <option value="student_member">Executive Committee Member</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Display Order</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 1, 2, 3..."
                        value={currentItem.display_order ?? ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, display_order: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="e.g. member@kluniversity.in"
                        value={currentItem.email || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://linkedin.com/in/..."
                        value={currentItem.linkedin_url || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, linkedin_url: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GitHub Profile URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://github.com/..."
                        value={currentItem.github_url || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, github_url: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Profile Photo with Choose File & Contain Preview */}
                  <div className="form-group">
                    <label className="form-label">Profile Photograph</label>
                    {currentItem.photograph_url && (
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div 
                          style={{ 
                            width: '70px', 
                            height: '70px', 
                            borderRadius: '50%', 
                            overflow: 'hidden', 
                            border: '2px solid var(--primary)',
                            backgroundColor: 'var(--bg-main)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'zoom-in'
                          }}
                          onClick={() => setLightboxImage({ url: currentItem.photograph_url, title: currentItem.name || 'Member Photo' })}
                          title="Click to view full photo"
                        >
                          <SafeImage src={currentItem.photograph_url} alt="Member Preview" fit="cover" />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--secondary)', display: 'block' }}>Photo ready</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to view full size</span>
                        </div>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <Upload size={14} />
                        <span>Choose a File</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload(e, 'photograph_url')}
                        />
                      </label>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or enter direct URL below:</span>
                    </div>

                    <input
                      type="text"
                      placeholder="https://example.com/photo.jpg"
                      className="form-control"
                      style={{ marginTop: '8px', fontSize: '0.85rem' }}
                      value={currentItem.photograph_url || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, photograph_url: e.target.value })}
                    />
                  </div>

                  {/* Dynamic Custom URLs Section */}
                  <div style={{ marginTop: '8px', marginBottom: '16px', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', backgroundColor: 'var(--surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <label className="form-label" style={{ marginBottom: 2 }}>Profile Links & Custom URLs</label>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Add GitHub, Portfolio, Twitter/X, Instagram, or any custom URL (displayed on member bio page)</small>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentUrls = Array.isArray(currentItem.custom_urls) ? currentItem.custom_urls : [];
                          setCurrentItem({
                            ...currentItem,
                            custom_urls: [...currentUrls, '']
                          });
                        }}
                        className="btn btn-outline-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Add URL
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(Array.isArray(currentItem.custom_urls) ? currentItem.custom_urls : []).map((urlVal, idx) => {
                        const uLower = String(urlVal || '').toLowerCase();
                        let badge = 'Website';
                        if (uLower.includes('github.com')) badge = 'GitHub';
                        else if (uLower.includes('twitter.com') || uLower.includes('x.com')) badge = 'Twitter';
                        else if (uLower.includes('instagram.com')) badge = 'Instagram';
                        else if (uLower.includes('scholar.google')) badge = 'Scholar';

                        return (
                          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '6px 8px', borderRadius: '4px', backgroundColor: 'var(--background)', border: '1px solid var(--border)', minWidth: '65px', textAlign: 'center' }}>
                              {badge}
                            </span>
                            <input
                              type="url"
                              placeholder="Paste URL (e.g. https://github.com/... or https://portfolio.dev)"
                              value={urlVal}
                              onChange={(e) => {
                                const newUrls = [...currentItem.custom_urls];
                                newUrls[idx] = e.target.value;
                                setCurrentItem({ ...currentItem, custom_urls: newUrls });
                              }}
                              className="form-control form-control-sm"
                              style={{ flex: 1 }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newUrls = currentItem.custom_urls.filter((_, i) => i !== idx);
                                setCurrentItem({ ...currentItem, custom_urls: newUrls });
                              }}
                              className="btn btn-sm btn-outline-danger"
                              style={{ padding: '6px 10px' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Description / Biography (No Word Limit)</label>
                    <textarea
                      rows="5"
                      className="form-control"
                      placeholder="Enter detailed member description, technical interests, university contributions, research topics, background..."
                      value={currentItem.description ?? currentItem.biography ?? ''}
                      onChange={(e) => setCurrentItem({ 
                        ...currentItem, 
                        description: e.target.value,
                        biography: e.target.value 
                      })}
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>
                      If a description is provided, visitors on the website can click this member to open their profile details.
                    </small>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-sm" style={{ fontWeight: '700' }}>
                  <Save size={15} /> {saving ? 'Saving...' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          FULLSCREEN IMAGE LIGHTBOX MODAL (PORTALED DIRECTLY TO BODY)
          ======================================================================= */}
      {lightboxImage && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2147483647,
            backgroundColor: 'rgba(7, 11, 20, 0.94)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setLightboxImage(null)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1.5px solid rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
            title="Close (Esc)"
          >
            <X size={26} />
          </button>

          {/* Centered Image Container (Uncropped Full Scale) */}
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
              src={lightboxImage.url}
              alt={lightboxImage.title || 'Full Resolution Preview'}
              style={{
                maxWidth: '92vw',
                maxHeight: '82vh',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            />
            {lightboxImage.title && (
              <div
                style={{
                  marginTop: '14px',
                  color: '#FFFFFF',
                  fontSize: '1rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  padding: '6px 18px',
                  borderRadius: '999px',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                {lightboxImage.title}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
