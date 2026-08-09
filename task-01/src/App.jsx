import React, { useState, useEffect } from 'react';
import './styles/tokens.css';
import './index.css';
import { Uploader } from './components/Uploader';
import { Cropper } from './components/Cropper';
import { FormFields } from './components/FormFields';
import { ResultScreen } from './components/ResultScreen';

export const App = () => {
  const [step, setStep] = useState('upload'); // 'upload' | 'crop' | 'form' | 'result'
  const [photoData, setPhotoData] = useState(null);
  const [croppedPhotoData, setCroppedPhotoData] = useState(null);
  const [badgeData, setBadgeData] = useState(null);

  const handleUploadNext = (data) => {
    if (photoData?.objectURL) {
      URL.revokeObjectURL(photoData.objectURL);
    }
    if (croppedPhotoData?.objectURL) {
      URL.revokeObjectURL(croppedPhotoData.objectURL);
    }

    setPhotoData(data);
    setCroppedPhotoData(null);
    setStep('crop');
  };

  const handleCropNext = (data) => {
    if (croppedPhotoData?.objectURL && data.objectURL !== croppedPhotoData.objectURL) {
      URL.revokeObjectURL(croppedPhotoData.objectURL);
    }
    setCroppedPhotoData(data);
    setStep('form');
  };

  const handleFormNext = (data) => {
    setBadgeData(data);
    setStep('result');
  };

  const handleReset = () => {
    // Revoke object URLs to prevent memory leaks
    if (photoData?.objectURL) {
      URL.revokeObjectURL(photoData.objectURL);
    }
    if (croppedPhotoData?.objectURL) {
      URL.revokeObjectURL(croppedPhotoData.objectURL);
    }
    
    setStep('upload');
    setPhotoData(null);
    setCroppedPhotoData(null);
    setBadgeData(null);
  };

  // Clean up object URLs when the data changes or component unmounts
  useEffect(() => {
    return () => {
      if (photoData?.objectURL) {
        URL.revokeObjectURL(photoData.objectURL);
      }
      if (croppedPhotoData?.objectURL) {
        URL.revokeObjectURL(croppedPhotoData.objectURL);
      }
    };
  }, [photoData, croppedPhotoData]);

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '32px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
          HH Goa <span style={{ color: 'var(--accent-glow)' }}>2026</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Builder ID Card Generator</p>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {step === 'upload' && <Uploader onNext={handleUploadNext} />}
        {step === 'crop' && (
          <Cropper 
            photoData={photoData} 
            onNext={handleCropNext} 
            onBack={() => setStep('upload')} 
          />
        )}
        {step === 'form' && (
          <FormFields 
            croppedPhotoData={croppedPhotoData}
            onNext={handleFormNext} 
            onBack={() => setStep('crop')} 
          />
        )}
        {step === 'result' && (
          <ResultScreen 
            croppedPhotoData={croppedPhotoData}
            badgeData={badgeData} 
            onReset={handleReset} 
          />
        )}
      </main>

      <footer style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>
        GOA &bull; JAN 2026 &bull; goa.hackathon.com
      </footer>
    </div>
  );
};
