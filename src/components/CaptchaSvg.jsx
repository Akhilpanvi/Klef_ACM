import React from 'react';

/**
 * CaptchaSvg renders the raw SVG CAPTCHA markup returned by the server safely.
 */
export default function CaptchaSvg({ svg }) {
  if (!svg) {
    return (
      <div
        style={{
          width: '240px',
          height: '75px',
          backgroundColor: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          fontSize: '0.85rem',
        }}
      >
        Loading CAPTCHA...
      </div>
    );
  }

  return (
    <div 
      className="captcha-container"
      dangerouslySetInnerHTML={{ __html: svg }} 
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
}
