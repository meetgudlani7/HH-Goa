import React, { useState, useEffect, useCallback } from 'react';
import './styles/tokens.css';
import './index.css';
import { Uploader } from './components/Uploader';
import { Cropper } from './components/Cropper';
import { FormFields } from './components/FormFields';
import { ResultScreen } from './components/ResultScreen';
import { ScanningScreen } from './components/ScanningScreen';
import { ArtifactFront } from './components/ArtifactFront';
import { ArtifactBack } from './components/ArtifactBack';
import { PfpScreen } from './components/PfpScreen';
import { useCardRenderer } from './hooks/useCardRenderer';
import { useImageProcessor } from './hooks/useImageProcessor';

export const App = () => {
  const [step, setStep] = useState('upload');
  const [croppedImageURL, setCroppedImageURL] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    stack: '',
    role: 'Builder',
    builderTitle: '',
    city: '',
    xHandle: ''
  });
  const [cardDataURL, setCardDataURL] = useState(null);

  const { processImage, originalBlob } = useImageProcessor();
  const { renderCard, getCardDataURL } = useCardRenderer();

  const handleScanComplete = useCallback(async () => {
    try {
      const url = await renderCard(formData, croppedImageURL);
      setCardDataURL(url);
      setStep('artifact-front');
    } catch (err) {
      console.error('Failed to render card during scanning:', err);
      setStep('result');
    }
  }, [formData, croppedImageURL, renderCard]);

  const handleReset = useCallback(() => {
    if (croppedImageURL) {
      URL.revokeObjectURL(croppedImageURL);
    }
    setStep('upload');
    setCroppedImageURL(null);
    setFormData({
      name: '',
      stack: '',
      role: 'Builder',
      builderTitle: '',
      city: '',
      xHandle: ''
    });
    setCardDataURL(null);
  }, [croppedImageURL]);

  useEffect(() => {
    return () => {
      if (croppedImageURL) {
        URL.revokeObjectURL(croppedImageURL);
      }
      if (cardDataURL) {
        URL.revokeObjectURL(cardDataURL);
      }
    };
  }, [croppedImageURL, cardDataURL]);

  const screens = {
    'upload': (
      <Uploader 
        setStep={setStep} 
        processImage={processImage} 
        setCroppedImageURL={setCroppedImageURL} 
      />
    ),
    'crop': (
      <Cropper 
        setStep={setStep} 
        originalBlob={originalBlob} 
        setCroppedImageURL={setCroppedImageURL} 
      />
    ),
    'form': (
      <FormFields 
        setStep={setStep} 
        formData={formData} 
        setFormData={setFormData} 
      />
    ),
    'scanning': (
      <ScanningScreen 
        setStep={setStep} 
        formData={formData} 
        onComplete={handleScanComplete} 
      />
    ),
    'artifact-front': (
      <ArtifactFront 
        setStep={setStep} 
        cardDataURL={cardDataURL} 
      />
    ),
    'artifact-back': (
      <ArtifactBack 
        setStep={setStep} 
        formData={formData} 
      />
    ),
    'result': (
      <ResultScreen 
        setStep={setStep} 
        formData={formData} 
        getDataURL={getCardDataURL} 
        croppedImageURL={croppedImageURL}
        onReset={handleReset}
      />
    ),
    'pfp': (
      <PfpScreen 
        setStep={setStep} 
        formData={formData} 
        croppedImageURL={croppedImageURL} 
      />
    ),
  };

  return (
    <div className="app-root">
      {screens[step]}
    </div>
  );
};

export default App;
