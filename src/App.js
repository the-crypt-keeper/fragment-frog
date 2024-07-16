import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [fragments, setFragments] = useState([]);
  const [selectedFragmentIndex, setSelectedFragmentIndex] = useState(0);
  const [mode, setMode] = useState('explore');
  const [currentFragmentText, setCurrentFragmentText] = useState(''); // For editing fragment text
  const [clipboard, setClipboard] = useState([]); // New state for clipboard
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
          if (e.ctrlKey) {
            e.preventDefault();
            if (selectedFragmentIndex > 0) {
              const newFragments = [...fragments];
              const temp = newFragments[selectedFragmentIndex];
              newFragments[selectedFragmentIndex] = newFragments[selectedFragmentIndex - 1];
              newFragments[selectedFragmentIndex - 1] = temp;
              setFragments(newFragments);
              setSelectedFragmentIndex(prevIndex => prevIndex - 1);
            }
          } else {
            setSelectedFragmentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          }
          break;
        case 'ArrowRight':
          if (e.ctrlKey) {
            e.preventDefault();
            if (selectedFragmentIndex < fragments.length - 1) {
              const newFragments = [...fragments];
              const temp = newFragments[selectedFragmentIndex];
              newFragments[selectedFragmentIndex] = newFragments[selectedFragmentIndex + 1];
              newFragments[selectedFragmentIndex + 1] = temp;
              setFragments(newFragments);
              setSelectedFragmentIndex(prevIndex => prevIndex + 1);
            }
          } else {
            setSelectedFragmentIndex((prevIndex) => (prevIndex < fragments.length ? prevIndex + 1 : prevIndex));
          }
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
        case 'x':
          e.preventDefault();
          if (selectedFragmentIndex < fragments.length) {
            const cutFragment = fragments[selectedFragmentIndex];
            setClipboard(prevClipboard => [...prevClipboard, cutFragment]);
            setFragments(fragments.filter((_, index) => index !== selectedFragmentIndex));
            setSelectedFragmentIndex(prevIndex => Math.min(prevIndex, fragments.length - 2));
          }
          break;
        case 'v':
          e.preventDefault();
          if (clipboard.length > 0) {
            const pastedFragment = clipboard[0];
            setClipboard(prevClipboard => prevClipboard.slice(1));
            const insertIndex = selectedFragmentIndex + 1;
            setFragments([...fragments.slice(0, insertIndex), pastedFragment, ...fragments.slice(insertIndex)]);
            setSelectedFragmentIndex(insertIndex);
          }
          break;
        default:
          break;
      }
    } else if (mode === 'edit' || mode === 'insert') {
      var startPos = e.target.selectionStart;
      var endPos = e.target.selectionEnd;
      console.log(startPos, endPos)

      if (e.key === 'Enter' && e.ctrlKey) {  
        // Insert a newline at startpos
        e.preventDefault();
        e.target.value = e.target.value.slice(0, startPos) + '\n' + e.target.value.slice(startPos)
        e.target.selectionStart = startPos + 1;
        e.target.selectionEnd = startPos + 1;
        setCurrentFragmentText(e.target.value);
      } else if (e.key === 'Enter' && !e.ctrlKey) {
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
      <div className="main-content">
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
      <div className="clipboard-panel">
        <h3>Clipboard</h3>
        {clipboard.map((item, index) => (
          <div key={index} className="clipboard-item">
            {item}
          </div>
        ))}
      </div>
    </div>
  </div>
  );
}

export default App;
