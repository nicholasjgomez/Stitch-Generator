import React, { useState, useEffect } from 'react';
import { ChevronRightIcon } from './Icons';

type Screen = 'upload' | 'editor' | 'settings' | 'privacyPolicy' | 'termsOfService';

interface SettingsScreenProps {
    onNavigate: (screen: Screen) => void;
}

const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  }, [key, value]);

  return [value, setValue];
};


const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const [newPatternAlerts, setNewPatternAlerts] = usePersistentState('settings:newPatternAlerts', true);
  const [promotions, setPromotions] = usePersistentState('settings:promotions', false);
  const [dataSharing, setDataSharing] = usePersistentState('settings:dataSharing', true);
  const [threadCount, setThreadCount] = usePersistentState('settings:threadCount', '14-count');

  return (
    <div className="flex flex-col space-y-8">
      <SettingsSection title="Notifications">
        <ToggleSetting
          label="New Pattern Alerts"
          description="Get notified when your pattern is ready."
          enabled={newPatternAlerts}
          setEnabled={setNewPatternAlerts}
        />
        <ToggleSetting
          label="Promotions"
          description="Receive special offers and updates."
          enabled={promotions}
          setEnabled={setPromotions}
        />
      </SettingsSection>

      <SettingsSection title="Preferences">
        <DropdownSetting
          label="Default Thread Count"
          description="Set the default fabric count for new projects."
          value={threadCount}
          onChange={e => setThreadCount(e.target.value)}
          options={['11-count', '14-count', '16-count', '18-count', '22-count', '28-count']}
        />
      </SettingsSection>
      
      <SettingsSection title="Privacy">
        <ToggleSetting
          label="Data Sharing"
          description="Allow anonymous usage data collection to help improve the app."
          enabled={dataSharing}
          setEnabled={setDataSharing}
        />
        <NavLink label="Privacy Policy" onClick={() => onNavigate('privacyPolicy')} />
        <NavLink label="Terms of Service" onClick={() => onNavigate('termsOfService')} />
      </SettingsSection>
    </div>
  );
};

// --- Reusable Sub-components ---

const SettingsSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
    <div className="flex flex-col space-y-2">{children}</div>
  </div>
);

interface ToggleSettingProps {
  label: string;
  description: string;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({ label, description, enabled, setEnabled }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
    <div className="flex-grow">
      <p className="font-semibold text-slate-800">{label}</p>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? 'bg-cyan-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

interface DropdownSettingProps {
  label: string;
  description: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}

const DropdownSetting: React.FC<DropdownSettingProps> = ({ label, description, value, onChange, options }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200">
    <div className="flex justify-between items-center">
      <p className="font-semibold text-slate-800 flex-grow">{label}</p>
      <select 
        value={value} 
        onChange={onChange}
        className="text-sm font-semibold border border-cyan-200 bg-cyan-50 text-cyan-700 rounded-md p-1.5 focus:ring-2 focus:ring-cyan-500"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
    <p className="text-sm text-slate-500 mt-1">{description}</p>
  </div>
);


const NavLink: React.FC<{ label: string, onClick: () => void }> = ({ label, onClick }) => (
    <button onClick={onClick} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center text-left w-full hover:bg-slate-50 transition-colors">
        <p className="font-semibold text-slate-800">{label}</p>
        <ChevronRightIcon className="text-slate-400" />
    </button>
);


export default SettingsScreen;