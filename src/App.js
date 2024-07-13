import React, { useState } from 'react';
import './App.css';

function App() {
  const [fragments, setFragments] = useState([]);
  const [selectedFragmentIndex, setSelectedFragmentIndex] = useState(0);
  const [mode, setMode] = useState('explore');
  const [currentFragmentText, setCurrentFragmentText] = useState(''); // For editing fragment text

  const handleKeyDown = (e) => {
    if (mode === 'explore') {
      switch (e.key) {
        case 'ArrowLeft':
          setSelectedFragmentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          break;
        case 'ArrowRight':
          setSelectedFragmentIndex((prevIndex) => (prevIndex < fragments.length ? prevIndex + 1 : prevIndex));
          break;
        case ' ':
          if (selectedFragmentIndex === fragments.length) {
            setCurrentFragmentText('');
          } else {
            setCurrentFragmentText(fragments[selectedFragmentIndex]);
          }
          setMode('edit');
          break;
        default:
          break;
      }
    } else if (mode === 'edit') {
      if (e.key === 'Enter' && !e.ctrlKey) {
        if (selectedFragmentIndex === fragments.length) {
          // Adding new fragment
          if (currentFragmentText.trim()) {
            setFragments([...fragments, currentFragmentText]);
            setSelectedFragmentIndex(fragments.length + 1);
          }
        } else {
          // Editing existing fragment
          const updatedFragments = fragments.map((fragment, index) =>
            index === selectedFragmentIndex ? currentFragmentText : fragment
          );
          setFragments(updatedFragments);
        }
        setMode('explore');
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setMode('explore');
        setCurrentFragmentText('');
        e.preventDefault();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        setCurrentFragmentText((prevText) => prevText + '\n');
        e.preventDefault();
      }
    }
  };

  return (
    <div className="App" onKeyDown={handleKeyDown} tabIndex="0">
      <div className="fragment-list">
        {fragments.flatMap((fragment, index) => (
          <React.Fragment key={index}>
            {fragment.split('\n').map((line, i) => (
              <span
                key={i}
                className={`fragment ${selectedFragmentIndex === index ? 'selected' : ''}`}
              >
                {line}
                {i < fragment.split('\n').length - 1 && <br />}
              </span>
            ))}
          </React.Fragment>
        ))}
        <span
          key='new'
          className={`fragment new ${selectedFragmentIndex === fragments.length ? 'selected' : ''}`}
        >
          &lt;new&gt;
        </span>        
        {/* <span
          className={`fragment new ${selectedFragmentIndex === fragments.length ? 'selected' : ''}`}
        >
          {selectedFragmentIndex === fragments.length && mode === 'edit' ? (
            <textarea
              value={currentFragmentText}
              onChange={(e) => setCurrentFragmentText(e.target.value)}
              autoFocus
            />
          ) : (
            '<new>'
          )}
        </span> */}
      </div>
    </div>
  );

}

export default App;