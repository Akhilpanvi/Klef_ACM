import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export function cleanImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim();
  // Strip any accidental doubled data: prefixes
  while (clean.startsWith('data:image/') && clean.indexOf('data:image/', 10) !== -1) {
    clean = clean.substring(clean.indexOf('data:image/', 10));
  }
  return clean;
}

export default function SafeImage({ 
  src, 
  alt = 'KLEF ACM Media', 
  style = {}, 
  className = '', 
  fit = 'contain', // 'contain' prevents any cropping of logos or photos; can also be 'cover'
  fallbackIcon: FallbackIcon = ImageIcon,
  fallbackText = ''
}) {
  const [hasError, setHasError] = useState(false);
  const cleanSrc = cleanImageUrl(src);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!cleanSrc || hasError) {
    return (
      <div 
        className={className} 
        style={{
          width: '100%',
          height: '100%',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-main)',
          color: 'var(--text-muted)',
          padding: '16px',
          textAlign: 'center',
          userSelect: 'none',
          ...style
        }}
      >
        <FallbackIcon size={28} style={{ opacity: 0.5, marginBottom: fallbackText ? '6px' : 0, color: 'var(--primary)' }} />
        {fallbackText && <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>{fallbackText}</span>}
      </div>
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        width: fit === 'cover' ? '100%' : 'auto',
        height: fit === 'cover' ? '100%' : 'auto',
        objectFit: fit,
        display: 'block',
        margin: 'auto',
        ...style
      }}
    />
  );
}
