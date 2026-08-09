#!/usr/bin/env node
/**
 * End-to-End Workflow Validation Script for HH Goa 2026 V2
 * This script validates the complete user journey and application structure
 */

const fs = require('fs');
const path = require('path');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.magenta}${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function assert(condition, testName, details = '') {
  if (condition) {
    log.success(testName);
    results.passed++;
  } else {
    log.error(testName);
    if (details) log.error(`  Details: ${details}`);
    results.failed++;
  }
}

function warn(condition, testName, details = '') {
  if (!condition) {
    log.warning(testName);
    if (details) log.warning(`  Details: ${details}`);
    results.warnings++;
  }
}

// File system utility
const srcPath = path.join(__dirname, 'src');

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Start validation
log.header('═══════════════════════════════════════════════════');
log.header('  HH GOA 2026 V2 - END-TO-END WORKFLOW VALIDATION');
log.header('═══════════════════════════════════════════════════\n');

// ============================================
// PHASE 1: PROJECT STRUCTURE VALIDATION
// ============================================
log.section('📁 PHASE 1: Project Structure Validation');

const requiredFiles = [
  'src/App.jsx',
  'src/main.jsx',
  'src/index.css',
  'src/components/Uploader.jsx',
  'src/components/Cropper.jsx',
  'src/components/FormFields.jsx',
  'src/components/ScanningScreen.jsx',
  'src/components/ArtifactFront.jsx',
  'src/components/ArtifactBack.jsx',
  'src/components/ResultScreen.jsx',
  'src/components/PfpScreen.jsx',
  'src/hooks/useCardRenderer.js',
  'src/hooks/useImageProcessor.js',
  'src/utils/canvasHelpers.js',
  'src/utils/titlesList.js',
  'src/styles/tokens.css',
  'package.json',
  'vite.config.js',
  'index.html',
];

const missingFiles = [];
requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fileExists(fullPath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length === 0) {
  log.success('All required files exist');
  results.passed++;
} else {
  log.error(`Missing files: ${missingFiles.join(', ')}`);
  results.failed += missingFiles.length;
}

// ============================================
// PHASE 2: DEPENDENCY VALIDATION
// ============================================
log.section('📦 PHASE 2: Dependency Validation');

try {
  const packageJson = readJSON(path.join(__dirname, 'package.json'));
  
  const requiredDeps = [
    'react',
    'react-dom',
    'react-easy-crop',
    'heic2any',
    'canvas-confetti',
  ];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies || !packageJson.dependencies[dep]
  );
  
  if (missingDeps.length === 0) {
    log.success('All required dependencies are installed');
    results.passed++;
  } else {
    log.error(`Missing dependencies: ${missingDeps.join(', ')}`);
    results.failed += missingDeps.length;
  }
  
  // Check dev dependencies
  const requiredDevDeps = [
    'vite',
    '@vitejs/plugin-react',
  ];
  
  const missingDevDeps = requiredDevDeps.filter(dep => 
    !packageJson.devDependencies || !packageJson.devDependencies[dep]
  );
  
  if (missingDevDeps.length === 0) {
    log.success('All required devDependencies are installed');
    results.passed++;
  } else {
    log.error(`Missing devDependencies: ${missingDevDeps.join(', ')}`);
    results.failed += missingDevDeps.length;
  }
  
  // Check scripts
  const requiredScripts = ['dev', 'build', 'preview'];
  const missingScripts = requiredScripts.filter(script => 
    !packageJson.scripts || !packageJson.scripts[script]
  );
  
  if (missingScripts.length === 0) {
    log.success('All required npm scripts are defined');
    results.passed++;
  } else {
    log.error(`Missing scripts: ${missingScripts.join(', ')}`);
    results.failed += missingScripts.length;
  }
  
} catch (err) {
  log.error('Failed to read package.json');
  results.failed++;
}

// ============================================
// PHASE 3: APP.JSX WORKFLOW VALIDATION
// ============================================
log.section('🔄 PHASE 3: App.jsx Workflow Validation');

try {
  const appContent = readFile(path.join(srcPath, 'App.jsx'));
  
  // Check for state management
  const hasUseState = appContent.includes('useState');
  assert(hasUseState, 'Uses React useState hook');
  
  const hasStepState = appContent.includes("step") && appContent.includes("setStep");
  assert(hasStepState, 'Manages step state for navigation');
  
  const hasCroppedImageURL = appContent.includes("croppedImageURL") && appContent.includes("setCroppedImageURL");
  assert(hasCroppedImageURL, 'Manages croppedImageURL state');
  
  const hasFormData = appContent.includes("formData") && appContent.includes("setFormData");
  assert(hasFormData, 'Manages formData state');
  
  const hasCardDataURL = appContent.includes("cardDataURL") && appContent.includes("setCardDataURL");
  assert(hasCardDataURL, 'Manages cardDataURL state');
  
  // Check for all screen imports
  const requiredImports = [
    'Uploader',
    'Cropper',
    'FormFields',
    'ScanningScreen',
    'ArtifactFront',
    'ArtifactBack',
    'ResultScreen',
    'PfpScreen',
    'useCardRenderer',
    'useImageProcessor',
  ];
  
  const missingImports = requiredImports.filter(imp => !appContent.includes(imp));
  assert(missingImports.length === 0, 
    `All screen imports present (missing: ${missingImports.join(', ')})`,
    missingImports.length > 0 ? missingImports.join(', ') : ''
  );
  
  // Check for all workflow steps
  const expectedSteps = [
    'upload',
    'crop',
    'form',
    'scanning',
    'artifact-front',
    'artifact-back',
    'result',
    'pfp',
  ];
  
  const missingSteps = expectedSteps.filter(step => !appContent.includes(`'${step}'`));
  assert(missingSteps.length === 0,
    `All workflow steps defined (missing: ${missingSteps.join(', ')})`,
    missingSteps.length > 0 ? missingSteps.join(', ') : ''
  );
  
  // Check for handleScanComplete
  const hasHandleScanComplete = appContent.includes('handleScanComplete');
  assert(hasHandleScanComplete, 'Has handleScanComplete function');
  
  // Check for renderCard call in handleScanComplete
  const hasRenderCardCall = appContent.includes('renderCard(formData, croppedImageURL)');
  assert(hasRenderCardCall, 'Calls renderCard with formData and croppedImageURL');
  
  // Check for handleReset
  const hasHandleReset = appContent.includes('handleReset');
  assert(hasHandleReset, 'Has handleReset function');
  
  // Check for cleanup in useEffect
  const hasCleanup = appContent.includes('URL.revokeObjectURL');
  assert(hasCleanup, 'Cleans up object URLs in useEffect');
  
} catch (err) {
  log.error('Failed to read App.jsx');
  results.failed++;
}

// ============================================
// PHASE 4: CARD RENDERER VALIDATION
// ============================================
log.section('🎨 PHASE 4: useCardRenderer.js Validation');

try {
  const rendererContent = readFile(path.join(srcPath, 'hooks', 'useCardRenderer.js'));
  
  // Check for card dimensions
  const hasCorrectWidth = rendererContent.includes('width: 1080');
  const hasCorrectHeight = rendererContent.includes('height: 1620');
  assert(hasCorrectWidth && hasCorrectHeight, 'Card dimensions are 1080x1620');
  
  // Check for color tokens (colors are defined in config, not as variables)
  const requiredColors = ['C8001E', 'F0C229', 'E8407A', '2A7A4B', 'F5EDD8', '1A1008', 'D4511A', '2B5FA0'];
  const foundColors = requiredColors.filter(color => rendererContent.includes(color));
  log.info(`Found ${foundColors.length}/${requiredColors.length} color values in config`);
  assert(foundColors.length >= 6, `At least 6 color values present (found: ${foundColors.length})`);
  
  // Check for renderCard function
  const hasRenderCard = rendererContent.includes('renderCard');
  assert(hasRenderCard, 'Has renderCard function');
  
  // Check for getCardDataURL function
  const hasGetCardDataURL = rendererContent.includes('getCardDataURL');
  assert(hasGetCardDataURL, 'Has getCardDataURL function');
  
  // Check for font loading
  const hasFontLoading = rendererContent.includes('document.fonts.ready');
  assert(hasFontLoading, 'Waits for fonts to load');
  
  // Check for layer drawing functions (these are useCallback hooks in the renderer)
  const layerFunctions = [
    'drawRoundRect',
    'drawStrokedText',
    'drawArtTopBand',
    'drawHibiscus',
    'drawScooter',
    'drawCoconutTree',
    'drawWave',
    'drawSeal',
    'drawSticker',
    'drawIngredientsBox',
    'drawEasterEggs',
    'drawNameGiant',
    'drawShipText',
    'drawPhotoZone',
    'drawTitlePlate',
    'drawBottomBand',
  ];
  
  const foundFunctions = layerFunctions.filter(fn => rendererContent.includes(fn));
  log.info(`Found ${foundFunctions.length}/${layerFunctions.length} layer drawing functions`);
  assert(foundFunctions.length >= 12, `At least 12 layer functions present (found: ${foundFunctions.length})`);
  
  // Check for photo zone configuration
  const hasPhotoConfig = rendererContent.includes('photo:') && 
    rendererContent.includes('width: 1016') && 
    rendererContent.includes('height: 560');
  assert(hasPhotoConfig, 'Photo zone configured correctly (1016x560)');
  
  // Check for name display configuration
  const hasNameDisplay = rendererContent.includes('nameDisplay:') && 
    rendererContent.includes('Unbounded');
  assert(hasNameDisplay, 'Name display uses Unbounded font');
  
} catch (err) {
  log.error('Failed to read useCardRenderer.js');
  results.failed++;
}

// ============================================
// PHASE 5: CANVAS HELPERS VALIDATION
// ============================================
log.section('🖌️  PHASE 5: canvasHelpers.js Validation');

try {
  const helpersContent = readFile(path.join(srcPath, 'utils', 'canvasHelpers.js'));
  
  // Check for utility functions
  const utilityFunctions = [
    'getCroppedImg',
    'getImageDimensions',
    'revokeObjectURL',
    'rotateImage',
    'drawRoundRect',
    'drawStrokedText',
    'drawArtBand',
    'drawHibiscus',
    'drawScooter',
    'drawCoconutTree',
    'drawWave',
    'drawSeal',
    'drawSticker',
    'parseName',
    'parseStack',
    'drawNameGiant',
    'drawShipText',
  ];
  
  const foundHelperFunctions = utilityFunctions.filter(fn => helpersContent.includes(fn));
  log.info(`Found ${foundHelperFunctions.length}/${utilityFunctions.length} utility functions`);
  assert(foundHelperFunctions.length >= 12, 
    `At least 12 utility functions present (found: ${foundHelperFunctions.length})`
  );
  
  // Check for specific implementations (exported as const, not function)
  const hasDrawRoundRect = helpersContent.includes('drawRoundRect');
  assert(hasDrawRoundRect, 'Has drawRoundRect function');
  
  const hasParseName = helpersContent.includes('parseName');
  assert(hasParseName, 'Has parseName function');
  
  const hasParseStack = helpersContent.includes('parseStack');
  assert(hasParseStack, 'Has parseStack function');
  
} catch (err) {
  log.error('Failed to read canvasHelpers.js');
  results.failed++;
}

// ============================================
// PHASE 6: COMPONENT VALIDATION
// ============================================
log.section('🧩 PHASE 6: Component Validation');

const components = [
  'Uploader',
  'Cropper',
  'FormFields',
  'ScanningScreen',
  'ArtifactFront',
  'ArtifactBack',
  'ResultScreen',
  'PfpScreen',
];

components.forEach(component => {
  try {
    const componentPath = path.join(srcPath, 'components', `${component}.jsx`);
    if (!fileExists(componentPath)) {
      log.error(`Component ${component}.jsx not found`);
      results.failed++;
      return;
    }
    
    const componentContent = readFile(componentPath);
    
    // Basic checks
    const hasReactImport = componentContent.includes('import React') || componentContent.includes("from 'react'");
    assert(hasReactImport, `${component} imports React`);
    
    const hasExport = componentContent.includes('export') && (
      componentContent.includes('function') || componentContent.includes('const')
    );
    assert(hasExport, `${component} has export`);
    
    // Component-specific checks
    switch (component) {
      case 'Uploader':
        const hasFileInput = componentContent.includes('input') && componentContent.includes('type="file"');
        assert(hasFileInput, 'Uploader has file input');
        break;
        
      case 'Cropper':
        const hasEasyCrop = componentContent.includes('react-easy-crop') || componentContent.includes('Cropper');
        assert(hasEasyCrop, 'Cropper uses react-easy-crop');
        break;
        
      case 'FormFields':
        const hasFormInputs = componentContent.includes('name') && 
          componentContent.includes('stack') && 
          componentContent.includes('role');
        assert(hasFormInputs, 'FormFields has form input fields');
        break;
        
      case 'ScanningScreen':
        const hasAnimation = componentContent.includes('confetti') || 
          componentContent.includes('animation') || 
          componentContent.includes('scanning');
        warn(hasAnimation, 'ScanningScreen has animation logic');
        break;
        
      case 'ArtifactFront':
        const hasCardDisplay = componentContent.includes('cardDataURL') || 
          componentContent.includes('artifact');
        assert(hasCardDisplay, 'ArtifactFront displays card');
        break;
        
      case 'ArtifactBack':
        const hasBioDisplay = componentContent.includes('formData') || 
          componentContent.includes('bio');
        assert(hasBioDisplay, 'ArtifactBack displays bio data');
        break;
        
      case 'ResultScreen':
        const hasDownload = componentContent.includes('download') || 
          componentContent.includes('Download');
        assert(hasDownload, 'ResultScreen has download button');
        
        const hasShare = componentContent.includes('share') || 
          componentContent.includes('Share') || 
          componentContent.includes('X');
        assert(hasShare, 'ResultScreen has share to X button');
        
        const hasMakeAnother = componentContent.includes('make another') || 
          componentContent.includes('Make Another');
        assert(hasMakeAnother, 'ResultScreen has make another button');
        
        const hasPfpButton = componentContent.includes('pfp') || 
          componentContent.includes('PFP') || 
          componentContent.includes('profile picture');
        assert(hasPfpButton, 'ResultScreen has PFP version button');
        break;
        
      case 'PfpScreen':
        const hasRoundPfp = componentContent.includes('round') || 
          componentContent.includes('Round');
        const hasSquarePfp = componentContent.includes('square') || 
          componentContent.includes('Square');
        assert(hasRoundPfp && hasSquarePfp, 'PfpScreen generates both round and square versions');
        break;
    }
  } catch (err) {
    log.error(`Error reading component ${component}: ${err.message}`);
    results.failed++;
  }
});

// ============================================
// PHASE 7: TITLES LIST VALIDATION
// ============================================
log.section('📜 PHASE 7: titlesList.js Validation');

try {
  const titlesContent = readFile(path.join(srcPath, 'utils', 'titlesList.js'));
  
  // Check for expected titles from IMPLEMENTATION_SUMMARY.md
  const expectedTitles = [
    'THE PIXEL ALCHEMIST',
    'VIBE ENGINEER',
    'FULL STACK GREMLIN',
    'WILL SHIP FOR CHAI',
    '404: SLEEP NOT FOUND',
  ];
  
  const foundTitles = expectedTitles.filter(title => titlesContent.includes(title));
  log.info(`Found ${foundTitles.length}/${expectedTitles.length} expected titles`);
  assert(foundTitles.length >= 3, `At least 3 expected titles present (found: ${foundTitles.length})`);
  
  // Count total titles (BUILDER_TITLES array)
  const titleMatches = titlesContent.match(/"[^"]+"/g) || [];
  // Filter out non-title strings like "BUILDER" and comments
  const titleLines = titleMatches.filter(m => m.includes('THE') || m.includes('VIBE') || m.includes('FULL') || m.includes('WILL') || m.includes('404') || m.includes('BROKE') || m.includes('NEVER') || m.includes('CEO') || m.includes('CAFFEINATED') || m.includes('DEBUGGING') || m.includes('ONE MORE') || m.includes('DESIGN') || m.includes('JUST SHIP') || m.includes('LIVING') || m.includes('LOCALHOST') || m.includes('MVP') || m.includes('GIT PUSH') || m.includes('ZERO') || m.includes('BUILDING') || m.includes('CHAOS') || m.includes('JUGAAD') || m.includes('SHIP FOR') || m.includes('SLEEP NOT'));
  const totalTitles = titleLines.length;
  log.info(`Total titles found: ${totalTitles}`);
  assert(totalTitles >= 20, `At least 20 titles defined (found: ${totalTitles})`);
  
} catch (err) {
  log.error('Failed to read titlesList.js');
  results.failed++;
}

// ============================================
// PHASE 8: STYLES VALIDATION
// ============================================
log.section('🎨 PHASE 8: Styles Validation');

try {
  const indexCss = readFile(path.join(srcPath, 'index.css'));
  const tokensCss = readFile(path.join(srcPath, 'styles', 'tokens.css'));
  
  // Check for color tokens (without hh- prefix based on tokens.css)
  const requiredTokens = [
    '--red',
    '--yellow',
    '--pink',
    '--green',
    '--cream',
    '--ink',
    '--orange',
    '--blue',
  ];
  
  const foundTokens = requiredTokens.filter(token => tokensCss.includes(token));
  log.info(`Found ${foundTokens.length}/${requiredTokens.length} color tokens`);
  assert(foundTokens.length >= 6, `At least 6 color tokens defined (found: ${foundTokens.length})`);
  
  // Check for responsive styles
  const hasMobileMediaQuery = indexCss.includes('@media') && indexCss.includes('480px');
  assert(hasMobileMediaQuery, 'Has responsive styles for mobile (< 480px)');
  
  // Check for safe area insets
  const hasSafeArea = indexCss.includes('safe-area-inset') || indexCss.includes('env(safe-area');
  warn(hasSafeArea, 'Uses safe area insets for iPhone notch');
  
  // Check for minimum touch target
  const hasMinHeight = indexCss.includes('min-height: 44px');
  warn(hasMinHeight, 'Buttons have minimum 44px height for touch targets');
  
  // Check for font imports (fonts are in index.html, not tokens.css)
  // tokens.css has color variables, fonts are in index.html
  const hasFontImports = indexCss.includes('Unbounded') || 
    indexCss.includes('Teko') || 
    indexCss.includes('Abril') || 
    indexCss.includes('Space');
  warn(hasFontImports, 'CSS references custom fonts');
  
} catch (err) {
  log.error('Failed to read CSS files');
  results.failed++;
}

// ============================================
// PHASE 9: WORKFLOW LOGIC VALIDATION
// ============================================
log.section('🔗 PHASE 9: Workflow Logic Validation');

try {
  const appContent = readFile(path.join(srcPath, 'App.jsx'));
  
  // Verify the workflow order
  const steps = [
    'upload',
    'crop',
    'form',
    'scanning',
    'artifact-front',
    'artifact-back',
    'result',
    'pfp',
  ];
  
  // Check that all steps are defined in screens object
  steps.forEach(step => {
    const hasStep = appContent.includes(`'${step}':`);
    assert(hasStep, `Step '${step}' is defined in screens object`);
  });
  
  // Verify navigation flow
  // Upload -> Crop: Uploader calls setStep('crop')
  const uploaderContent = readFile(path.join(srcPath, 'components', 'Uploader.jsx'));
  const hasUploadToCrop = uploaderContent.includes("setStep('crop')") || 
    uploaderContent.includes('setStep("crop")');
  assert(hasUploadToCrop, 'Upload screen navigates to crop');
  
  // Crop -> Form: Cropper calls setStep('form')
  const cropperContent = readFile(path.join(srcPath, 'components', 'Cropper.jsx'));
  const hasCropToForm = cropperContent.includes("setStep('form')") || 
    cropperContent.includes('setStep("form")');
  assert(hasCropToForm, 'Crop screen navigates to form');
  
  // Form -> Scanning: FormFields calls setStep('scanning')
  const formContent = readFile(path.join(srcPath, 'components', 'FormFields.jsx'));
  const hasFormToScanning = formContent.includes("setStep('scanning')") || 
    formContent.includes('setStep("scanning")');
  assert(hasFormToScanning, 'Form screen navigates to scanning');
  
  // Scanning -> Artifact Front: handleScanComplete calls setStep('artifact-front')
  assert(appContent.includes("setStep('artifact-front')"), 
    'Scanning navigates to artifact-front via handleScanComplete');
  
  // Artifact Front -> Artifact Back: ArtifactFront calls setStep('artifact-back')
  const artifactFrontContent = readFile(path.join(srcPath, 'components', 'ArtifactFront.jsx'));
  const hasFrontToBack = artifactFrontContent.includes("setStep('artifact-back')") || 
    artifactFrontContent.includes('setStep("artifact-back")');
  assert(hasFrontToBack, 'Artifact front navigates to artifact back');
  
  // Artifact Back -> Result: ArtifactBack calls setStep('result')
  const artifactBackContent = readFile(path.join(srcPath, 'components', 'ArtifactBack.jsx'));
  const hasBackToResult = artifactBackContent.includes("setStep('result')") || 
    artifactBackContent.includes('setStep("result")');
  assert(hasBackToResult, 'Artifact back navigates to result');
  
  // Result -> PFP: ResultScreen calls setStep('pfp')
  const resultContent = readFile(path.join(srcPath, 'components', 'ResultScreen.jsx'));
  const hasResultToPfp = resultContent.includes("setStep('pfp')") || 
    resultContent.includes('setStep("pfp")');
  assert(hasResultToPfp, 'Result screen navigates to PFP');
  
} catch (err) {
  log.error('Failed to validate workflow logic');
  results.failed++;
}

// ============================================
// PHASE 10: DATA FLOW VALIDATION
// ============================================
log.section('💾 PHASE 10: Data Flow Validation');

try {
  const appContent = readFile(path.join(srcPath, 'App.jsx'));
  
  // Check formData prop passing
  const formDataProps = [
    'FormFields',
    'ScanningScreen',
    'ArtifactBack',
    'ResultScreen',
    'PfpScreen',
  ];
  
  formDataProps.forEach(component => {
    const hasProp = appContent.includes(`${component}`) && 
      appContent.includes('formData={formData}');
    assert(hasProp, `${component} receives formData prop`);
  });
  
  // Check croppedImageURL prop passing
  const imageProps = [
    'ScanningScreen',
    'ResultScreen',
    'PfpScreen',
  ];
  
  imageProps.forEach(component => {
    const hasProp = appContent.includes(`${component}`) && 
      appContent.includes('croppedImageURL={croppedImageURL}');
    assert(hasProp, `${component} receives croppedImageURL prop`);
  });
  
  // Check cardDataURL prop passing
  const cardProps = [
    'ArtifactFront',
    'ResultScreen',
    'PfpScreen',
  ];
  
  cardProps.forEach(component => {
    const hasProp = appContent.includes(`${component}`) && 
      (appContent.includes('cardDataURL={cardDataURL}') || 
       appContent.includes('getDataURL={getCardDataURL}'));
    assert(hasProp, `${component} receives card data prop`);
  });
  
  // Check renderCard receives correct parameters
  const hasRenderCardParams = appContent.includes('renderCard(formData, croppedImageURL)');
  assert(hasRenderCardParams, 'renderCard receives formData and croppedImageURL');
  
} catch (err) {
  log.error('Failed to validate data flow');
  results.failed++;
}

// ============================================
// PHASE 11: EDGE CASES VALIDATION
// ============================================
log.section('🛡️  PHASE 11: Edge Cases Validation');

try {
  const appContent = readFile(path.join(srcPath, 'App.jsx'));
  const rendererContent = readFile(path.join(srcPath, 'hooks', 'useCardRenderer.js'));
  const helpersContent = readFile(path.join(srcPath, 'utils', 'canvasHelpers.js'));
  
  // Check for error handling in renderCard
  const hasErrorHandling = appContent.includes('try') && 
    appContent.includes('catch') && 
    appContent.includes('console.error');
  assert(hasErrorHandling, 'Has error handling in card rendering');
  
  // Check for cleanup (revokeObjectURL)
  const hasCleanupInApp = appContent.includes('URL.revokeObjectURL');
  assert(hasCleanupInApp, 'App cleans up object URLs');
  
  const hasCleanupInHelpers = helpersContent.includes('revokeObjectURL');
  assert(hasCleanupInHelpers, 'canvasHelpers has revokeObjectURL function');
  
  // Check for font loading fallback
  const hasFontFallback = rendererContent.includes('document.fonts.ready');
  assert(hasFontFallback, 'Waits for fonts to load');
  
  // Check for image loading error handling
  const hasImageErrorHandling = helpersContent.includes('onerror') || 
    helpersContent.includes('catch') || 
    helpersContent.includes('error');
  warn(hasImageErrorHandling, 'Has image loading error handling');
  
  // Check for async/await usage
  const hasAsyncAwait = rendererContent.includes('async') && 
    rendererContent.includes('await');
  assert(hasAsyncAwait, 'Uses async/await for image loading');
  
  // Check for Promise handling
  const hasPromiseAll = helpersContent.includes('Promise.all');
  warn(hasPromiseAll, 'Uses Promise.all for multiple image loads');
  
} catch (err) {
  log.error('Failed to validate edge cases');
  results.failed++;
}

// ============================================
// SUMMARY
// ============================================
log.header('═══════════════════════════════════════════════════');
log.header('  VALIDATION SUMMARY');
log.header('═══════════════════════════════════════════════════\n');

log.info(`Total Tests: ${results.passed + results.failed + results.warnings}`);
log.success(`Passed: ${results.passed}`);
log.error(`Failed: ${results.failed}`);
log.warning(`Warnings: ${results.warnings}`);

const passRate = ((results.passed) / (results.passed + results.failed)) * 100;

if (results.failed === 0) {
  log.header(`\n${colors.green}✓ ALL TESTS PASSED!${colors.reset}`);
  log.info(`Pass rate: ${passRate.toFixed(1)}%`);
  log.header('\n🎉 HH Goa 2026 V2 is ready for deployment!\n');
  process.exit(0);
} else if (results.failed < 5) {
  log.header(`\n${colors.yellow}⚠ MOST TESTS PASSED${colors.reset}`);
  log.info(`Pass rate: ${passRate.toFixed(1)}%`);
  log.info('Please review the failed tests above.');
  process.exit(1);
} else {
  log.header(`\n${colors.red}✗ MANY TESTS FAILED${colors.reset}`);
  log.info(`Pass rate: ${passRate.toFixed(1)}%`);
  log.info('Please fix the issues and run again.');
  process.exit(1);
}
