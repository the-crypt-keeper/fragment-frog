import React from 'react';
import './SidePanel.css';

export const SidePanel: React.FC = () => {
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
    </div>
  );
};
