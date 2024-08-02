import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [shouldGenerateSuggestions, setShouldGenerateSuggestions] = useState(false);

  // editor and clipboard
  const appContainerRef = useRef(null);
  const fragmentListRef = useRef(null);
  const [fragments, setFragments] = useState([]);
  const [selectedFragmentIndex, setSelectedFragmentIndex] = useState(0);
  const [mode, setMode] = useState('explore');
  const [currentFragmentText, setCurrentFragmentText] = useState(''); // For editing fragment text
  const [clipboard, setClipboard] = useState([]); // New state for clipboard    
  
  // suggestions
  const abortControllerRef = useRef(null);
  const [model, setModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [suggestions, setSuggestions] = useState([]); // New state for suggestions
  const [insertedSuggestions, setInsertedSuggestions] = useState(new Set()); // New state for inserted suggestions
  const currentPromptRef = useRef('');
  const numSuggestions = 8;
  const [generationState, setGenerationState] = useState('IDLE');

  /* Always restore focus on App area when switching back to explore mode */
  useEffect(() => {
    if (appContainerRef.current && mode === 'explore') {
      appContainerRef.current.focus();
    }
  }, [mode, fragments, selectedFragmentIndex]);

  useEffect(() => {
    if (shouldGenerateSuggestions) {
      generateSuggestions();
      setShouldGenerateSuggestions(false);
    }
  }, [fragments, selectedFragmentIndex, shouldGenerateSuggestions]);

  const scrollToSelectedFragment = () => {
    if (fragmentListRef.current) {
      const selectedElement = fragmentListRef.current.querySelector('.fragment.selected');
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  useEffect(() => {
    scrollToSelectedFragment();
  }, [selectedFragmentIndex, fragments]);

  const getAvailableModels = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_OPENAI_API_ENDPOINT}/v1/models`, {
        headers: { 'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}` }
      });
      const data = await response.json();
      setAvailableModels(data.data);
      setModel(data.data[0].id);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };
  useEffect(() => { getAvailableModels(); }, [])

  const handleModelChange = (event) => {
    setModel(event.target.value);
  };

  const generateSuggestions = async (force = false) => {
    //clearTimeout(typingTimeoutRef.current);
    if (!model) return;

    // Compute prompt
    let prompt = fragments.slice(0, selectedFragmentIndex).join('');
    console.log('prompt:', prompt)

    // Reset animations and clear inserted suggestions
    // const suggestionElements = document.querySelectorAll('.suggestion-item');
    // suggestionElements.forEach(el => { el.classList.remove('fade-out'); });
    
    
    // let emptySuggestions = []
    // for (let i=0; i<numSuggestions; i++) { emptySuggestions.push('') }
    // setSuggestions(emptySuggestions);

    // if (prompt === generatePrompt && !force) return;
    // setGeneratePrompt(prompt);

    if (prompt.trim() === '') {
      setGenerationState('IDLE');
      return;
    }

    // Abort previous request if it's still ongoing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();
    currentPromptRef.current = prompt;
    setGenerationState('WAITING');

    try {
      const response = await fetch(`${process.env.REACT_APP_OPENAI_API_ENDPOINT}/v1/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          max_tokens: 50,
          temperature: 1.0,
          top_p: 0.9,
          n: numSuggestions,
          stop: ['.'],
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      const newSuggestions = Array(numSuggestions).fill('');
      const doneSuggestions = Array(numSuggestions).fill(false);
      let buffer = '';
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Store the last incomplete line
        var firstToken = false;

        lines.forEach(line => {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.choices && data.choices.length > 0) {
                const { index, text, finish_reason, stop_reason } = data.choices[0];

                if (!doneSuggestions[index]) {
                  if (text) {
                    newSuggestions[index] += text;
                    if (currentPromptRef.current === prompt) { 
                      setSuggestions([...newSuggestions]);
                      if (!firstToken) {
                        firstToken = true;
                        setInsertedSuggestions(new Set());
                        setGenerationState('BUSY');
                      }
                    }
                  }
                  if (finish_reason === "stop") {
                    //if (stop_reason != null) { newSuggestions[index] += stop_reason; }
                    doneSuggestions[index] = true;
                    if (currentPromptRef.current === prompt) { setSuggestions([...newSuggestions]); }
                  }
                }
              }
            } catch (e) {
              console.error('Error parsing JSON:', e, line);
            }
          }
        });
      }

      if (currentPromptRef.current === prompt) {
        setGenerationState('IDLE');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Error generating suggestions:', error);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (mode === 'explore') {
      switch (e.key) {
        case 'Tab':
          setShouldGenerateSuggestions(true);
          e.preventDefault();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':                                    
          e.preventDefault();
          const suggestionIndex = parseInt(e.key) - 1;
          if (suggestionIndex < suggestions.length && suggestions[suggestionIndex]) {
            const newFragment = suggestions[suggestionIndex];
            const insertIndex = selectedFragmentIndex + 1;
            setFragments([...fragments.slice(0, insertIndex), newFragment, ...fragments.slice(insertIndex)]);
            setSelectedFragmentIndex(insertIndex);
            setInsertedSuggestions(new Set([...insertedSuggestions, suggestionIndex]));

            if (!e.ctrlKey) {
              setShouldGenerateSuggestions(true);
            }
          }
          break;
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
        setTimeout(scrollToSelectedFragment, 0);
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
      <div className={`generation-indicator ${generationState.toLowerCase()}`}>
          {generationState}
      </div>
      <div className="model-selector">
        <label htmlFor="model-select">Select Model: </label>
        <select id="model-select" value={model} onChange={handleModelChange}>
          {availableModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.id}
            </option>
          ))}
        </select>
      </div>
      <div className="main-content">
        <div className="fragment-list" ref={fragmentListRef}>
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
        <div className='title'>FragmentFrog 🐸</div>        
        <h3 align='center'>{clipboard.length == 0 ? "Quick Help" : "ClipStack"}</h3>
        {clipboard.length == 0 ? 
          <div key="clip-empty">            
            left/right to select<br></br>
            space to edit<br></br>
            ctrl+left/right to move<br></br>
            d to delete<br></br>
            i to insert<br></br>
            x to cut (push)<br></br>
            v to paste (pop)<br></br>
            tab to (re-)suggest<br></br>
            [1-4] to accept and re-suggest<br></br>
            ctrl+[1-4] to accept without re-suggest<br></br>
            
          </div>
          :           
          clipboard.map((item, index) => (
          <div key={index} className="clipboard-item">
            {item}
          </div>
        ))}
      </div>
    </div>
    <div className="suggestions-panel">
      <div className="editor-suggestions">
        {suggestions.map((suggestion, index) => (
          <div key={index} className={`suggestion-item ${insertedSuggestions.has(index) ? 'fade-out' : ''}`}>
            <span className="suggestion-hint">{index+1}</span>
            {suggestion ? suggestion : "[please wait]"}
          </div>
        ))}
      </div>
    </div>
  </div>
  );
}

export default App;
