import React from 'react';
import './SidePanel.css';
import { useAppSelector } from '../hooks/redux';
import { RootState } from '../store';

export const SidePanel: React.FC = () => {
  const fragments = useAppSelector((state: RootState) => state.editor.fragments);
  const models = useAppSelector((state: RootState) => state.llm.models);

  const modelCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    fragments.forEach(fragment => {
      if (fragment.modelId) {
        counts[fragment.modelId] = (counts[fragment.modelId] || 0) + 1;
      }
    });
    return counts;
  }, [fragments]);

  const maxCount = Math.max(...Object.values(modelCounts), 1);
  return (
    <div className="clipstack-panel">
      <div className="title">FragmentFrog 🐸</div>
      <h3>Quick Help</h3>
      <div className="help-text">
        left/right to select<br/>
        space to edit<br/>
        ctrl+left/right to move<br/>
        d to delete<br/>
        i to insert<br/>
        b to section break<br/>
        tab to (re-)suggest<br/>
        ctrl+[1-0] to accept<br/>
        [1-0] to accept and re-suggest
      </div>
      
      <h3>Model Usage</h3>
      <div className="histogram">
        <div className="histogram-bar">
          <div className="bar-label">Human</div>
          <div 
            className="bar" 
            style={{
              width: `${((modelCounts['human'] || 0) / maxCount) * 100}%`,
              backgroundColor: '#000000'
            }}
          >
            <span className="bar-value">{modelCounts['human'] || 0}</span>
          </div>
        </div>
        {models.map(model => (
          <div key={model.id} className="histogram-bar">
            <div className="bar-label">{model.model}</div>
            <div 
              className="bar" 
              style={{
                width: `${((modelCounts[model.id] || 0) / maxCount) * 100}%`,
                backgroundColor: model.color
              }}
            >
              <span className="bar-value">{modelCounts[model.id] || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
