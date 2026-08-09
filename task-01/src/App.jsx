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
    xHandle: '',
  });
  // Only the setter is used — ArtifactFront pre-renders the front card as a
  // validation/warm-up step and reports back via this, but nothing reads
  // the resulting data URL anymore now that ResultScreen renders its own
  // fresh combined front+back image on demand.
  const [, setCardDataURL] = useState(null);
  const [builderSerial] = useState(() => String(Math.floor(Math.random() * 900) + 100));

  const { processImage, originalBlob } = useImageProcessor();
  const handleScanComplete = useCallback(() => setStep('artifact-front'), [setStep]);

  const handleReset = useCallback(() => {
    if (croppedImageURL) {
      URL.revokeObjectURL(croppedImageURL);
    }
    if (originalBlob?.objectURL) {
      URL.revokeObjectURL(originalBlob.objectURL);
    }
    setStep('upload');
    setCroppedImageURL(null);
    setFormData({
      name: '',
      stack: '',
      role: 'Builder',
      builderTitle: '',
      city: '',
      xHandle: '',
    });
    setCardDataURL(null);
  }, [croppedImageURL, originalBlob]);

  useEffect(() => {
    // NOTE: only depend on the URLs actually being revoked here. Adding
    // cardDataURL (or anything else) to this array would re-run the cleanup
    // — and revoke the still-in-use croppedImageURL/originalBlob URLs —
    // every time cardDataURL changes, e.g. right after the card finishes
    // rendering. That's what caused the front photo to go blank/broken the
    // moment you flipped to the back and came back.
    return () => {
      if (croppedImageURL) {
        URL.revokeObjectURL(croppedImageURL);
      }
      if (originalBlob?.objectURL) {
        URL.revokeObjectURL(originalBlob.objectURL);
      }
    };
  }, [croppedImageURL, originalBlob]);

  const screens = {
    upload: <Uploader setStep={setStep} processImage={processImage} />,
    crop: (
      <Cropper
        setStep={setStep}
        originalBlob={originalBlob}
        setCroppedImageURL={setCroppedImageURL}
      />
    ),
    form: <FormFields setStep={setStep} formData={formData} setFormData={setFormData} />,
    scanning: (
      <ScanningScreen setStep={setStep} formData={formData} onComplete={handleScanComplete} />
    ),
    'artifact-front': (
      <ArtifactFront
        setStep={setStep}
        formData={formData}
        croppedImageURL={croppedImageURL}
        serial={builderSerial}
        onCardReady={setCardDataURL}
      />
    ),
    'artifact-back': <ArtifactBack setStep={setStep} formData={formData} serial={builderSerial} />,
    result: (
      <ResultScreen
        setStep={setStep}
        formData={formData}
        croppedImageURL={croppedImageURL}
        serial={builderSerial}
        onReset={handleReset}
      />
    ),
    pfp: <PfpScreen setStep={setStep} formData={formData} croppedImageURL={croppedImageURL} />,
  };

  return <div className="app-root">{screens[step]}</div>;
};

export default App;
