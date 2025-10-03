import React, { useState } from 'react';
import UploadScreen from './components/UploadScreen';
import EditorScreen from './components/EditorScreen';
import SettingsScreen from './components/SettingsScreen';
import PrivacyPolicyScreen from './components/PrivacyPolicyScreen';
import TermsOfServiceScreen from './components/TermsOfServiceScreen';
import AboutScreen from './components/AboutScreen';
import ContactScreen from './components/ContactScreen';
import { BackIcon } from './components/Icons';
import { Logo } from './components/Logo';
import HowToVideo from './components/HowToVideo';

type Screen = 'upload' | 'editor' | 'settings' | 'privacyPolicy' | 'termsOfService' | 'about' | 'contact';

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

  const handleNavigate = (targetScreen: Screen) => {
    if (targetScreen === 'upload') {
      if (screen === 'editor') {
        // If already on the editor, confirm to start over
        if (window.confirm('Are you sure you want to start a new pattern? Your current edits will be lost.')) {
          setImageFile(null);
          navigateTo('upload');
        }
      } else if (imageFile) {
        // If not on editor but a file exists, go back to the editor
        navigateTo('editor');
      } else {
        // No file exists, go to the upload screen
        navigateTo('upload');
      }
    } else {
      navigateTo(targetScreen);
    }
  };

  const renderHeader = () => {
    const isGeneratorActive = screen === 'upload' || screen === 'editor';
    const isSettingsActive = ['settings', 'privacyPolicy', 'termsOfService'].includes(screen);
    const isAboutActive = screen === 'about';
    const isContactActive = screen === 'contact';

    return (
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate('upload')}>
            <Logo className="w-8 h-8 text-slate-800" />
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">Cross-Stitch Genie</h1>
          </div>
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => handleNavigate('upload')}
              className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                isGeneratorActive
                  ? 'bg-sky-100 text-sky-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              Generator
            </button>
            <button
              onClick={() => handleNavigate('about')}
              className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                isAboutActive
                  ? 'bg-sky-100 text-sky-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              About
            </button>
            <button
              onClick={() => handleNavigate('contact')}
              className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                isContactActive
                  ? 'bg-sky-100 text-sky-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              Contact
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
     if (screen === 'editor') title = 'Customize Your Pattern';
     if (screen === 'settings') title = 'Settings';
     if (screen === 'privacyPolicy') title = 'Privacy Policy';
     if (screen === 'termsOfService') title = 'Terms of Service';
     if (screen === 'about') title = 'About Cross-Stitch Genie';
     if (screen === 'contact') title = 'Get In Touch';


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
    // Sub-screens that don't need persistent state can be swapped as before.
    if (screen === 'privacyPolicy') {
      return <PrivacyPolicyScreen />;
    }
    if (screen === 'termsOfService') {
      return <TermsOfServiceScreen />;
    }

    // Main screens are kept in the DOM to preserve their state by hiding them.
    return (
      <>
        <div className={screen === 'upload' ? '' : 'hidden'}>
          <UploadScreen onImageUpload={handleImageUpload} />
        </div>
        
        {imageFile && (
          <div className={screen === 'editor' ? '' : 'hidden'}>
            <EditorScreen imageFile={imageFile} />
          </div>
        )}

        <div className={screen === 'settings' ? '' : 'hidden'}>
          <SettingsScreen onNavigate={navigateTo} />
        </div>
        
        <div className={screen === 'about' ? '' : 'hidden'}>
          <AboutScreen />
        </div>

        <div className={screen === 'contact' ? '' : 'hidden'}>
          <ContactScreen />
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen font-sans antialiased text-slate-800 bg-slate-100">
      {renderHeader()}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderSubHeader()}
        {renderScreen()}
      </main>
      <section className="py-12 sm:py-20 bg-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HowToVideo />
        </div>
      </section>
    </div>
  );
};

export default App;