import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import SettingsModal from './SettingsModal';

function App() {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const fileInputRef = useRef(null);
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
  const [primaryModel, setPrimaryModel] = useState('');
  const [secondaryModel, setSecondaryModel] = useState('');
  const [primaryModelMode, setPrimaryModelMode] = useState('CMP');
  const [secondaryModelMode, setSecondaryModelMode] = useState('CMP');
  const [availableModels, setAvailableModels] = useState([]);
  const [suggestions, setSuggestions] = useState([]); // New state for suggestions
  const [insertedSuggestions, setInsertedSuggestions] = useState(new Set()); // New state for inserted suggestions
  const currentPromptRef = useRef('');
  const numSuggestions = 8;
  const [generationState, setGenerationState] = useState('IDLE');

  const [systemPrompt, setSystemPrompt] = useState('You are a creative writing assistant. Continue the story provided by the user.');
  const [temperatures, setTemperatures] = useState({
    primary: 1.0,
    secondary: 1.0
  });
  const [stopAtPeriod, setStopAtPeriod] = useState({
    primary: true,
    secondary: true
  });

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
      if (primaryModel === '') {
        setPrimaryModel(data.data[0].id);
      }
      if (secondaryModel === '') {
        setSecondaryModel(data.data.length > 1 ? data.data[1].id : data.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };
  useEffect(() => { getAvailableModels(); }, []);

  const handleReloadModels = () => {
    getAvailableModels();
  };

  const handleExport = () => {
    const state = {
      fragments,
      clipboard,
      systemPrompt,
      temperatures
    };
    const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = "fragmentfrog_export.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    fileInputRef.current.click();
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all fragments? This action cannot be undone.')) {
      setFragments([]);
      setSelectedFragmentIndex(0);
      setClipboard([]);
      setSuggestions([]);
      setInsertedSuggestions(new Set());
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const state = JSON.parse(e.target.result);
          setFragments(state.fragments);
          setClipboard(state.clipboard);
          if (state.systemPrompt) {
            setSystemPrompt(state.systemPrompt);
          }
          if (state.temperatures) {
            setTemperatures(state.temperatures);
          }
          setSuggestions([]);
          setInsertedSuggestions(new Set());
        } catch (error) {
          console.error('Error parsing imported file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePrimaryModelChange = (event) => {
    setPrimaryModel(event.target.value);
  };

  const handleSecondaryModelChange = (event) => {
    setSecondaryModel(event.target.value);
  };

  const togglePrimaryModelMode = () => {
    setPrimaryModelMode(prevMode => prevMode === 'CMP' ? 'INS' : 'CMP');
  };

  const toggleSecondaryModelMode = () => {
    setSecondaryModelMode(prevMode => prevMode === 'CMP' ? 'INS' : 'CMP');
  };

  const generateSuggestions = async (force = false) => {
    if (!primaryModel || !secondaryModel) return;

    let prompt = fragments.slice(0, selectedFragmentIndex).join('');
    console.log('prompt:', prompt)

    if (prompt.trim() === '') {
      setGenerationState('IDLE');
      return;
    }

    let primaryPayload, secondaryPayload;

    if (primaryModelMode === 'CMP') {
      primaryPayload = {
        model: primaryModel,
        prompt: `### Instruction: ${systemPrompt}\n\n### Response:${prompt}`,
        max_tokens: 50,
        temperature: temperatures.primary,
        top_p: 0.9,
        n: 4,
        stop: stopAtPeriod.primary ? ['.'] : null,
        stream: true,
      };
    } else {
      primaryPayload = {
        model: primaryModel,
        messages: [
          {'role': 'system', 'content': systemPrompt},
          {'role': 'user', 'content': prompt}
        ],
        max_tokens: 50,
        temperature: temperatures.primary,
        top_p: 0.9,
        n: 4,
        stop: ['.'],
        stream: true,
      };
    }

    if (secondaryModelMode === 'CMP') {
      secondaryPayload = {
        model: secondaryModel,
        prompt: `### Instruction: ${systemPrompt}\n\n### Response:${prompt}`,
        max_tokens: 50,
        temperature: temperatures.secondary,
        top_p: 0.9,
        n: 4,
        stop: stopAtPeriod.secondary ? ['.'] : null,
        stream: true,
      };
    } else {
      secondaryPayload = {
        model: secondaryModel,
        messages: [
          {'role': 'system', 'content': systemPrompt},
          {'role': 'user', 'content': prompt}
        ],
        max_tokens: 60,
        temperature: temperatures.secondary,
        top_p: 0.9,
        n: 4,
        stop: ['.'],
        stream: true,
      };
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    currentPromptRef.current = prompt;
    setGenerationState('WAITING');

    try {
      const [primaryResponse, secondaryResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_OPENAI_API_ENDPOINT}/${primaryModelMode === 'CMP' ? 'v1/completions' : 'v1/chat/completions'}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
          },
          body: JSON.stringify(primaryPayload),
          signal: abortControllerRef.current.signal,
        }),
        fetch(`${process.env.REACT_APP_OPENAI_API_ENDPOINT}/${secondaryModelMode === 'CMP' ? 'v1/completions' : 'v1/chat/completions'}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
          },
          body: JSON.stringify(secondaryPayload),
          signal: abortControllerRef.current.signal,
        })
      ]);

      if (!primaryResponse.ok || !secondaryResponse.ok) {
        throw new Error(`HTTP error! status: ${primaryResponse.status} ${secondaryResponse.status}`);
      }

      const primaryReader = primaryResponse.body.getReader();
      const secondaryReader = secondaryResponse.body.getReader();
      const decoder = new TextDecoder('utf-8');
      const newSuggestions = Array(numSuggestions).fill('');
      const doneSuggestions = Array(numSuggestions).fill(false);
      let primaryBuffer = '';
      let secondaryBuffer = '';
      let firstToken = false;

      const processStream = async (reader, startIndex, buffer) => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value);
          console.log(buffer);
          const lines = buffer.split('\n');
          buffer = lines.pop();

          lines.forEach(line => {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.choices && data.choices.length > 0) {
                  let { index, text, finish_reason, stop_reason } = data.choices[0];
                  if (data.choices[0].delta) {
                    text = data.choices[0].delta.content;
                    if (finish_reason == 'stop') { text = '.'; }
                  }
                  if (stop_reason == '.') { text = '.'; }
                     
                  const suggestionIndex = startIndex + index;
                  if (!doneSuggestions[suggestionIndex]) {
                    if (text) {
                      // Check if prompt ends with '.' and we're in instruct mode (INS)
                      if (prompt.trim().endsWith('.') && 
                          ((startIndex === 0 && primaryModelMode === 'INS') || 
                           (startIndex === 4 && secondaryModelMode === 'INS'))) {
                        // Prepend space only for the first token of each suggestion
                        if (newSuggestions[suggestionIndex] === '') {
                          text = ' ' + text;
                        }
                      }
                      newSuggestions[suggestionIndex] += text;
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
                      doneSuggestions[suggestionIndex] = true;
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
        return buffer;
      };

      await Promise.all([
        processStream(primaryReader, 0, primaryBuffer),
        processStream(secondaryReader, 4, secondaryBuffer)
      ]);

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

  const handleKeyDown = useCallback((e) => {
    if (isSettingsModalOpen) return;
    
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
  });

  const restoreFocus = useCallback(() => {
    if (appContainerRef.current) {
      appContainerRef.current.focus();
    }
  }, []);

  return (
    <div className="App" onKeyDown={handleKeyDown} tabIndex="0" ref={appContainerRef}>
      <div className={`generation-indicator ${generationState.toLowerCase()}`}>
          {generationState}
      </div>
      <div className="model-selector">
        <div className="model-select-container primary">
          <label htmlFor="primary-model-select">Primary Model: </label>
          <select id="primary-model-select" value={primaryModel} onChange={handlePrimaryModelChange} className="model-select primary">
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.id}
              </option>
            ))}
          </select>
          <button className="small-button mode-toggle" onClick={togglePrimaryModelMode}>{primaryModelMode}</button>
        </div>
        <div className="model-select-container secondary">
          <label htmlFor="secondary-model-select">Secondary Model: </label>
          <select id="secondary-model-select" value={secondaryModel} onChange={handleSecondaryModelChange} className="model-select secondary">
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.id}
              </option>
            ))}
          </select>
          <button className="small-button mode-toggle" onClick={toggleSecondaryModelMode}>{secondaryModelMode}</button>
        </div>
        <button className="small-button reload-button" onClick={handleReloadModels}>↻</button>
        <button className="small-button" onClick={handleExport}>⬇️</button>
        <button className="small-button" onClick={handleImport}>⬆️</button>
        <button className="small-button" onClick={handleClear}>💣</button>
        <button className="small-button" onClick={() => setIsSettingsModalOpen(true)}>⚙️</button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          accept=".json"
        />
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
                    {line == '---' ? <hr /> : line == '' ? '↵' : line}
                  </span>
                  {(line === '') && (
                    <span className='break'>
                      <br />
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
            ctrl+[1-8] to accept<br></br>
            [1-8] to accept and re-suggest<br></br>
            
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
          <div 
            key={index} 
            className={`suggestion-item ${index < 4 ? 'primary' : 'secondary'} ${insertedSuggestions.has(index) ? 'fade-out' : ''}`}
          >
            <span className="suggestion-hint">{index+1}</span>
            {suggestion ? suggestion.replaceAll('\n','↵') : "[please wait]"}
          </div>
        ))}
      </div>
    </div>
    <SettingsModal
      isOpen={isSettingsModalOpen}
      onClose={() => {
        setIsSettingsModalOpen(false);
        restoreFocus();
      }}
      primaryModel={primaryModel}
      secondaryModel={secondaryModel}
      onSave={(settings) => {
        setSystemPrompt(settings.systemPrompt);
        setTemperatures({
          primary: settings.primaryTemperature,
          secondary: settings.secondaryTemperature
        });
        setStopAtPeriod({
          primary: settings.primaryStop,
          secondary: settings.secondaryStop
        });
        setIsSettingsModalOpen(false);
        restoreFocus();
      }}
    />
  </div>
  );
}

export default App;
