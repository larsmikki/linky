import React, { useState, useRef } from 'react';
import { Settings, Group } from '../types';
import { api } from '../hooks/useApi';

const THEMES = [
  {
    name: 'Default',
    bgColor: '#f0f2f5',
    groupColors: ['#e0e7ff'],
  },
  {
    name: 'Rainbow',
    bgColor: '#f0f2f5',
    groupColors: ['#fecaca', '#fed7aa', '#fde68a', '#bbf7d0', '#bfdbfe', '#c7d2fe', '#e9d5ff'],
  },
  {
    name: 'Ocean',
    bgColor: '#eef2ff',
    groupColors: ['#dbeafe', '#ccfbf1', '#cffafe', '#e0f2fe'],
  },
  {
    name: 'Forest',
    bgColor: '#ecfdf5',
    groupColors: ['#d1fae5', '#dcfce7', '#d9f99d', '#bbf7d0'],
  },
  {
    name: 'Sunset',
    bgColor: '#fff7ed',
    groupColors: ['#ffe4e6', '#fef3c7', '#fed7aa', '#fecdd3'],
  },
  {
    name: 'Lavender',
    bgColor: '#f3e8ff',
    groupColors: ['#ede9fe', '#e9d5ff', '#f5d0fe', '#ddd6fe'],
  },
  {
    name: 'Monochrome',
    bgColor: '#ffffff',
    groupColors: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#f5f5f5'],
  },
  {
    name: 'Nord',
    bgColor: '#eceff4',
    groupColors: ['#d8dee9', '#e5e9f0', '#dbe4ee', '#d0dae8'],
  },
  {
    name: 'Dark',
    bgColor: '#1a1a2e',
    groupColors: ['#2d2d44', '#1e3a5f', '#2d1b4e', '#1b3d2e'],
  },
  {
    name: 'Earth',
    bgColor: '#faf8f5',
    groupColors: ['#fef3c7', '#fed7aa', '#e7e5e4', '#d1fae5'],
  },
];

const BG_PRESETS = [
  { label: 'Light Gray', value: '#f0f2f5' },
  { label: 'White', value: '#ffffff' },
  { label: 'Warm White', value: '#faf8f5' },
  { label: 'Cool Blue', value: '#eef2ff' },
  { label: 'Soft Mint', value: '#ecfdf5' },
  { label: 'Lavender', value: '#f3e8ff' },
  { label: 'Peach', value: '#fff7ed' },
  { label: 'Rose', value: '#fff1f2' },
  { label: 'Slate', value: '#f1f5f9' },
];

const GROUP_COLOR_PRESETS = [
  { label: 'Indigo', value: '#e0e7ff' },
  { label: 'White', value: '#ffffff' },
  { label: 'Blue', value: '#dbeafe' },
  { label: 'Green', value: '#dcfce7' },
  { label: 'Purple', value: '#f3e8ff' },
  { label: 'Amber', value: '#fef3c7' },
  { label: 'Rose', value: '#ffe4e6' },
  { label: 'Teal', value: '#ccfbf1' },
  { label: 'Slate', value: '#f1f5f9' },
];

interface Props {
  settings: Settings;
  groups: Group[];
  onSave: (data: Partial<Settings>) => void;
  onBack: () => void;
}

export default function SettingsPage({ settings, groups, onSave, onBack }: Props) {
  const [bgColor, setBgColor] = useState(settings.bg_color || '#f0f2f5');
  const [groupColor, setGroupColor] = useState(settings.group_color || '#e0e7ff');
  const [layoutMode, setLayoutMode] = useState(settings.layout_mode || 'row');
  const [showTitle, setShowTitle] = useState(settings.show_title !== 'false');
  const [showTopbar, setShowTopbar] = useState(settings.show_topbar !== 'false');
  const [columnExtraWidth, setColumnExtraWidth] = useState(Number(settings.column_extra_width) || 0);
  const [linkTarget, setLinkTarget] = useState(settings.link_target || '_blank');
  const [applyingTheme, setApplyingTheme] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave({
      bg_color: bgColor,
      group_color: groupColor,
      layout_mode: layoutMode as 'row' | 'column',
      show_title: String(showTitle),
      show_topbar: String(showTopbar),
      column_extra_width: String(columnExtraWidth),
      link_target: linkTarget,
    });
  };

  const handleApplyTheme = async (theme: typeof THEMES[0]) => {
    setApplyingTheme(true);
    setBgColor(theme.bgColor);
    setGroupColor(theme.groupColors[0]);

    // Update each group's color based on theme's cycling palette
    const sortedGroups = [...groups].sort((a, b) => a.sort_order - b.sort_order);
    for (let i = 0; i < sortedGroups.length; i++) {
      const color = theme.groupColors[i % theme.groupColors.length];
      await api.updateGroup(sortedGroups[i].id, { color });
    }

    // Save bg color immediately
    await api.updateSettings({ bg_color: theme.bgColor, group_color: theme.groupColors[0] });

    setApplyingTheme(false);
    window.location.reload();
  };

  const handleExport = async () => {
    const data = await api.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linky-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      alert('Failed to parse backup file');
      return;
    }
    if (!data.groups && !data.shortcuts && !data.settings) {
      alert('Invalid backup file: no groups, shortcuts or settings found');
      return;
    }
    if (!confirm('This will replace all current data. Continue?')) return;
    try {
      await api.importData(data);
      window.location.reload();
    } catch (err: any) {
      alert('Import failed: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <button className="settings-back-btn" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <h1>Settings</h1>
        </div>

        {/* Theme */}
        <section className="settings-section">
          <h2>Theme</h2>
          <div className="theme-grid">
            {THEMES.map((theme) => (
              <button
                key={theme.name}
                className="theme-card"
                onClick={() => !applyingTheme && handleApplyTheme(theme)}
                disabled={applyingTheme}
              >
                <div className="theme-preview" style={{ background: theme.bgColor }}>
                  {theme.groupColors.slice(0, 3).map((c, i) => (
                    <div key={i} className="theme-preview-bar" style={{ background: c }} />
                  ))}
                </div>
                <span className="theme-name">{theme.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Appearance */}
        <section className="settings-section">
          <h2>Appearance</h2>

          <div className="settings-field">
            <label>Background Color</label>
            <div className="color-presets">
              {BG_PRESETS.map((p) => (
                <button
                  key={p.value}
                  className={`color-swatch ${bgColor === p.value ? 'active' : ''}`}
                  style={{ background: p.value }}
                  onClick={() => setBgColor(p.value)}
                  title={p.label}
                />
              ))}
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="color-custom" title="Custom color" />
            </div>
          </div>

          <div className="settings-field">
            <label>Default Group Color</label>
            <div className="color-presets">
              {GROUP_COLOR_PRESETS.map((p) => (
                <button
                  key={p.value}
                  className={`color-swatch ${groupColor === p.value ? 'active' : ''}`}
                  style={{ background: p.value }}
                  onClick={() => setGroupColor(p.value)}
                  title={p.label}
                />
              ))}
              <input type="color" value={groupColor} onChange={(e) => setGroupColor(e.target.value)} className="color-custom" title="Custom color" />
            </div>
          </div>

          <div className="settings-field">
            <label className="settings-toggle">
              <span>Show Title (Linky)</span>
              <input type="checkbox" checked={showTitle} onChange={(e) => setShowTitle(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="settings-field">
            <label className="settings-toggle">
              <span>Show Top Bar</span>
              <input type="checkbox" checked={showTopbar} onChange={(e) => setShowTopbar(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="settings-field">
            <label>Open Links In</label>
            <select value={linkTarget} onChange={(e) => setLinkTarget(e.target.value)}>
              <option value="_blank">New window / tab</option>
              <option value="_self">Same window</option>
            </select>
          </div>
        </section>

        {/* Layout */}
        <section className="settings-section">
          <h2>Layout</h2>

          <div className="settings-field">
            <label>Layout Mode</label>
            <select value={layoutMode} onChange={(e) => setLayoutMode(e.target.value as 'row' | 'column')}>
              <option value="row">Rows (groups stack vertically)</option>
              <option value="column">Columns (groups side by side)</option>
            </select>
          </div>

          {layoutMode === 'column' && (
            <div className="settings-field">
              <label>Extra Column Width: {columnExtraWidth}px</label>
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={columnExtraWidth}
                onChange={(e) => setColumnExtraWidth(Number(e.target.value))}
              />
            </div>
          )}
        </section>

        {/* Data */}
        <section className="settings-section">
          <h2>Data</h2>
          <div className="settings-field settings-buttons">
            <button className="btn btn-secondary" onClick={handleExport}>Export Backup</button>
            <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>Import Backup</button>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
          </div>
        </section>

        <div className="settings-save-bar">
          <button className="btn btn-primary" onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}
