import React, { useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { ControlBar } from './components/ControlBar';
import { FragmentList } from './components/FragmentList';
import { SuggestionList } from './components/SuggestionList';
import { SettingsModal } from './components/SettingsModal';
import { SidePanel } from './components/SidePanel';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import './styles/layout.css';

const AppContent: React.FC = () => {
  const appRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  useKeyboardControls();

  // Ensure app container maintains focus for keyboard controls
  React.useEffect(() => {
    if (appRef.current) {
      appRef.current.focus();
    }
  }, []);

  return (
    <div className="app" ref={appRef} tabIndex={0}>
      <ControlBar onSettingsClick={() => setIsSettingsOpen(true)} />
      <div className="main-content">
        <div className="fragment-container">
          <FragmentList />
        </div>
        <SidePanel />
      </div>
      <SuggestionList />
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
