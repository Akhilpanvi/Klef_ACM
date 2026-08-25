import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Check, X, Upload, Save, Eye, EyeOff, Sparkles, PlusCircle, MinusCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { SiteDataContext } from '../App';

export default function AdminEditPage() {
  const { section } = useParams();
  const navigate = useNavigate();
  const { triggerDataRefresh } = useContext(SiteDataContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // CMS States depending on active section
  const [pageData, setPageData] = useState(null); // Used for Home and About pages
  const [listData, setListData] = useState([]);   // Used for Events, Gallery, Members lists
  const [albums, setAlbums] = useState([]);       // For gallery album association
  
  // Modal states for CRUD operations
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null); // Item being created or edited
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load section data
  const loadSectionData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setPageData(null);
    setListData([]);

    try {
      if (['home', 'about-acm', 'about-klef-acm'].includes(section)) {
        // Retrieve page json data
        const data = await api.getTable('pages');
        const activePage = data.find(p => p.slug === section);
        if (activePage) {
          setPageData(activePage);
        } else {
          // If page slug does not exist, create stub local data
          setPageData({ slug: section, title: `${section.toUpperCase()} Page`, content: {} });
        }
      } else if (section === 'contact') {
        const data = await api.getTable('contact_settings');
        const activeContact = data.find(c => c.key === 'contact_info');
        if (activeContact) {
          setPageData(activeContact);
        } else {
          setPageData({ key: 'contact_info', value: {} });
        }
      } else if (section === 'events') {
        const data = await api.getTable('events');
        setListData(data);
      } else if (section === 'gallery') {
        const [images, alb] = await Promise.all([
          api.getTable('gallery_images'),
          api.getTable('gallery_albums')
        ]);
        setListData(images);
        setAlbums(alb);

        // If no albums exist, create a default album placeholder
        if (alb.length === 0) {
          const defAlbum = await api.createRow('gallery_albums', { name: 'General', description: 'Chapter activities' });
          setAlbums([defAlbum]);
        }
      } else if (section === 'members') {
        const data = await api.getTable('members');
        setListData(data);
      } else if (section === 'audit-logs') {
        const data = await api.getTable('audit_logs');
        setListData(data);
      } else {
        navigate('/admin');
      }
    } catch (err) {
      console.error(`Error loading section ${section}:`, err);
      setError('Failed to fetch data from database. Ensure Supabase credentials are valid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSectionData();
    setModalOpen(false);
    setCurrentItem(null);
  }, [section]);

  // Handle Base64 Image Upload to Supabase Storage
  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Body = reader.result;
        const res = await api.uploadImage(file.name, file.type, base64Body);
        if (res.url) {
          if (currentItem) {
            // Update currently editing item modal state
            setCurrentItem({ ...currentItem, [fieldName]: res.url });
          } else if (pageData) {
            // For single pages (hero image updates etc.)
            setPageData({
              ...pageData,
              content: { ...pageData.content, [fieldName]: res.url }
            });
          }
          alert('Image uploaded successfully!');
        }
      } catch (err) {
        console.error('Image upload failed:', err);
        alert('Upload failed: ' + err.message);
      } finally {
        setUploadingImage(false);
      }
    };
  };

  // Save Settings for Home, About, or Contact pages
  const handleSavePageSettings = async (e) => {
    e.preventDefault();
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
      
      setSuccess('Content updated and published successfully!');
      triggerDataRefresh(); // Refresh public routing data
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Save failed. ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // CRUD Actions: Create or Update Row for list sections (Events, Gallery, Members)
  const handleSaveCRUDItem = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let res;
      if (currentItem.id) {
        // Update Row
        res = await api.updateRow(
          section === 'events' ? 'events' : (section === 'members' ? 'members' : 'gallery_images'),
          currentItem
        );
      } else {
        // Create Row
        res = await api.createRow(
          section === 'events' ? 'events' : (section === 'members' ? 'members' : 'gallery_images'),
          currentItem
        );
      }

      if (res.error) throw new Error(res.error);

      setSuccess('Database record updated successfully!');
      setModalOpen(false);
      setCurrentItem(null);
      loadSectionData();
      triggerDataRefresh();
    } catch (err) {
      console.error('CRUD action failed:', err);
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Row
  const handleDeleteCRUDItem = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this record? This action cannot be undone.')) {
      return;
    }

    try {
      const table = section === 'events' ? 'events' : (section === 'members' ? 'members' : 'gallery_images');
      const res = await api.deleteRow(table, id);
      if (res.error) throw new Error(res.error);

      setSuccess('Record successfully deleted.');
      loadSectionData();
      triggerDataRefresh();
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Deletion failed: ' + err.message);
    }
  };

  // Toggle Publish or Active statuses instantly
  const handleToggleStatus = async (item, field) => {
    try {
      const table = section === 'events' ? 'events' : 'members';
      const updatedItem = { ...item, [field]: !item[field] };
      const res = await api.updateRow(table, updatedItem);
      if (res.error) throw new Error(res.error);

      setSuccess(`Status updated!`);
      loadSectionData();
      triggerDataRefresh();
    } catch (err) {
      console.error('Status toggle failed:', err);
      setError('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading administrative table settings...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Banner Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ textTransform: 'capitalize', color: 'var(--secondary)' }}>Edit {section.replace('-', ' ')} Settings</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Modify live records. Ensure correct formatting.</p>
        </div>
        {['events', 'gallery', 'members'].includes(section) && (
          <button 
            onClick={() => {
              // Open modal with empty stub values
              const defaultItem = 
                section === 'events' ? { title: '', description: '', date: new Date().toISOString().substring(0, 16), venue: '', speaker: '', registration_link: '', image_url: '', is_published: false, is_featured: false } :
                section === 'members' ? { name: '', role: '', category: 'student_member', photograph_url: '', biography: '', linkedin_url: '', email: '', display_order: 0, is_active: true } :
                { album_id: albums[0]?.id || '', url: '', caption: '', category: 'workshops' };
              setCurrentItem(defaultItem);
              setModalOpen(true);
            }} 
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} /> Add New Item
          </button>
        )}
      </div>

      {/* Success/Error Banners */}
      {success && (
        <div className="alert alert-success" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-danger" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
          <X size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          SECTION: HOME PAGE EDITOR
          ----------------------------------------------------------------------- */}
      {section === 'home' && pageData && (
        <form onSubmit={handleSavePageSettings} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3>Hero Title & CTAs</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Hero Banner Headline</label>
              <input
                type="text"
                className="form-control"
                value={pageData.content.hero?.title || ''}
                onChange={(e) => setPageData({
                  ...pageData,
                  content: { ...pageData.content, hero: { ...pageData.content.hero, title: e.target.value } }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hero Banner Subtitle</label>
              <input
                type="text"
                className="form-control"
                value={pageData.content.hero?.subtitle || ''}
                onChange={(e) => setPageData({
                  ...pageData,
                  content: { ...pageData.content, hero: { ...pageData.content.hero, subtitle: e.target.value } }
                })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Hero Supporting Description</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.hero?.description || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, hero: { ...pageData.content.hero, description: e.target.value } }
              })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Hero Photograph (16:10 aspect ratio)</label>
            {pageData.content.hero_image_url && (
              <div style={{ marginBottom: '10px' }}>
                <img src={pageData.content.hero_image_url} alt="Hero Banner Preview" style={{ width: '150px', height: '90px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'hero_image_url')}
              className="form-control"
            />
          </div>

          <h3 style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>Dashboard Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Events Counter</label>
              <input
                type="number"
                className="form-control"
                value={pageData.content.stats?.events_count || 0}
                onChange={(e) => setPageData({
                  ...pageData,
                  content: { ...pageData.content, stats: { ...pageData.content.stats, events_count: parseInt(e.target.value) || 0 } }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Members Counter</label>
              <input
                type="number"
                className="form-control"
                value={pageData.content.stats?.members_count || 0}
                onChange={(e) => setPageData({
                  ...pageData,
                  content: { ...pageData.content, stats: { ...pageData.content.stats, members_count: parseInt(e.target.value) || 0 } }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Workshops Counter</label>
              <input
                type="number"
                className="form-control"
                value={pageData.content.stats?.workshops_count || 0}
                onChange={(e) => setPageData({
                  ...pageData,
                  content: { ...pageData.content, stats: { ...pageData.content.stats, workshops_count: parseInt(e.target.value) || 0 } }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Projects Counter</label>
              <input
                type="number"
                className="form-control"
                value={pageData.content.stats?.projects_count || 0}
                onChange={(e) => setPageData({
                  ...pageData,
                  content: { ...pageData.content, stats: { ...pageData.content.stats, projects_count: parseInt(e.target.value) || 0 } }
                })}
              />
            </div>
          </div>

          <h3 style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>Chapter Introduction</h3>
          <div className="form-group">
            <label className="form-label">Introduction Title</label>
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
            <label className="form-label">Introduction Summary Text</label>
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

          <h3 style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>Editorial Segment Images</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Community Image (3:2)</label>
              {pageData.content.community_image_url && (
                <div style={{ marginBottom: '10px' }}>
                  <img src={pageData.content.community_image_url} alt="Community Preview" style={{ width: '100px', height: '66px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'community_image_url')}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Awards Image (4:3)</label>
              {pageData.content.awards_image_url && (
                <div style={{ marginBottom: '10px' }}>
                  <img src={pageData.content.awards_image_url} alt="Awards Preview" style={{ width: '100px', height: '75px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'awards_image_url')}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Research Image (4:3)</label>
              {pageData.content.research_image_url && (
                <div style={{ marginBottom: '10px' }}>
                  <img src={pageData.content.research_image_url} alt="Research Preview" style={{ width: '100px', height: '75px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'research_image_url')}
                className="form-control"
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Save size={18} /> {saving ? 'Publishing Updates...' : 'Publish Content Updates'}
          </button>
        </form>
      )}

      {/* -----------------------------------------------------------------------
          SECTION: ABOUT ACM / ABOUT KLEF ACM PAGE EDITOR
          ----------------------------------------------------------------------- */}
      {section === 'about-acm' && pageData && (
        <form onSubmit={handleSavePageSettings} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3>Edit About ACM Page Content</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>These sections describe the parent Association for Computing Machinery organization.</p>

          <div className="form-group">
            <label className="form-label">Introduction / Summary</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.introduction || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, introduction: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">What is ACM? (what_acm_is)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.what_acm_is || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, what_acm_is: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ACM's Purpose (purpose)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.purpose || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, purpose: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ACM and the Computing Community (community)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.community || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, community: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ACM Publications (publications)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.publications || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, publications: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ACM Digital Library (digital_library)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.digital_library || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, digital_library: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ACM Conferences (conferences)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.conferences || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, conferences: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ACM Awards (awards)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.awards || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, awards: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ACM Chapters (chapters)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.chapters || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, chapters: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ACM Student Chapters (student_chapters)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.student_chapters || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, student_chapters: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ACM Ethics (ethics)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.ethics || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, ethics: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ACM-W (acm_w)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.acm_w || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, acm_w: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ACM India (acm_india)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.acm_india || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, acm_india: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Official Links (format: Name|URL, one per line)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.official_links || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, official_links: e.target.value }
              })}
              placeholder="e.g. ACM Official Website|https://www.acm.org"
            />
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Save size={18} /> {saving ? 'Publishing Updates...' : 'Publish Content Updates'}
          </button>
        </form>
      )}

      {section === 'about-klef-acm' && pageData && (
        <form onSubmit={handleSavePageSettings} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3>Edit About KLU ACM Chapter</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>These sections describe the KLU ACM student chapter at Koneru Lakshmaiah Education Foundation.</p>

          <div className="form-group">
            <label className="form-label">Chapter Introduction (introduction)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.introduction || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, introduction: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Our Purpose (purpose)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.purpose || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, purpose: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">What We Do / Activities (activities - separate with new lines)</label>
            <textarea
              rows="4"
              className="form-control"
              value={Array.isArray(pageData.content.activities) ? pageData.content.activities.join('\n') : pageData.content.activities || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, activities: e.target.value.split('\n').filter(Boolean) }
              })}
              placeholder="Enter each activity on a new line"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Student Community (community)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.community || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, community: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Technical Growth (technical_growth)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.technical_growth || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, technical_growth: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Leadership (leadership)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.leadership || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, leadership: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Faculty / Institutional Support (faculty_support)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.faculty_support || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, faculty_support: e.target.value }
              })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Vision</label>
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
              <label className="form-label">Mission</label>
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

          <div className="form-group">
            <label className="form-label">Achievements (achievements)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.achievements || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, achievements: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Research & Projects (research)</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.content.research || ''}
              onChange={(e) => setPageData({
                ...pageData,
                content: { ...pageData.content, research: e.target.value }
              })}
            />
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Save size={18} /> {saving ? 'Publishing Updates...' : 'Publish Content Updates'}
          </button>
        </form>
      )}

      {/* -----------------------------------------------------------------------
          SECTION: CONTACT PAGE EDITOR
          ----------------------------------------------------------------------- */}
      {section === 'contact' && pageData && (
        <form onSubmit={handleSavePageSettings} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3>Chapter Contact Information & Address</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Chapter Main Email</label>
              <input
                type="email"
                className="form-control"
                value={pageData.value.email || ''}
                onChange={(e) => setPageData({
                  ...pageData,
                  value: { ...pageData.value, email: e.target.value }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Office Phone Desk</label>
              <input
                type="text"
                className="form-control"
                value={pageData.value.phone || ''}
                onChange={(e) => setPageData({
                  ...pageData,
                  value: { ...pageData.value, phone: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">University / Department Mailing Address</label>
            <textarea
              rows="3"
              className="form-control"
              value={pageData.value.address || ''}
              onChange={(e) => setPageData({
                ...pageData,
                value: { ...pageData.value, address: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Google Maps Embed Frame URL (src Only)</label>
            <input
              type="text"
              className="form-control"
              value={pageData.value.map_url || ''}
              onChange={(e) => setPageData({
                ...pageData,
                value: { ...pageData.value, map_url: e.target.value }
              })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Person Details (Name / Role)</label>
            <input
              type="text"
              className="form-control"
              value={pageData.value.contact_person || ''}
              onChange={(e) => setPageData({
                ...pageData,
                value: { ...pageData.value, contact_person: e.target.value }
              })}
            />
          </div>

          <h3 style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>Social Media Profiles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">LinkedIn URL</label>
              <input
                type="text"
                className="form-control"
                value={pageData.value.social_links?.linkedin || ''}
                onChange={(e) => setPageData({
                  ...pageData,
                  value: { 
                    ...pageData.value, 
                    social_links: { ...pageData.value.social_links, linkedin: e.target.value } 
                  }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Instagram URL</label>
              <input
                type="text"
                className="form-control"
                value={pageData.value.social_links?.instagram || ''}
                onChange={(e) => setPageData({
                  ...pageData,
                  value: { 
                    ...pageData.value, 
                    social_links: { ...pageData.value.social_links, instagram: e.target.value } 
                  }
                })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">GitHub Organization URL</label>
              <input
                type="text"
                className="form-control"
                value={pageData.value.social_links?.github || ''}
                onChange={(e) => setPageData({
                  ...pageData,
                  value: { 
                    ...pageData.value, 
                    social_links: { ...pageData.value.social_links, github: e.target.value } 
                  }
                })}
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Save size={18} /> {saving ? 'Publishing Updates...' : 'Publish Content Updates'}
          </button>
        </form>
      )}

      {/* -----------------------------------------------------------------------
          SECTION: EVENTS LIST EDITOR
          ----------------------------------------------------------------------- */}
      {section === 'events' && (
        <div className="table-container">
          {listData.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No chapter events scheduled. Click "Add New Item" above to schedule.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Banner</th>
                  <th>Event Title</th>
                  <th>Speaker</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>Featured</th>
                  <th>Publish</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listData.map(event => (
                  <tr key={event.id}>
                    <td>
                      <div 
                        style={{ 
                          width: '60px', 
                          height: '40px', 
                          borderRadius: '4px', 
                          backgroundColor: '#e2e8f0', 
                          backgroundImage: event.image_url ? `url(${event.image_url})` : 'none', 
                          backgroundSize: 'cover', 
                          backgroundPosition: 'center',
                          border: '1px solid var(--border)'
                        }} 
                      />
                    </td>
                    <td style={{ fontWeight: '600' }}>{event.title}</td>
                    <td>{event.speaker}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>{event.venue}</td>
                    <td>
                      <button 
                        onClick={() => handleToggleStatus(event, 'is_featured')}
                        style={{ color: event.is_featured ? 'var(--warning)' : 'var(--text-muted)' }}
                      >
                        <Sparkles size={18} fill={event.is_featured ? 'var(--warning)' : 'none'} />
                      </button>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggleStatus(event, 'is_published')}
                        style={{ color: event.is_published ? 'var(--primary)' : 'var(--text-muted)' }}
                      >
                        {event.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button 
                          onClick={() => {
                            // Map ISO String back to datetime-local input format
                            const localDate = new Date(event.date);
                            const timezoneOffset = localDate.getTimezoneOffset() * 60000;
                            const formattedDate = new Date(localDate.getTime() - timezoneOffset).toISOString().substring(0, 16);
                            
                            setCurrentItem({ ...event, date: formattedDate });
                            setModalOpen(true);
                          }}
                          style={{ padding: '6px', color: 'var(--secondary)' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCRUDItem(event.id)}
                          style={{ padding: '6px', color: 'var(--danger)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* -----------------------------------------------------------------------
          SECTION: GALLERY MEDIA EDITOR
          ----------------------------------------------------------------------- */}
      {section === 'gallery' && (
        <div>
          {/* Gallery Album Manager */}
          <div 
            style={{ 
              marginBottom: '32px', 
              padding: '24px', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'var(--bg-main)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary)' }}>Gallery Albums Manager</h3>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="New album name"
                  className="form-control"
                  style={{ maxWidth: '200px', padding: '6px 12px', fontSize: '0.85rem' }}
                  id="new-album-name-input"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const nameInput = document.getElementById('new-album-name-input');
                    const name = nameInput?.value?.trim();
                    if (!name) return alert('Please enter an album name.');
                    try {
                      setSaving(true);
                      const res = await api.createRow('gallery_albums', { name, description: 'Chapter gallery album' });
                      setAlbums([...albums, res]);
                      nameInput.value = '';
                      setSuccess('Album created successfully!');
                      triggerDataRefresh();
                    } catch (e) {
                      alert('Failed to create album: ' + e.message);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '6px 12px' }}
                >
                  Create Album
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }} className="delete-album-controls">
                <select
                  id="delete-album-select"
                  className="form-control"
                  style={{ minWidth: '160px', padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={async () => {
                    const select = document.getElementById('delete-album-select');
                    const id = select?.value;
                    if (!id) return alert('No album selected.');
                    const albumName = albums.find(a => a.id === id)?.name || 'this album';
                    if (window.confirm(`Are you sure you want to permanently delete "${albumName}"? All images associated with this album will be permanently deleted.`)) {
                      try {
                        setSaving(true);
                        await api.deleteRow('gallery_albums', id);
                        setAlbums(albums.filter(a => a.id !== id));
                        loadSectionData(); // reload list
                        setSuccess('Album deleted successfully.');
                        triggerDataRefresh();
                      } catch (e) {
                        alert('Failed to delete album: ' + e.message);
                      } finally {
                        setSaving(false);
                      }
                    }
                  }}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '6px 12px' }}
                >
                  Delete Selected Album
                </button>
              </div>
            </div>
          </div>

          {listData.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
              No images uploaded. Click "Add New Item" above to upload images.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {listData.map((img) => (
                <div 
                  key={img.id} 
                  className="card" 
                  style={{ 
                    padding: '12px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    position: 'relative',
                    aspectRatio: '1',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.caption}
                    style={{ width: '100%', height: '80%', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }}
                  />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)', textTransform: 'capitalize' }}>
                      {img.category}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => {
                          setCurrentItem(img);
                          setModalOpen(true);
                        }}
                        style={{ color: 'var(--secondary)', padding: '4px' }}
                        type="button"
                        aria-label="Edit Image"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCRUDItem(img.id)}
                        style={{ color: 'var(--danger)', padding: '4px' }}
                        type="button"
                        aria-label="Delete Image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -----------------------------------------------------------------------
          SECTION: MEMBERS ROSTER EDITOR
          ----------------------------------------------------------------------- */}
      {section === 'members' && (
        <div className="table-container">
          {listData.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No members enrolled in roster. Click "Add New Item" above to enroll.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Member Name</th>
                  <th>Role Name</th>
                  <th>Category Group</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listData.map(member => (
                  <tr key={member.id}>
                    <td>
                      {member.photograph_url ? (
                        <img 
                          src={member.photograph_url} 
                          alt={member.name} 
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} 
                        />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          U
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: '600' }}>{member.name}</td>
                    <td>{member.role}</td>
                    <td style={{ textTransform: 'capitalize' }}>{member.category.replace('_', ' ')}</td>
                    <td>{member.display_order}</td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(member, 'is_active')}
                        className={`badge ${member.is_active ? 'badge-success' : 'badge-danger'}`}
                      >
                        {member.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button 
                          onClick={() => {
                            setCurrentItem(member);
                            setModalOpen(true);
                          }}
                          style={{ padding: '6px', color: 'var(--secondary)' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCRUDItem(member.id)}
                          style={{ padding: '6px', color: 'var(--danger)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* -----------------------------------------------------------------------
          SECTION: AUDIT LOGS DISPLAY (READ-ONLY)
          ----------------------------------------------------------------------- */}
      {section === 'audit-logs' && (
        <div className="table-container">
          {listData.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No audit logs available.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {listData.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: '600' }}>{log.admin_username || 'System/Guest'}</td>
                    <td>
                      <span 
                        className={`badge ${
                          log.action === 'create' ? 'badge-primary' : 
                          log.action === 'delete' ? 'badge-danger' : 
                          log.action === 'login' ? 'badge-success' : 
                          'badge-warning'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{log.resource}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {log.details || `ID: ${log.resource_id}`}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* -----------------------------------------------------------------------
          CRUD MODALS (EVENTS, MEMBERS, GALLERY ADD/EDIT)
          ----------------------------------------------------------------------- */}
      {modalOpen && currentItem && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalOpen(false)}>
              <X size={24} />
            </button>

            <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              {currentItem.id ? 'Modify Database Record' : 'Create Database Record'}
            </h3>

            <form onSubmit={handleSaveCRUDItem} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 1. EVENTS EDIT FORM */}
              {section === 'events' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Event Headline Title</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={currentItem.title || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Event Description / Outline</label>
                    <textarea
                      rows="4"
                      required
                      className="form-control"
                      value={currentItem.description || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Date & Time Selection</label>
                      <input
                        type="datetime-local"
                        required
                        className="form-control"
                        value={currentItem.date || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, date: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Speaker / Guest Lecturer</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={currentItem.speaker || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, speaker: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Location Venue</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={currentItem.venue || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, venue: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Seat Registration Link (URL)</label>
                      <input
                        type="url"
                        className="form-control"
                        value={currentItem.registration_link || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, registration_link: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  {/* Event Image Upload */}
                  <div className="form-group">
                    <label className="form-label">Banner Image Upload</label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'image_url')}
                        style={{ display: 'none' }}
                        id="event-image-input"
                      />
                      <label 
                        htmlFor="event-image-input" 
                        className="btn btn-secondary btn-sm" 
                        style={{ cursor: 'pointer' }}
                      >
                        <Upload size={14} /> {uploadingImage ? 'Uploading base64...' : 'Upload File'}
                      </label>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {currentItem.image_url ? 'File uploaded.' : 'No file uploaded.'}
                      </span>
                    </div>
                    {currentItem.image_url && (
                      <img 
                        src={currentItem.image_url} 
                        alt="Preview" 
                        style={{ marginTop: '12px', width: '100px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} 
                      />
                    )}
                  </div>
                </>
              )}

              {/* 2. GALLERY EDIT FORM */}
              {section === 'gallery' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Caption / Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={currentItem.caption || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, caption: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Associated Album</label>
                      <select
                        className="form-control"
                        value={currentItem.album_id || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, album_id: e.target.value })}
                      >
                        {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Category Group</label>
                      <select
                        className="form-control"
                        value={currentItem.category || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                      >
                        <option value="workshops">Workshops</option>
                        <option value="competitions">Competitions</option>
                        <option value="seminars">Seminars</option>
                        <option value="socials">Socials</option>
                      </select>
                    </div>
                  </div>

                  {/* Photo upload */}
                  <div className="form-group">
                    <label className="form-label">Gallery Media File Upload</label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'url')}
                        style={{ display: 'none' }}
                        id="gallery-image-input"
                      />
                      <label 
                        htmlFor="gallery-image-input" 
                        className="btn btn-secondary btn-sm" 
                        style={{ cursor: 'pointer' }}
                      >
                        <Upload size={14} /> {uploadingImage ? 'Uploading base64...' : 'Upload File'}
                      </label>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {currentItem.url ? 'File uploaded.' : 'No file uploaded.'}
                      </span>
                    </div>
                    {currentItem.url && (
                      <img 
                        src={currentItem.url} 
                        alt="Preview" 
                        style={{ marginTop: '12px', width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} 
                      />
                    )}
                  </div>
                </>
              )}

              {/* 3. MEMBERS EDIT FORM */}
              {section === 'members' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={currentItem.name || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Display Order (Sorting)</label>
                      <input
                        type="number"
                        required
                        className="form-control"
                        value={currentItem.display_order ?? 0}
                        onChange={(e) => setCurrentItem({ ...currentItem, display_order: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Designation Role (e.g. Lead Designer)</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={currentItem.role || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, role: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category Committee Group</label>
                      <select
                        className="form-control"
                        value={currentItem.category || 'student_member'}
                        onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                      >
                        <option value="faculty_coordinator">Faculty Coordinator</option>
                        <option value="chair">Chair</option>
                        <option value="vice_chair">Vice Chair</option>
                        <option value="secretary">Secretary</option>
                        <option value="treasurer">Treasurer</option>
                        <option value="webmaster">Webmaster</option>
                        <option value="technical_lead">Technical Lead</option>
                        <option value="other_lead">Committee/Design Lead</option>
                        <option value="student_member">Student Member</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={currentItem.email || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        className="form-control"
                        value={currentItem.linkedin_url || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, linkedin_url: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Biography Details</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      value={currentItem.biography || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, biography: e.target.value })}
                    />
                  </div>

                  {/* Portrait photo upload */}
                  <div className="form-group">
                    <label className="form-label">Portrait Photograph Upload</label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'photograph_url')}
                        style={{ display: 'none' }}
                        id="member-photo-input"
                      />
                      <label 
                        htmlFor="member-photo-input" 
                        className="btn btn-secondary btn-sm" 
                        style={{ cursor: 'pointer' }}
                      >
                        <Upload size={14} /> {uploadingImage ? 'Uploading base64...' : 'Upload File'}
                      </label>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {currentItem.photograph_url ? 'File uploaded.' : 'No file uploaded.'}
                      </span>
                    </div>
                    {currentItem.photograph_url && (
                      <img 
                        src={currentItem.photograph_url} 
                        alt="Preview" 
                        style={{ marginTop: '12px', width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border)' }} 
                      />
                    )}
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setModalOpen(false);
                    setCurrentItem(null);
                  }} 
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving || uploadingImage} 
                  className="btn btn-primary btn-sm"
                >
                  {saving ? 'Saving...' : 'Save DB Record'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
