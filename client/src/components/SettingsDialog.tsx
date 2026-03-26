import React, { useState } from 'react';
import Modal from './Modal';
import { Settings } from '../types';

interface Props {
  settings: Settings;
  onSave: (data: Partial<Settings>) => void;
  onClose: () => void;
}

export default function SettingsDialog({ settings, onSave, onClose }: Props) {
  const [bgColor, setBgColor] = useState(settings.bg_color || '#f0f2f5');
  const [layoutMode, setLayoutMode] = useState(settings.layout_mode || 'row');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ bg_color: bgColor, layout_mode: layoutMode });
  };

  return (
    <Modal onClose={onClose}>
      <h2>Desktop Settings</h2>
      <form onSubmit={handleSubmit}>
        <label>Background Color</label>
        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
        <label>Layout Mode</label>
        <select value={layoutMode} onChange={(e) => setLayoutMode(e.target.value as 'row' | 'column')}>
          <option value="row">Rows (groups stack vertically)</option>
          <option value="column">Columns (groups sit side by side)</option>
        </select>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}
