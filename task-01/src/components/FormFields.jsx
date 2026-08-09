import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BUILDER_TITLES } from '../utils/titlesList';

/**
 * FormFields Component - Phase 3 Implementation
 * 
 * Features:
 * - Collects builder information (Name, Role, City, X handle, Builder Title)
 * - Builder Title: pick from chips or type custom
 * - Validation for required fields
 * - Auto-focus first field
 * - Mini preview of cropped photo
 * - Disabled submit until all required fields are filled
 */
export const FormFields = ({ croppedPhotoData, onNext, onBack }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    city: '',
    xHandle: '',
    builderTitle: '',
  });
  
  // Builder title mode: 'pick' or 'type'
  const [builderTitleMode, setBuilderTitleMode] = useState('pick');
  
  // Selected title index for pick mode
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(null);
  
  // Error and focus state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs for inputs
  const nameInputRef = useRef(null);

  /**
   * Auto-focus name input on mount
   */
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  /**
   * Check if form is valid (required fields filled)
   */
  const isFormValid = useCallback(() => {
    return (
      formData.name.trim().length > 0 &&
      formData.role.trim().length > 0 &&
      formData.builderTitle.trim().length > 0
    );
  }, [formData]);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Clean up X handle: remove @ prefix
    if (name === 'xHandle') {
      setFormData(prev => ({
        ...prev,
        [name]: value.replace(/@/g, ''),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  /**
   * Handle builder title selection from chip
   */
  const handleTitleSelect = useCallback((index) => {
    setSelectedTitleIndex(index);
    setFormData(prev => ({
      ...prev,
      builderTitle: BUILDER_TITLES[index],
    }));
    setErrors(prev => ({ ...prev, builderTitle: null }));
  }, []);

  /**
   * Toggle between pick and type mode for builder title
   */
  const toggleBuilderTitleMode = useCallback(() => {
    if (builderTitleMode === 'pick') {
      setBuilderTitleMode('type');
      setSelectedTitleIndex(null);
    } else {
      setBuilderTitleMode('pick');
      // If there's a typed title that's not in the list, clear it
      if (formData.builderTitle && !BUILDER_TITLES.includes(formData.builderTitle.toUpperCase())) {
        setFormData(prev => ({ ...prev, builderTitle: '' }));
      } else {
        // Find the index of the current title
        const index = BUILDER_TITLES.findIndex(t => t === formData.builderTitle.toUpperCase());
        if (index >= 0) {
          setSelectedTitleIndex(index);
        }
      }
    }
  }, [builderTitleMode, formData.builderTitle]);

  /**
   * Validate field on blur
   */
  const validateField = useCallback((name, value) => {
    if (name === 'name' || name === 'role') {
      if (value.trim().length === 0) {
        setErrors(prev => ({ ...prev, [name]: `${name.charAt(0).toUpperCase() + name.slice(1)} is required` }));
        return false;
      }
    }
    
    if (name === 'builderTitle') {
      if (value.trim().length === 0) {
        setErrors(prev => ({ ...prev, builderTitle: 'Builder Title is required' }));
        return false;
      }
      if (value.length > 32) {
        setErrors(prev => ({ ...prev, builderTitle: 'Builder Title must be 32 characters or less' }));
        return false;
      }
    }
    
    // Clear error
    setErrors(prev => ({ ...prev, [name]: null }));
    return true;
  }, []);

  /**
   * Handle field blur
   */
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    validateField(name, value);
  }, [validateField]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(() => {
    // Validate all required fields
    const isValid = isFormValid();
    
    if (!isValid) {
      // Set errors for empty required fields
      const newErrors = {};
      if (formData.name.trim().length === 0) newErrors.name = 'Name is required';
      if (formData.role.trim().length === 0) newErrors.role = 'Role is required';
      if (formData.builderTitle.trim().length === 0) newErrors.builderTitle = 'Builder Title is required';
      
      setErrors(newErrors);
      
      // Focus on first error
      if (newErrors.name && nameInputRef.current) {
        nameInputRef.current.focus();
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Pass form data to next step
      onNext({
        ...formData,
        // Ensure xHandle is stored without @
        xHandle: formData.xHandle.replace(/@/g, ''),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isFormValid, onNext]);

  /**
   * Handle keyboard submit
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && isFormValid() && !isSubmitting) {
      e.preventDefault();
      handleSubmit();
    }
  }, [isFormValid, isSubmitting, handleSubmit]);

  /**
   * Format character count for builder title
   */
  const formatCharCount = useCallback(() => {
    if (builderTitleMode !== 'type') return null;
    const count = formData.builderTitle.length;
    const max = 32;
    return `${count}/${max}`;
  }, [builderTitleMode, formData.builderTitle]);

  return (
    <div className="form-container" onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="form-header">
        <h2 className="form-title">Builder Details</h2>
        <p className="form-subtitle">Tell us about yourself</p>
      </div>

      {/* Photo preview */}
      {croppedPhotoData?.objectURL && (
        <div className="form-photo-preview">
          <div className="photo-thumb">
            <img 
              src={croppedPhotoData.objectURL} 
              alt="Your photo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </div>
          <p className="photo-preview-label">Your photo</p>
        </div>
      )}

      {/* Form fields */}
      <form className="form-fields" noValidate>
        
        {/* Name field */}
        <div className="form-field">
          <label htmlFor="name" className="form-label">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={handleBlur}
            ref={nameInputRef}
            className={`form-input ${errors.name ? 'form-input-error' : ''}`}
            placeholder="Arjun Mehta"
            maxLength={40}
            autoComplete="name"
            autoCapitalize="words"
            disabled={isSubmitting}
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        {/* Role / Stack field */}
        <div className="form-field">
          <label htmlFor="role" className="form-label">
            Role / Stack *
          </label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`form-input ${errors.role ? 'form-input-error' : ''}`}
            placeholder="Full-stack / React, Go"
            maxLength={50}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck="false"
            disabled={isSubmitting}
          />
          {errors.role && <span className="form-error">{errors.role}</span>}
        </div>

        {/* City / Country field (optional) */}
        <div className="form-field">
          <label htmlFor="city" className="form-label">
            City / Country
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="form-input"
            placeholder="Mumbai, India"
            maxLength={30}
            autoComplete="off"
            disabled={isSubmitting}
          />
        </div>

        {/* X Handle field (optional) */}
        <div className="form-field">
          <label htmlFor="xHandle" className="form-label">
            X Handle
          </label>
          <input
            type="text"
            id="xHandle"
            name="xHandle"
            value={formData.xHandle}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="form-input"
            placeholder="yourhandle"
            maxLength={30}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck="false"
            disabled={isSubmitting}
          />
          <span className="form-hint">No @ needed</span>
        </div>

        {/* Builder Title field */}
        <div className="form-field">
          <label className="form-label">
            Builder Title *
          </label>
          
          {builderTitleMode === 'pick' ? (
            <>
              <div className="title-chips-container">
                {BUILDER_TITLES.map((title, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`title-chip ${selectedTitleIndex === index ? 'selected' : ''}`}
                    onClick={() => handleTitleSelect(index)}
                    disabled={isSubmitting}
                  >
                    {title}
                  </button>
                ))}
              </div>
              <button 
                type="button"
                className="title-mode-toggle"
                onClick={toggleBuilderTitleMode}
                disabled={isSubmitting}
              >
                or type your own
              </button>
            </>
          ) : (
            <>
              <div className="form-input-wrapper">
                <input
                  type="text"
                  name="builderTitle"
                  value={formData.builderTitle}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`form-input ${errors.builderTitle ? 'form-input-error' : ''}`}
                  placeholder="Enter your custom title"
                  maxLength={32}
                  autoComplete="off"
                  autoCapitalize="words"
                  disabled={isSubmitting}
                />
                <span className="char-counter">{formatCharCount()}</span>
              </div>
              <button 
                type="button"
                className="title-mode-toggle"
                onClick={toggleBuilderTitleMode}
                disabled={isSubmitting}
              >
                Back to chips
              </button>
            </>
          )}
          
          {errors.builderTitle && <span className="form-error">{errors.builderTitle}</span>}
        </div>

      </form>

      {/* Actions */}
      <div className="form-actions">
        <button 
          type="button"
          className="btn-secondary"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </button>
        
        <button 
          type="button"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!isFormValid() || isSubmitting}
        >
          {isSubmitting ? 'Generating...' : 'Generate My Card'}
        </button>
      </div>

      {/* Required fields notice */}
      <p className="form-required-notice">
        * Required
      </p>
    </div>
  );
};

export default FormFields;
