import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

export const VisualEditorContext = createContext(null);

export function VisualEditorProvider({ children, pageSlug, isEditMode = false, onSavePage, initialData = {} }) {
  const [editMode, setEditMode] = useState(isEditMode);
  const [isPreview, setIsPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved', 'error'
  
  // Page editable content store
  const [pageDraft, setPageDraft] = useState(initialData);
  const registeredFields = useRef(new Map());

  useEffect(() => {
    setEditMode(isEditMode);
  }, [isEditMode]);

  useEffect(() => {
    setPageDraft(initialData);
    setHasUnsavedChanges(false);
  }, [pageSlug, initialData]);

  const updateField = (fieldKey, htmlContent) => {
    setPageDraft((prev) => {
      const next = { ...prev, [fieldKey]: htmlContent };
      return next;
    });
    setHasUnsavedChanges(true);
    setSaveStatus('');
  };

  const handleSave = async () => {
    if (!onSavePage) return;
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      await onSavePage(pageDraft);
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  return (
    <VisualEditorContext.Provider
      value={{
        isEditMode: editMode && !isPreview,
        rawEditMode: editMode,
        setEditMode,
        isPreview,
        setIsPreview,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        isSaving,
        saveStatus,
        pageSlug,
        pageDraft,
        updateField,
        handleSave,
        executeCommand,
      }}
    >
      {children}
    </VisualEditorContext.Provider>
  );
}

export function useVisualEditor() {
  const ctx = useContext(VisualEditorContext);
  return ctx || {
    isEditMode: false,
    rawEditMode: false,
    isPreview: false,
    hasUnsavedChanges: false,
    pageDraft: {},
    updateField: () => {},
    handleSave: async () => {},
    executeCommand: () => {}
  };
}
