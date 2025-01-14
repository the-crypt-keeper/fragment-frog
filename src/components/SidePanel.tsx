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
        {Object.entries(modelCounts).map(([modelId, count]) => {
          const model = models.find(m => m.id === modelId);
          const label = modelId === 'Human' ? 'Human' : (model?.model || modelId);
          return (
            <div key={modelId} className="histogram-bar">
              <div className="bar-label">{label}</div>
              <div 
                className="bar" 
                style={{
                  width: `${(count / maxCount) * 100}%`,
                  backgroundColor: model?.color || '#000000'
                }}
              >
                <span className="bar-value">{count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
