import React, { useState } from 'react';
import UploadScreen from './components/UploadScreen';
import EditorScreen from './components/EditorScreen';
import SettingsScreen from './components/SettingsScreen';
import PrivacyPolicyScreen from './components/PrivacyPolicyScreen';
import TermsOfServiceScreen from './components/TermsOfServiceScreen';
import { BackIcon } from './components/Icons';

type Screen = 'upload' | 'editor' | 'settings' | 'privacyPolicy' | 'termsOfService';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previousScreen, setPreviousScreen] = useState<Screen>('upload');

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setPreviousScreen(screen);
    setScreen('editor');
  };

  const navigateTo = (targetScreen: Screen) => {
    setPreviousScreen(screen);
    setScreen(targetScreen);
  };

  const handleBack = () => {
    setScreen(previousScreen);
  };

  const handleNavigate = (targetScreen: 'upload' | 'settings') => {
    if (targetScreen === 'upload' && screen === 'editor') {
      if (window.confirm('Are you sure you want to start a new pattern? Your current edits will be lost.')) {
        setImageFile(null);
        setScreen('upload');
      }
    } else if (targetScreen === 'upload') {
        setImageFile(null);
        setScreen('upload');
    }
    else {
      navigateTo(targetScreen);
    }
  };

  const renderHeader = () => {
    const isNewPatternActive = screen === 'upload' || screen === 'editor';
    const isSettingsActive = ['settings', 'privacyPolicy', 'termsOfService'].includes(screen);

    return (
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">Cross-Stitch Genie</h1>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => handleNavigate('upload')}
              className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                isNewPatternActive
                  ? 'bg-sky-100 text-sky-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              New Pattern
            </button>
            <button
              onClick={() => handleNavigate('settings')}
              className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                isSettingsActive
                  ? 'bg-sky-100 text-sky-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
      </header>
    );
  };
  
  const renderSubHeader = () => {
     let title = 'Create a New Pattern';
     if (screen === 'editor') title = 'Edit Your Pattern';
     if (screen === 'settings') title = 'Settings';
     if (screen === 'privacyPolicy') title = 'Privacy Policy';
     if (screen === 'termsOfService') title = 'Terms of Service';

     const showBackButton = ['privacyPolicy', 'termsOfService'].includes(screen);
     
     if (screen === 'upload') return null;

     return (
        <div className="py-4 border-b border-slate-200 mb-8 relative flex items-center justify-center">
             {showBackButton && (
              <button onClick={handleBack} className="text-slate-500 hover:text-slate-800 absolute left-0 p-2 rounded-full hover:bg-slate-200">
                <BackIcon />
              </button>
            )}
            <h2 className="text-2xl font-semibold text-slate-800 text-center">{title}</h2>
        </div>
     );
  };

  const renderScreen = () => {
    switch (screen) {
      case 'upload':
        return <UploadScreen onImageUpload={handleImageUpload} />;
      case 'editor':
        if (imageFile) return <EditorScreen imageFile={imageFile} />;
        handleNavigate('upload');
        return null;
      case 'settings':
        return <SettingsScreen onNavigate={navigateTo} />;
      case 'privacyPolicy':
        return <PrivacyPolicyScreen />;
      case 'termsOfService':
        return <TermsOfServiceScreen />;
      default:
        return <UploadScreen onImageUpload={handleImageUpload} />;
    }
  };

  return (
    <div className="min-h-screen font-sans antialiased text-slate-800 bg-slate-100">
      {renderHeader()}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderSubHeader()}
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;