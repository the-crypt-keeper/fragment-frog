import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [fragments, setFragments] = useState([]);
  const [selectedFragmentIndex, setSelectedFragmentIndex] = useState(0);
  const [mode, setMode] = useState('explore');
  const [currentFragmentText, setCurrentFragmentText] = useState(''); // For editing fragment text
  const appContainerRef = useRef(null);

  /* Always restore focus on App area when switching back to explore mode */
  useEffect(() => {
    if (appContainerRef.current && mode === 'explore') {
      appContainerRef.current.focus();
    }
  }, [mode, fragments, selectedFragmentIndex]);

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
          e.preventDefault();
          if (selectedFragmentIndex === fragments.length) {
            setCurrentFragmentText('');
          } else {
            setCurrentFragmentText(fragments[selectedFragmentIndex]);
          }
          setMode('edit');
          break;
        case 'd':
          e.preventDefault();
          setFragments(fragments.filter((_, index) => index !== selectedFragmentIndex));
          break;
        case 'i':
          e.preventDefault();
          if (selectedFragmentIndex < fragments.length) {
            let nextFragmentIndex = selectedFragmentIndex + 1;
            setFragments([...fragments.slice(0, nextFragmentIndex), '', ...fragments.slice(nextFragmentIndex)]);
            setSelectedFragmentIndex(nextFragmentIndex);
          }
          setCurrentFragmentText('');
          setMode('insert');
          break;
        default:
          break;
      }
    } else if (mode === 'edit' || mode === 'insert') {
      if (e.key === 'Enter' && e.ctrlKey) {
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
        if (mode === 'insert') {
          setFragments(fragments.filter((_, index) => index !== selectedFragmentIndex));
        }
      }
    }
  };

  return (
    <div className="App" onKeyDown={handleKeyDown} tabIndex="0" ref={appContainerRef}>
      <div className="fragment-list">
        {fragments.flatMap((fragment, index) => {
          if (selectedFragmentIndex === index && mode !== 'explore') {
            return (
              <span key={index} className={`fragment ${selectedFragmentIndex === index ? 'selected' : ''}`}>              
              <textarea
                value={currentFragmentText}
                onChange={(e) => setCurrentFragmentText(e.target.value)}
                autoFocus
              />
              </span>
            )
          }
          return (
            <React.Fragment key={index}>
              {fragment.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  <span className={`fragment ${selectedFragmentIndex === index ? 'selected' : ''}`}>
                    {line}
                  </span>
                  {(i !== fragment.split('\n').length - 1 || line === '') && (
                    <span className='break'>
                      <br></br>
                    </span>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          );
        })}
        <span
          key='new'
          className={`fragment new ${selectedFragmentIndex === fragments.length ? 'selected' : ''}`}
        >
          { (selectedFragmentIndex === fragments.length && mode !== 'explore') ?
            (
              <textarea
                value={currentFragmentText}
                onChange={(e) => setCurrentFragmentText(e.target.value)}
                autoFocus
              />
            ) : (
             "<new>"
            )
          }
        </span>        
      </div>
    </div>
  );

}

export default App;