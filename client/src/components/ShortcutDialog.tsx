import React, { useState } from 'react';
import Modal from './Modal';
import { Shortcut, Group } from '../types';

interface Props {
  shortcut?: Shortcut | null;
  groups: Group[];
  defaultGroupId?: number | null;
  onSave: (data: { title: string; url: string; group_id: number | null }) => void;
  onClose: () => void;
}

export default function ShortcutDialog({ shortcut, groups, defaultGroupId, onSave, onClose }: Props) {
  const [title, setTitle] = useState(shortcut?.title || '');
  const [url, setUrl] = useState(shortcut?.url || '');
  const [groupId, setGroupId] = useState<number | null>(shortcut?.group_id ?? defaultGroupId ?? (groups.length > 0 ? groups[0].id : null));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;
    onSave({ title: title.trim(), url: finalUrl, group_id: groupId });
  };

  return (
    <Modal onClose={onClose}>
      <h2>{shortcut ? 'Edit Shortcut' : 'Add Shortcut'}</h2>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. GitHub" autoFocus />
        <label>URL</label>
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="e.g. github.com" />
        <label>Group</label>
        <select value={groupId ?? ''} onChange={(e) => setGroupId(e.target.value ? Number(e.target.value) : null)}>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.title || `Group ${g.id}`}</option>
          ))}
        </select>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}
