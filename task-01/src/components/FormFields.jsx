import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BUILDER_TITLES } from '../utils/titlesList';

export const FormFields = ({ setStep, formData, setFormData }) => {
  const [builderTitleMode, setBuilderTitleMode] = useState('pick');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const isFormValid = useCallback(() => {
    return (
      formData.name.trim().length > 0 &&
      formData.stack.trim().length > 0 &&
      formData.builderTitle.trim().length > 0
    );
  }, [formData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'xHandle') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/@/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors, setFormData]);

  const handleTitleSelect = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      builderTitle: BUILDER_TITLES[index],
    }));
    setErrors(prev => ({ ...prev, builderTitle: null }));
  }, [setFormData]);

  const regenerateTitle = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * BUILDER_TITLES.length);
    handleTitleSelect(randomIndex);
  }, [handleTitleSelect]);

  const toggleBuilderTitleMode = useCallback(() => {
    if (builderTitleMode === 'pick') {
      setBuilderTitleMode('type');
    } else {
      setBuilderTitleMode('pick');
    }
  }, [builderTitleMode]);

  const formatCharCount = useCallback(() => {
    if (builderTitleMode !== 'type') return null;
    return `${formData.builderTitle.length}/32`;
  }, [builderTitleMode, formData.builderTitle]);

  const handleSubmit = useCallback(() => {
    const isValid = isFormValid();
    
    if (!isValid) {
      const newErrors = {};
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.stack.trim()) newErrors.stack = 'Stack is required';
      if (!formData.builderTitle.trim()) newErrors.builderTitle = 'Builder Title is required';
      setErrors(newErrors);
      if (newErrors.name && nameInputRef.current) nameInputRef.current.focus();
      return;
    }

    setIsSubmitting(true);
    setStep('scanning');
    setIsSubmitting(false);
  }, [formData, isFormValid, setStep]);

  return (
    <div className="form-screen" style={{ maxWidth: '540px', margin: '0 auto' }}>
      <div className="form-poster-bg">BUILD</div>
      <div className="border-strip-top"></div>
      
      <div className="windowbar">
        <div className="windowbar-title">⬛ NAAM KYA HAI, BUILDER? — STEP 2 OF 3</div>
        <div className="wbtns">
          <div className="wbtn" style={{ background: '#C8001E' }}></div>
          <div className="wbtn" style={{ background: '#F0C229' }}></div>
          <div className="wbtn" style={{ background: '#2A7A4B' }}></div>
        </div>
      </div>

      <div className="form-body">
        <div className="form-eyebrow">// IDENTITY CONFIGURATION IN PROGRESS</div>
        <div className="form-heading-big">
          TERI<br />
          <span className="hl">IDENTITY</span><br />
          KYA HAI?
        </div>

        <div className="field-group">
          <div className="field-label">TERA NAAM KYA HAI? / Your name</div>
          <input 
            className="field-inp"
            value={formData.name}
            onChange={handleInputChange}
            ref={nameInputRef}
            name="name"
            placeholder="Your Name"
            maxLength={40}
            autoComplete="name"
            disabled={isSubmitting}
          />
          {formData.name.trim() && <div className="field-decoration">NAAM ✓</div>}
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>

        <div className="field-group">
          <div className="field-label">KYA CHALTA HAI MACHINE MEIN? / Your stack</div>
          <input 
            className="field-inp"
            value={formData.stack}
            onChange={handleInputChange}
            name="stack"
            placeholder="REACT / TS / AI"
            maxLength={50}
            autoComplete="off"
            disabled={isSubmitting}
          />
          {formData.stack.trim() && <div className="field-decoration">STACK ✓</div>}
          {errors.stack && <div className="field-error">{errors.stack}</div>}
        </div>

        <div className="field-group">
          <div className="field-label">KAHAN SE AAYA HAI? / City, Country</div>
          <input 
            className="field-inp"
            value={formData.city}
            onChange={handleInputChange}
            name="city"
            placeholder="Goa, India"
            maxLength={30}
            autoComplete="off"
            disabled={isSubmitting}
          />
        </div>

        <div className="field-group">
          <div className="field-label">TU X PE KYA HAI? / @handle</div>
          <input 
            className="field-inp"
            value={formData.xHandle}
            onChange={handleInputChange}
            name="xHandle"
            placeholder="yourhandle"
            maxLength={30}
            autoComplete="off"
            disabled={isSubmitting}
          />
          <div className="field-hint">No @ needed</div>
        </div>

        <div className="tags-label">TU KYA BANATA HAI? / Your role</div>
        <div className="tags-row">
          {['Builder', 'Designer', 'Founder', 'AI Hacker', 'Chaos Agent'].map((role) => (
            <button
              key={role}
              className={`tag ${formData.role === role ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, role }))}
              disabled={isSubmitting}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="back-pattern-row" style={{ margin: '14px 0' }}>
          <div className="bp-diamond"></div><div className="bp-circle"></div>
          <div className="bp-diamond"></div><div className="bp-circle"></div>
          <div className="bp-diamond"></div><div className="bp-circle"></div>
          <div className="bp-diamond"></div>
        </div>

        <div className="tags-label">// GENERATED BUILDER TITLE</div>
        
        {builderTitleMode === 'pick' && (
          <>
            <div className="title-box">
              <div className="title-box-name">{formData.builderTitle || 'Select a title...'}</div>
              <button className="title-box-regen" onClick={regenerateTitle} disabled={isSubmitting}>
                ↻ EK AUR
              </button>
            </div>
            
            <div className="tags-row" style={{ marginTop: '8px' }}>
              {BUILDER_TITLES.slice(0, 8).map((title, index) => (
                <button
                  key={index}
                  className={`tag ${formData.builderTitle === title ? 'active' : ''}`}
                  onClick={() => handleTitleSelect(index)}
                  disabled={isSubmitting}
                >
                  {title}
                </button>
              ))}
            </div>
            <div className="tags-row" style={{ marginTop: '8px' }}>
              {BUILDER_TITLES.slice(8).map((title, index) => (
                <button
                  key={index + 8}
                  className={`tag ${formData.builderTitle === title ? 'active' : ''}`}
                  onClick={() => handleTitleSelect(index + 8)}
                  disabled={isSubmitting}
                >
                  {title}
                </button>
              ))}
            </div>
          </>
        )}

        {builderTitleMode === 'type' && (
          <div className="field-group">
            <input 
              className="field-inp"
              value={formData.builderTitle}
              onChange={handleInputChange}
              name="builderTitle"
              placeholder="Your custom title"
              maxLength={32}
              autoComplete="off"
              disabled={isSubmitting}
            />
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '7px', color: 'var(--fade)', letterSpacing: '.08em', marginTop: '4px' }}>
              {formData.builderTitle.length}/32
            </div>
          </div>
        )}

        <button type="button" className="title-mode-toggle" onClick={toggleBuilderTitleMode} disabled={isSubmitting}>
          {builderTitleMode === 'pick' ? '✏ TYPE MY OWN' : 'Back to chips'}
        </button>

        {errors.builderTitle && <div className="field-error">{errors.builderTitle}</div>}

        <div className="back-pattern-row" style={{ margin: '14px 0' }}>
          <div className="bp-diamond"></div><div className="bp-circle"></div>
          <div className="bp-diamond"></div><div className="bp-circle"></div>
          <div className="bp-diamond"></div><div className="bp-circle"></div>
          <div className="bp-diamond"></div>
        </div>

        <button className="generate-btn" onClick={handleSubmit} disabled={!isFormValid() || isSubmitting}>
          JUGAAD KARO → GENERATE MY ARTIFACT
        </button>
      </div>
      <div className="border-strip-bottom"></div>
    </div>
  );
};

export default FormFields;
