import React, { useState } from 'react';
import Modal from './Modal';
import { Group } from '../types';

interface Props {
  group?: Group | null;
  onSave: (data: { title: string; color: string }) => void;
  onClose: () => void;
}

export default function GroupDialog({ group, onSave, onClose }: Props) {
  const [title, setTitle] = useState(group?.title || '');
  const [color, setColor] = useState(group?.color || '#e0e7ff');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title: title.trim(), color });
  };

  return (
    <Modal onClose={onClose}>
      <h2>{group ? 'Edit Group' : 'Add Group'}</h2>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Work" autoFocus />
        <label>Background Tint</label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}
