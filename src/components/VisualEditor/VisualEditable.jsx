import React, { useRef, useContext, useEffect } from 'react';
import { useVisualEditor } from '../../context/VisualEditorContext';
import { SiteDataContext } from '../../App';

function cleanInitialString(val) {
  if (typeof val === 'string') {
    // If it's a string, trim outer leading/trailing spaces/newlines
    // also normalize leading multiple non-breaking space entities
    return val.replace(/^(&nbsp;|\s)+/i, '').replace(/(&nbsp;|\s)+$/i, '').trim();
  }
  return val;
}

function extractSafeContent(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return cleanInitialString(val);
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return val.map(extractSafeContent).filter(Boolean).join('\n');
    }
    // Handle database objects containing heading/text or title/description
    if (val.heading && val.text) {
      return `${extractSafeContent(val.heading)}: ${extractSafeContent(val.text)}`;
    }
    if (val.title && val.description) {
      return `${extractSafeContent(val.title)}: ${extractSafeContent(val.description)}`;
    }
    if (val.text !== undefined) return extractSafeContent(val.text);
    if (val.heading !== undefined) return extractSafeContent(val.heading);
    if (val.description !== undefined) return extractSafeContent(val.description);
    if (val.title !== undefined) return extractSafeContent(val.title);
    if (val.value !== undefined) return extractSafeContent(val.value);
    if (val.quote !== undefined) return extractSafeContent(val.quote);
    if (val.label !== undefined) return extractSafeContent(val.label);
    try {
      return JSON.stringify(val);
    } catch {
      return '';
    }
  }
  return String(val);
}

export default function VisualEditable({
  name,
  slug: propSlug,
  as: Component = 'div',
  children,
  defaultValue = '',
  className = '',
  style = {},
  placeholder = 'Click to edit content...',
  ...props
}) {
  const { isEditMode, pageDraft, updateField, pageSlug: contextSlug } = useVisualEditor();
  const { siteData } = useContext(SiteDataContext) || {};
  const elementRef = useRef(null);
  const isEditingRef = useRef(false);

  const effectiveSlug = propSlug || contextSlug || 'home';

  // Find saved value from siteData if not in active draft
  let dbSavedValue = undefined;
  if (siteData) {
    if (siteData.pages?.[effectiveSlug]?.content?.[name] !== undefined) {
      dbSavedValue = siteData.pages[effectiveSlug].content[name];
    } else if (effectiveSlug === 'contact' && siteData.contact?.[name] !== undefined) {
      dbSavedValue = siteData.contact[name];
    } else {
      // Search all pages as fallback
      for (const sKey of Object.keys(siteData.pages || {})) {
        if (siteData.pages[sKey]?.content?.[name] !== undefined) {
          dbSavedValue = siteData.pages[sKey].content[name];
          break;
        }
      }
    }
  }

  // Priority: Draft State -> DB Saved Value in Context -> defaultValue -> children
  const rawContent = pageDraft?.[name] !== undefined 
    ? pageDraft[name] 
    : (dbSavedValue !== undefined ? dbSavedValue : (defaultValue !== undefined ? defaultValue : (children || '')));

  const currentContent = extractSafeContent(rawContent);

  // Synchronize DOM content only when NOT actively typing/focused or when switching mode/slug
  useEffect(() => {
    if (isEditMode && elementRef.current) {
      if (!isEditingRef.current) {
        const val = currentContent || '';
        const targetHtml = val || placeholder;
        if (elementRef.current.innerHTML !== targetHtml) {
          elementRef.current.innerHTML = targetHtml;
        }
      }
    }
  }, [currentContent, isEditMode, effectiveSlug, placeholder]);

  const handleFocus = () => {
    isEditingRef.current = true;
    if (elementRef.current && elementRef.current.innerHTML === placeholder) {
      elementRef.current.innerHTML = '';
    }
  };

  const handleInput = (e) => {
    if (name) {
      const html = e.currentTarget.innerHTML;
      updateField(name, html);
    }
  };

  const handleBlur = (e) => {
    isEditingRef.current = false;
    if (name && elementRef.current) {
      let html = elementRef.current.innerHTML;
      if (html === '<br>' || html === '&nbsp;' || !html.trim()) {
        html = '';
      }
      // If user completely cleared leading spaces or empty lines, clean on blur
      const cleaned = html ? html.replace(/^(&nbsp;|\s)+/i, '') : '';
      if (cleaned !== html) {
        elementRef.current.innerHTML = cleaned || placeholder;
        html = cleaned;
      }
      updateField(name, html);
      if (!html) {
        elementRef.current.innerHTML = placeholder;
      }
    }
  };

  if (!isEditMode) {
    return (
      <Component className={className} style={style} {...props}>
        {typeof currentContent === 'string' && (currentContent.includes('<') || currentContent.includes('&')) ? (
          <span dangerouslySetInnerHTML={{ __html: currentContent }} />
        ) : (
          currentContent
        )}
      </Component>
    );
  }

  return (
    <Component
      ref={elementRef}
      contentEditable
      suppressContentEditableWarning
      onFocus={handleFocus}
      onInput={handleInput}
      onBlur={handleBlur}
      className={`visual-editable-field ${className}`}
      style={{
        ...style,
        outline: '1.5px dashed rgba(0, 163, 224, 0.4)',
        outlineOffset: '3px',
        borderRadius: '4px',
        cursor: 'text',
        minHeight: '1em',
        transition: 'outline 0.15s ease, background-color 0.15s ease',
      }}
      {...props}
    />
  );
}
