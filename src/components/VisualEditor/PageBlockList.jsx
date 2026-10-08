import React, { useState, useContext } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Type, 
  Heading as HeadingIcon, 
  Image as ImageIcon, 
  Quote as QuoteIcon, 
  Columns, 
  Minus, 
  Link as LinkIcon, 
  LayoutTemplate,
  Sparkles
} from 'lucide-react';
import { useVisualEditor } from '../../context/VisualEditorContext';
import { SiteDataContext } from '../../App';
import VisualEditable from './VisualEditable';
import VisualImageReplacer from './VisualImageReplacer';

export default function PageBlockList({ blockKey = 'blocks', slug: propSlug, className = '', style = {} }) {
  const { isEditMode, pageDraft, updateField, setHasUnsavedChanges, pageSlug: contextSlug } = useVisualEditor();
  const { siteData } = useContext(SiteDataContext) || {};
  const [insertIndex, setInsertIndex] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const effectiveSlug = propSlug || contextSlug || 'home';
  
  // Find saved blocks from siteData if draft has not yet loaded or on public page
  let dbSavedBlocks = [];
  if (siteData) {
    if (Array.isArray(siteData.pages?.[effectiveSlug]?.content?.[blockKey])) {
      dbSavedBlocks = siteData.pages[effectiveSlug].content[blockKey];
    } else {
      for (const sKey of Object.keys(siteData.pages || {})) {
        if (Array.isArray(siteData.pages[sKey]?.content?.[blockKey])) {
          dbSavedBlocks = siteData.pages[sKey].content[blockKey];
          break;
        }
      }
    }
  }

  const blocks = Array.isArray(pageDraft?.[blockKey]) 
    ? pageDraft[blockKey] 
    : (dbSavedBlocks.length > 0 ? dbSavedBlocks : []);

  const updateBlocks = (newBlocks) => {
    updateField(blockKey, newBlocks);
    setHasUnsavedChanges(true);
  };

  const handleAddBlock = (type, targetIndex = blocks.length) => {
    const newId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    let initialData = {};

    switch (type) {
      case 'heading':
        initialData = { level: 'h2', text: 'New Section Heading', subtitle: '' };
        break;
      case 'text':
        initialData = { text: 'Write rich paragraph content here. Click to edit this text freely.' };
        break;
      case 'image':
        initialData = { url: '', caption: 'Image caption description', alt: 'KLEF ACM Media' };
        break;
      case 'quote':
        initialData = { quote: 'Computing is not about computers anymore. It is about living.', author: 'Nicholas Negroponte' };
        break;
      case 'two_column':
        initialData = { 
          col1_title: 'Focus Area A', 
          col1_text: 'Describe the initiative or technical pillar in detail here.',
          col2_title: 'Focus Area B',
          col2_text: 'Describe the complementary initiative or project here.'
        };
        break;
      case 'divider':
        initialData = { style: 'line' };
        break;
      case 'button':
        initialData = { label: 'Explore Initiatives', url: '/KLEF-ACM-SC/Events', variant: 'primary' };
        break;
      case 'custom_section':
        initialData = {
          tag: 'CHAPTER HIGHLIGHT',
          title: 'New Chapter Initiative',
          description: 'Provide an in-depth overview of this chapter initiative, milestone, or program.',
          image: ''
        };
        break;
      default:
        initialData = { text: 'New content block' };
    }

    const newBlock = { id: newId, type, data: initialData };
    const nextBlocks = [...blocks];
    nextBlocks.splice(targetIndex, 0, newBlock);
    updateBlocks(nextBlocks);
    setShowPicker(false);
    setInsertIndex(null);
  };

  const handleUpdateBlockData = (id, key, value) => {
    const nextBlocks = blocks.map(b => {
      if (b.id === id) {
        return { ...b, data: { ...b.data, [key]: value } };
      }
      return b;
    });
    updateBlocks(nextBlocks);
  };

  const handleDeleteBlock = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this content block?')) {
      const nextBlocks = blocks.filter(b => b.id !== id);
      updateBlocks(nextBlocks);
    }
  };

  const handleDuplicateBlock = (id, e) => {
    e.stopPropagation();
    const idx = blocks.findIndex(b => b.id === id);
    if (idx === -1) return;
    const target = blocks[idx];
    const clone = {
      ...target,
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      data: JSON.parse(JSON.stringify(target.data))
    };
    const nextBlocks = [...blocks];
    nextBlocks.splice(idx + 1, 0, clone);
    updateBlocks(nextBlocks);
  };

  const handleMoveUp = (idx, e) => {
    e.stopPropagation();
    if (idx === 0) return;
    const nextBlocks = [...blocks];
    const temp = nextBlocks[idx - 1];
    nextBlocks[idx - 1] = nextBlocks[idx];
    nextBlocks[idx] = temp;
    updateBlocks(nextBlocks);
  };

  const handleMoveDown = (idx, e) => {
    e.stopPropagation();
    if (idx === blocks.length - 1) return;
    const nextBlocks = [...blocks];
    const temp = nextBlocks[idx + 1];
    nextBlocks[idx + 1] = nextBlocks[idx];
    nextBlocks[idx] = temp;
    updateBlocks(nextBlocks);
  };

  const openPickerAtIndex = (index) => {
    setInsertIndex(index);
    setShowPicker(true);
  };

  return (
    <div className={`page-block-list ${className}`} style={{ width: '100%', ...style }}>
      {blocks.map((block, idx) => (
        <React.Fragment key={block.id || idx}>
          {/* In-between Insertion Trigger */}
          {isEditMode && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0', position: 'relative' }}>
              <button
                type="button"
                onClick={() => openPickerAtIndex(idx)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  backgroundColor: '#f1f5f9',
                  border: '1px dashed #94a3b8',
                  color: '#005CA9',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: 0.6,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
              >
                <Plus size={14} /> Add Content Here
              </button>
            </div>
          )}

          {/* Block Wrapper */}
          <div
            style={{
              position: 'relative',
              margin: '24px 0',
              padding: isEditMode ? '16px' : '0',
              border: isEditMode ? '1.5px dashed rgba(0, 92, 169, 0.25)' : 'none',
              borderRadius: isEditMode ? '10px' : '0',
              backgroundColor: isEditMode ? 'rgba(248, 250, 252, 0.5)' : 'transparent',
              transition: 'border-color 0.2s ease',
            }}
          >
            {/* Block Hover Management Bar */}
            {isEditMode && (
              <div
                style={{
                  position: 'absolute',
                  top: '-14px',
                  right: '12px',
                  display: 'flex',
                  gap: '4px',
                  backgroundColor: '#0f172a',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 20,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginRight: '6px', alignSelf: 'center' }}>
                  {block.type}
                </span>
                <button
                  type="button"
                  title="Move Up"
                  disabled={idx === 0}
                  onClick={(e) => handleMoveUp(idx, e)}
                  style={{ background: 'none', border: 'none', color: idx === 0 ? '#475569' : '#ffffff', cursor: idx === 0 ? 'default' : 'pointer', padding: '2px' }}
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  title="Move Down"
                  disabled={idx === blocks.length - 1}
                  onClick={(e) => handleMoveDown(idx, e)}
                  style={{ background: 'none', border: 'none', color: idx === blocks.length - 1 ? '#475569' : '#ffffff', cursor: idx === blocks.length - 1 ? 'default' : 'pointer', padding: '2px' }}
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  type="button"
                  title="Duplicate Block"
                  onClick={(e) => handleDuplicateBlock(block.id, e)}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: '2px' }}
                >
                  <Copy size={13} />
                </button>
                <button
                  type="button"
                  title="Delete Block"
                  onClick={(e) => handleDeleteBlock(block.id, e)}
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}

            {/* Block Body Rendering */}
            {renderBlockContent(block, isEditMode, (key, val) => handleUpdateBlockData(block.id, key, val))}
          </div>
        </React.Fragment>
      ))}

      {/* Trailing Add Block Button in Edit Mode */}
      {isEditMode && (
        <div style={{ textAlign: 'center', margin: '36px 0 20px 0' }}>
          <button
            type="button"
            onClick={() => openPickerAtIndex(blocks.length)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '10px',
              backgroundColor: '#005CA9',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.92rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 92, 169, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <Plus size={18} />
            <span>Add Content Block / Section</span>
          </button>
        </div>
      )}

      {/* Block Type Picker Modal */}
      {showPicker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowPicker(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                  Add Content Block
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Select the type of content you want to insert into this page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', color: '#64748b', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {[
                { type: 'heading', title: 'Heading', desc: 'H2/H3 Section Title', icon: HeadingIcon, color: '#005CA9' },
                { type: 'text', title: 'Rich Text', desc: 'Paragraph or formatted text', icon: Type, color: '#0284c7' },
                { type: 'image', title: 'Image', desc: 'Upload or link photograph', icon: ImageIcon, color: '#059669' },
                { type: 'two_column', title: 'Two Columns', desc: 'Side-by-side content pillars', icon: Columns, color: '#7c3aed' },
                { type: 'quote', title: 'Quote / Highlight', desc: 'Callout or notable quote', icon: QuoteIcon, color: '#d97706' },
                { type: 'custom_section', title: 'Full Section', desc: 'Designed initiative layout', icon: LayoutTemplate, color: '#dc2626' },
                { type: 'button', title: 'Button / Link', desc: 'Call to action button', icon: LinkIcon, color: '#2563eb' },
                { type: 'divider', title: 'Divider Line', desc: 'Clean separating rule', icon: Minus, color: '#64748b' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleAddBlock(item.type, insertIndex ?? blocks.length)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#fafbfc',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = item.color;
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.backgroundColor = '#fafbfc';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                      <Icon size={18} style={{ color: item.color }} />
                    </div>
                    <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>{item.title}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderBlockContent(block, isEditMode, onUpdate) {
  const { data = {} } = block;

  switch (block.type) {
    case 'heading':
      return (
        <div>
          {isEditMode ? (
            <h2
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdate('text', e.currentTarget.innerText)}
              style={{
                fontSize: 'clamp(24px, 3.5vw, 36px)',
                fontWeight: '900',
                color: '#0f172a',
                letterSpacing: '-0.02em',
                margin: 0,
                outline: '1.5px dashed rgba(0, 163, 224, 0.4)',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              {data.text || 'Section Heading'}
            </h2>
          ) : (
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              {data.text}
            </h2>
          )}
        </div>
      );

    case 'text':
      return (
        <div>
          {isEditMode ? (
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdate('text', e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: data.text || '<p>Click to edit paragraph...</p>' }}
              style={{
                color: '#475569',
                fontSize: '1.05rem',
                lineHeight: '1.8',
                outline: '1.5px dashed rgba(0, 163, 224, 0.4)',
                padding: '8px',
                borderRadius: '4px',
                minHeight: '2em',
              }}
            />
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: data.text || '' }}
              style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.8' }}
            />
          )}
        </div>
      );

    case 'image':
      return (
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', borderRadius: '12px', overflow: 'hidden' }}>
            <VisualImageReplacer
              src={data.url}
              alt={data.alt || 'Chapter Photo'}
              onUpdateImage={(newUrl) => onUpdate('url', newUrl)}
              style={{ maxHeight: '420px', width: '100%', objectFit: 'cover', borderRadius: '12px' }}
            />
          </div>
          {isEditMode ? (
            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdate('caption', e.currentTarget.innerText)}
              style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px', fontStyle: 'italic', outline: '1px dashed rgba(0,163,224,0.3)', padding: '2px 6px' }}
            >
              {data.caption || 'Add photo caption...'}
            </p>
          ) : (
            data.caption && <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px', fontStyle: 'italic' }}>{data.caption}</p>
          )}
        </div>
      );

    case 'quote':
      return (
        <blockquote
          style={{
            borderLeft: '4px solid #005CA9',
            backgroundColor: '#f8fafc',
            padding: '24px 28px',
            borderRadius: '0 12px 12px 0',
            margin: '20px 0',
          }}
        >
          {isEditMode ? (
            <p
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdate('quote', e.currentTarget.innerText)}
              style={{ fontSize: '1.15rem', fontStyle: 'italic', color: '#1e293b', lineHeight: '1.6', margin: '0 0 10px 0', outline: '1px dashed rgba(0,163,224,0.4)', padding: '4px' }}
            >
              {data.quote || 'Quote text...'}
            </p>
          ) : (
            <p style={{ fontSize: '1.15rem', fontStyle: 'italic', color: '#1e293b', lineHeight: '1.6', margin: '0 0 10px 0' }}>
              "{data.quote}"
            </p>
          )}
          {isEditMode ? (
            <cite
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdate('author', e.currentTarget.innerText)}
              style={{ fontSize: '0.85rem', fontWeight: '700', color: '#005CA9', display: 'block', outline: '1px dashed rgba(0,163,224,0.3)', padding: '2px' }}
            >
              — {data.author || 'Author Name'}
            </cite>
          ) : (
            data.author && <cite style={{ fontSize: '0.85rem', fontWeight: '700', color: '#005CA9', display: 'block' }}>— {data.author}</cite>
          )}
        </blockquote>
      );

    case 'two_column':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', margin: '20px 0' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            {isEditMode ? (
              <>
                <h3
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdate('col1_title', e.currentTarget.innerText)}
                  style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px', outline: '1px dashed rgba(0,163,224,0.3)' }}
                >
                  {data.col1_title || 'Column 1 Title'}
                </h3>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdate('col1_text', e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: data.col1_text || 'Column 1 content description' }}
                  style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.7', outline: '1px dashed rgba(0,163,224,0.3)' }}
                />
              </>
            ) : (
              <>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{data.col1_title}</h3>
                <div dangerouslySetInnerHTML={{ __html: data.col1_text || '' }} style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.7' }} />
              </>
            )}
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            {isEditMode ? (
              <>
                <h3
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdate('col2_title', e.currentTarget.innerText)}
                  style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px', outline: '1px dashed rgba(0,163,224,0.3)' }}
                >
                  {data.col2_title || 'Column 2 Title'}
                </h3>
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onUpdate('col2_text', e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: data.col2_text || 'Column 2 content description' }}
                  style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.7', outline: '1px dashed rgba(0,163,224,0.3)' }}
                />
              </>
            ) : (
              <>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{data.col2_title}</h3>
                <div dangerouslySetInnerHTML={{ __html: data.col2_text || '' }} style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.7' }} />
              </>
            )}
          </div>
        </div>
      );

    case 'custom_section':
      return (
        <div style={{ backgroundColor: '#f8fafc', padding: '36px', borderRadius: '16px', border: '1px solid #e2e8f0', margin: '24px 0' }}>
          {isEditMode ? (
            <>
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdate('tag', e.currentTarget.innerText)}
                style={{ fontSize: '0.78rem', fontWeight: '800', color: '#005CA9', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px', outline: '1px dashed rgba(0,163,224,0.3)' }}
              >
                {data.tag || 'SECTION TAG'}
              </span>
              <h3
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdate('title', e.currentTarget.innerText)}
                style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', marginBottom: '14px', outline: '1px dashed rgba(0,163,224,0.3)' }}
              >
                {data.title || 'Initiative Section Title'}
              </h3>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdate('description', e.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: data.description || 'Provide detailed overview...' }}
                style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.75', outline: '1px dashed rgba(0,163,224,0.3)' }}
              />
            </>
          ) : (
            <>
              {data.tag && <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#005CA9', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>{data.tag}</span>}
              <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', marginBottom: '14px' }}>{data.title}</h3>
              <div dangerouslySetInnerHTML={{ __html: data.description || '' }} style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.75' }} />
            </>
          )}
        </div>
      );

    case 'button':
      return (
        <div style={{ margin: '18px 0' }}>
          <a
            href={data.url || '#'}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '800',
              backgroundColor: '#005CA9',
              borderColor: '#005CA9',
              color: '#ffffff',
              textDecoration: 'none',
            }}
          >
            {isEditMode ? (
              <span
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onUpdate('label', e.currentTarget.innerText)}
                style={{ outline: '1px dashed rgba(255,255,255,0.6)' }}
              >
                {data.label || 'Action Button'}
              </span>
            ) : (
              data.label || 'Action Button'
            )}
          </a>
        </div>
      );

    case 'divider':
      return <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '32px 0' }} />;

    default:
      return null;
  }
}
