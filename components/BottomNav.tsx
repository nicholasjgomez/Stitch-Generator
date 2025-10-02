import React from 'react';
import { UploadIcon, MyPatternsIcon, SettingsIcon } from './Icons';

interface BottomNavProps {
  activeScreen: string;
  onNavigate: (screen: 'upload' | 'settings' | 'myPatterns') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  const isUploadActive = ['upload', 'editor'].includes(activeScreen);

  return (
    <nav className="sticky bottom-0 grid grid-cols-3 gap-4 p-2 bg-white/80 backdrop-blur-sm border-t border-slate-200">
      <NavItem
        icon={<UploadIcon active={isUploadActive} />}
        label="Upload"
        active={isUploadActive}
        onClick={() => onNavigate('upload')}
      />
      <NavItem
        icon={<MyPatternsIcon active={activeScreen === 'myPatterns'}/>}
        label="My Patterns"
        active={activeScreen === 'myPatterns'}
        onClick={() => onNavigate('myPatterns')}
      />
      <NavItem
        icon={<SettingsIcon active={activeScreen === 'settings'} />}
        label="Settings"
        active={activeScreen === 'settings'}
        onClick={() => onNavigate('settings')}
      />
    </nav>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false, onClick }) => {
  const textColor = active ? 'text-sky-500' : 'text-slate-500';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors hover:bg-sky-50 ${active ? 'bg-sky-100/50' : ''}`}
    >
      <div className={`w-6 h-6 mb-1 ${textColor}`}>{icon}</div>
      <span className={`text-xs font-semibold ${textColor}`}>{label}</span>
    </button>
  );
};

export default BottomNav;
