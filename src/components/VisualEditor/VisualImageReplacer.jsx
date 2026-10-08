import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, X, Loader2 } from 'lucide-react';
import { useVisualEditor } from '../../context/VisualEditorContext';
import { api } from '../../services/api';

export default function VisualImageReplacer({
  name,
  src,
  alt = 'Image',
  style = {},
  className = '',
  onImageChange,
  ...props
}) {
  const { isEditMode, updateField } = useVisualEditor();
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const currentSrc = src || '';

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Body = reader.result.split(',')[1];
          const res = await api.uploadImage(file.name, file.type, base64Body);
          if (res && res.url) {
            if (name) updateField(name, res.url);
            if (onImageChange) onImageChange(res.url);
            setModalOpen(false);
          } else {
            throw new Error('Upload did not return a valid URL');
          }
        } catch (uploadErr) {
          setError(uploadErr.message || 'Image upload failed');
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read selected image file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message || 'Image processing failed');
      setUploading(false);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (name) updateField(name, urlInput.trim());
    if (onImageChange) onImageChange(urlInput.trim());
    setUrlInput('');
    setModalOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: style.width || '100%' }}>
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        style={{
          ...style,
          outline: isEditMode ? '2px dashed rgba(0, 163, 224, 0.5)' : 'none',
          outlineOffset: isEditMode ? '2px' : '0',
          transition: 'outline 0.2s ease',
        }}
        {...props}
      />

      {isEditMode && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.78rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(6px)',
            zIndex: 20,
          }}
        >
          <Camera size={14} color="#38BDF8" />
          <span>Replace Image</span>
        </button>
      )}

      {/* Media Upload Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '28px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                Replace Image
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '8px 12px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {/* Option 1: File Upload */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '24px',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" color="#005CA9" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#005CA9' }}>Uploading to Cloud Storage...</span>
                  </>
                ) : (
                  <>
                    <Upload size={24} color="#005CA9" />
                    <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>Upload image from computer</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>PNG, JPG, WebP, SVG up to 10MB</span>
                  </>
                )}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>or URL</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            </div>

            {/* Option 2: Image URL */}
            <form onSubmit={handleUrlSubmit} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '10px 16px', fontWeight: '700', fontSize: '0.88rem', backgroundColor: '#005CA9', borderColor: '#005CA9' }}
              >
                Apply
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
