import React, { useState } from 'react';
import UploadScreen from './components/UploadScreen';
import EditorScreen from './components/EditorScreen';
import BottomNav from './components/BottomNav';
import SettingsScreen from './components/SettingsScreen';
import PrivacyPolicyScreen from './components/PrivacyPolicyScreen';
import TermsOfServiceScreen from './components/TermsOfServiceScreen';
import MyPatternsScreen from './components/MyPatternsScreen';
import { CloseIcon, BackIcon } from './components/Icons';
import { SavedPattern } from './types';

type Screen = 'upload' | 'editor' | 'settings' | 'privacyPolicy' | 'termsOfService' | 'myPatterns';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loadedPattern, setLoadedPattern] = useState<SavedPattern | null>(null);
  const [previousScreen, setPreviousScreen] = useState<Screen>('upload');

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setLoadedPattern(null);
    setPreviousScreen(screen);
    setScreen('editor');
  };

  const navigateTo = (targetScreen: Screen) => {
    setPreviousScreen(screen);
    setScreen(targetScreen);
  }

  const handleCloseEditor = () => {
    setImageFile(null);
    setLoadedPattern(null);
    setScreen('upload');
  };
  
  const handleLoadPattern = (pattern: SavedPattern) => {
    setImageFile(null);
    setLoadedPattern(pattern);
    navigateTo('editor');
  };

  const handleBack = () => {
    setScreen(previousScreen);
  }

  const handleNavigate = (targetScreen: 'upload' | 'settings' | 'myPatterns') => {
    if (targetScreen === 'upload') {
      handleCloseEditor();
    } else {
      navigateTo(targetScreen);
    }
  };

  const renderHeader = () => {
    let title = 'New Pattern';
    if (screen === 'editor') title = 'Edit Pattern';
    if (screen === 'settings') title = 'Settings';
    if (screen === 'myPatterns') title = 'My Patterns';
    if (screen === 'privacyPolicy') title = 'Privacy Policy';
    if (screen === 'termsOfService') title = 'Terms of Service';
    
    const showBackButton = ['settings', 'myPatterns', 'privacyPolicy', 'termsOfService'].includes(screen);
    const showCloseButton = screen === 'editor';

    return (
      <header className="sticky top-0 z-10 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 relative">
         {showBackButton && (
          <button onClick={handleBack} className="text-slate-500 hover:text-slate-800 absolute left-4">
            <BackIcon />
          </button>
        )}
        <h1 className="text-lg font-semibold text-slate-800 text-center">{title}</h1>
        {showCloseButton && (
          <button onClick={handleCloseEditor} className="text-slate-500 hover:text-slate-800 absolute right-4">
            <CloseIcon />
          </button>
        )}
      </header>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case 'upload':
        return <UploadScreen onImageUpload={handleImageUpload} />;
      case 'editor':
        if (imageFile) return <EditorScreen imageFile={imageFile} />;
        if (loadedPattern) return <EditorScreen savedPattern={loadedPattern} />;
        return <UploadScreen onImageUpload={handleImageUpload} />;
      case 'settings':
        return <SettingsScreen onNavigate={navigateTo} />;
      case 'myPatterns':
        return <MyPatternsScreen onLoadPattern={handleLoadPattern} />;
      case 'privacyPolicy':
        return <PrivacyPolicyScreen />;
      case 'termsOfService':
        return <TermsOfServiceScreen />;
      default:
        return <UploadScreen onImageUpload={handleImageUpload} />;
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans antialiased text-slate-800 bg-slate-50 max-w-md mx-auto shadow-2xl">
      {renderHeader()}
      <main className="flex-grow overflow-y-auto p-6">
        {renderScreen()}
      </main>
      <BottomNav activeScreen={screen} onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
