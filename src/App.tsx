import React, { useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { ControlBar } from './components/Controls/ControlBar';
import { FragmentList } from './components/Editor/FragmentList/FragmentList';
import { SuggestionList } from './components/Controls/SuggestionList';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import './styles/layout.css';

const AppContent: React.FC = () => {
  const appRef = useRef<HTMLDivElement>(null);
  useKeyboardControls();

  // Ensure app container maintains focus for keyboard controls
  React.useEffect(() => {
    if (appRef.current) {
      appRef.current.focus();
    }
  }, []);

  return (
    <div className="app" ref={appRef} tabIndex={0}>
      <ControlBar />
      <div className="main-content">
        <div className="fragment-container">
          <FragmentList />
        </div>
        <div className="clipstack-panel">
          <div className="title">FragmentFrog 🐸</div>
          <h3>Quick Help</h3>
          <div className="help-text">
            left/right to select<br/>
            space to edit<br/>
            ctrl+left/right to move<br/>
            d to delete<br/>
            i to insert<br/>
            tab to (re-)suggest<br/>
            ctrl+[1-8] to accept<br/>
            [1-8] to accept and re-suggest
          </div>
        </div>
      </div>
      <SuggestionList />
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