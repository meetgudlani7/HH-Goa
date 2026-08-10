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
import { DEFAULT_INGREDIENTS } from './utils/ingredientsList';

const INITIAL_FORM_DATA = {
  name: '',
  role: 'Builder',
  builderTitle: '',
  city: '',
  xHandle: '',
  ingredients: DEFAULT_INGREDIENTS,
};

export const App = () => {
  const [step, setStep] = useState('upload');
  const [croppedImageURL, setCroppedImageURL] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
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
    setFormData(INITIAL_FORM_DATA);
    setCardDataURL(null);
  }, [croppedImageURL, originalBlob]);

  // Each blob URL gets its own cleanup effect, keyed only to itself. A
  // single combined effect (depending on both) would re-run its cleanup —
  // using the *previous* render's values — whenever *either* URL changed,
  // so setting croppedImageURL for the first time (right after confirming
  // a crop) would revoke originalBlob's still-in-use URL even though
  // originalBlob itself never changed. That's what caused the original
  // photo to go blank/broken when navigating back from Form to Crop (and,
  // previously, from Result back to Artifact-Front).
  useEffect(() => {
    return () => {
      if (croppedImageURL) {
        URL.revokeObjectURL(croppedImageURL);
      }
    };
  }, [croppedImageURL]);

  useEffect(() => {
    return () => {
      if (originalBlob?.objectURL) {
        URL.revokeObjectURL(originalBlob.objectURL);
      }
    };
  }, [originalBlob]);

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
    scanning: <ScanningScreen setStep={setStep} onComplete={handleScanComplete} />,
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
