import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './hooks/useApi';
import { Shortcut, Group, Settings, ContextMenuState } from './types';
import ContextMenu from './components/ContextMenu';
import ShortcutTile from './components/ShortcutTile';
import GroupBox from './components/GroupBox';
import ShortcutDialog from './components/ShortcutDialog';
import GroupDialog from './components/GroupDialog';
import TopBar from './components/TopBar';
import SettingsPage from './components/SettingsPage';

export default function App() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [settings, setSettings] = useState<Settings>({ bg_color: '#f0f2f5', layout_mode: 'row', show_title: 'true', show_topbar: 'true', column_extra_width: '0', group_color: '#e0e7ff', link_target: '_blank' });
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [arrangeMode, setArrangeMode] = useState(false);
  const [view, setViewState] = useState<'desktop' | 'settings'>(
    window.location.pathname === '/settings' ? 'settings' : 'desktop'
  );
  const setView = useCallback((v: 'desktop' | 'settings') => {
    setViewState(v);
    window.history.pushState(null, '', v === 'settings' ? '/settings' : '/');
  }, []);
  useEffect(() => {
    const onPop = () => setViewState(window.location.pathname === '/settings' ? 'settings' : 'desktop');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const [dialog, setDialog] = useState<
    | { type: 'shortcut'; shortcut?: Shortcut; defaultGroupId?: number }
    | { type: 'group'; group?: Group }
    | null
  >(null);
  const dragItem = useRef<{ type: 'shortcut' | 'group'; id: number } | null>(null);
  const dragOverGroupId = useRef<number | null>(null);

  const layoutMode = (settings.layout_mode || 'row') as 'row' | 'column';
  const showTopbar = settings.show_topbar !== 'false';
  const showTitle = settings.show_title !== 'false';
  const columnExtraWidth = Number(settings.column_extra_width) || 0;

  // Load data
  const reload = useCallback(async () => {
    const [s, g, st] = await Promise.all([
      api.getShortcuts(),
      api.getGroups(),
      api.getSettings(),
    ]);
    setShortcuts(s);
    setGroups(g);
    setSettings(st as Settings);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Desktop context menu
  const handleDesktopContext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'desktop' });
  }, []);

  // Long press on desktop
  const desktopLongPress = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleDesktopTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    desktopLongPress.current = setTimeout(() => {
      setContextMenu({ x: touch.clientX, y: touch.clientY, type: 'desktop' });
    }, 600);
  }, []);
  const handleDesktopTouchEnd = useCallback(() => {
    if (desktopLongPress.current) clearTimeout(desktopLongPress.current);
  }, []);

  // Ensure a default group exists, return its id
  const ensureGroup = useCallback(async (): Promise<number> => {
    if (groups.length > 0) return groups[0].id;
    const g: any = await api.createGroup({ title: 'Links', color: '#e0e7ff' });
    await reload();
    return g.id;
  }, [groups, reload]);

  // CRUD handlers
  const handleSaveShortcut = useCallback(async (data: { title: string; url: string; group_id: number | null }) => {
    let groupId = data.group_id;
    if (!groupId) {
      groupId = await ensureGroup();
    }

    if (dialog?.type === 'shortcut' && dialog.shortcut) {
      await api.updateShortcut(dialog.shortcut.id, { ...data, group_id: groupId });
    } else {
      const created: any = await api.createShortcut({ ...data, group_id: groupId, grid_x: 0, grid_y: 0 });
      if (created?.id) {
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          const freshShortcuts = await api.getShortcuts();
          const sc = freshShortcuts.find((s: any) => s.id === created.id);
          if ((sc && sc.favicon_cached) || attempts >= 8) {
            clearInterval(poll);
          }
          setShortcuts(freshShortcuts);
        }, 2000);
      }
    }
    setDialog(null);
    reload();
  }, [dialog, ensureGroup, reload]);

  const handleSaveGroup = useCallback(async (data: { title: string; color: string }) => {
    if (dialog?.type === 'group' && dialog.group) {
      await api.updateGroup(dialog.group.id, data);
    } else {
      await api.createGroup(data);
    }
    setDialog(null);
    reload();
  }, [dialog, reload]);

  const handleSaveSettings = useCallback(async (data: Partial<Settings>) => {
    await api.updateSettings(data as Record<string, string>);
    setView('desktop');
    reload();
  }, [reload]);

  const handleDeleteShortcut = useCallback(async (id: number) => {
    await api.deleteShortcut(id);
    reload();
  }, [reload]);

  const handleDeleteGroup = useCallback(async (id: number) => {
    await api.deleteGroup(id);
    reload();
  }, [reload]);

  const handleToggleCollapse = useCallback(async (group: Group) => {
    await api.updateGroup(group.id, { collapsed: group.collapsed ? 0 : 1 });
    reload();
  }, [reload]);

  const handleRefreshFavicon = useCallback(async (id: number) => {
    await api.refreshFavicon(id);
    reload();
  }, [reload]);

  const handleUploadIcon = useCallback(async (id: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        await api.uploadIcon(id, file);
        reload();
      }
    };
    input.click();
  }, [reload]);

  const handleRemoveIcon = useCallback(async (id: number) => {
    await api.removeIcon(id);
    reload();
  }, [reload]);

  const handleUseDefaultIcon = useCallback(async (id: number) => {
    await api.updateShortcut(id, { icon_path: null, favicon_cached: 0, icon_type: 'favicon' });
    reload();
  }, [reload]);

  const handleMoveShortcut = useCallback(async (shortcutId: number, groupId: number) => {
    await api.updateShortcut(shortcutId, { group_id: groupId });
    reload();
  }, [reload]);

  // Drag and drop for arrange mode
  const handleGroupDragStart = useCallback((groupId: number, e: React.DragEvent) => {
    dragItem.current = { type: 'group', id: groupId };
    e.dataTransfer.effectAllowed = 'move';
    (e.target as HTMLElement).classList.add('dragging');
  }, []);

  const handleGroupDragOver = useCallback((groupId: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverGroupId.current = groupId;
  }, []);

  const handleGroupDrop = useCallback(async (targetGroupId: number, e: React.DragEvent) => {
    e.preventDefault();
    if (!dragItem.current) return;

    const { type, id } = dragItem.current;

    if (type === 'group' && id !== targetGroupId) {
      const sorted = [...groups].sort((a, b) => a.sort_order - b.sort_order);
      const fromIdx = sorted.findIndex(g => g.id === id);
      const toIdx = sorted.findIndex(g => g.id === targetGroupId);
      if (fromIdx >= 0 && toIdx >= 0) {
        const [moved] = sorted.splice(fromIdx, 1);
        sorted.splice(toIdx, 0, moved);
        const positions = sorted.map((g, i) => ({
          id: g.id, grid_x: 0, grid_y: 0, grid_w: 4, grid_h: 4, sort_order: i,
        }));
        await api.updateLayout({ groups: positions });
        reload();
      }
    } else if (type === 'shortcut') {
      await api.updateShortcut(id, { group_id: targetGroupId });
      reload();
    }

    dragItem.current = null;
    dragOverGroupId.current = null;
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
  }, [groups, reload]);

  const handleShortcutDragStart = useCallback((shortcutId: number, e: React.DragEvent) => {
    dragItem.current = { type: 'shortcut', id: shortcutId };
    e.dataTransfer.effectAllowed = 'move';
    (e.target as HTMLElement).classList.add('dragging');
  }, []);

  const handleDragEnd = useCallback(() => {
    document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
    dragItem.current = null;
    dragOverGroupId.current = null;
  }, []);

  // Context menu items
  const getContextMenuItems = () => {
    if (!contextMenu) return [];
    if (contextMenu.type === 'desktop') {
      return [
        { label: 'Add Shortcut', icon: '\u2795', onClick: () => setDialog({ type: 'shortcut' }) },
        { label: 'Add Group', icon: '\uD83D\uDCC1', onClick: () => setDialog({ type: 'group' }) },
        { divider: true, label: '', onClick: () => {} },
        { label: arrangeMode ? 'Exit Arrange Mode' : 'Arrange Mode', icon: '\u2725', onClick: () => setArrangeMode(!arrangeMode) },
        { label: 'Settings', icon: '\u2699\uFE0F', onClick: () => setView('settings') },
      ];
    }
    if (contextMenu.type === 'shortcut' && contextMenu.targetId) {
      const sc = shortcuts.find((s) => s.id === contextMenu.targetId)!;
      if (!sc) return [];
      const otherGroups = groups.filter(g => g.id !== sc.group_id);
      const groupItems = otherGroups.map((g) => ({
        label: `Move to ${g.title || 'Group ' + g.id}`,
        icon: '\u2192',
        onClick: () => handleMoveShortcut(sc.id, g.id),
      }));
      return [
        { label: 'Edit Shortcut', icon: '\u270F\uFE0F', onClick: () => setDialog({ type: 'shortcut', shortcut: sc }) },
        { label: 'Refresh Favicon', icon: '\uD83D\uDD04', onClick: () => handleRefreshFavicon(sc.id) },
        { label: 'Upload Icon', icon: '\uD83D\uDDBC\uFE0F', onClick: () => handleUploadIcon(sc.id) },
        ...(sc.icon_type === 'manual' ? [{ label: 'Remove Custom Icon', icon: '\u2716', onClick: () => handleRemoveIcon(sc.id) }] : []),
        ...(sc.icon_path ? [{ label: 'Use Default Icon', icon: '\uD83D\uDD24', onClick: () => handleUseDefaultIcon(sc.id) }] : []),
        ...(groupItems.length > 0 ? [{ divider: true, label: '', onClick: () => {} }, ...groupItems] : []),
        { divider: true, label: '', onClick: () => {} },
        { label: 'Delete Shortcut', icon: '\uD83D\uDDD1\uFE0F', onClick: () => handleDeleteShortcut(sc.id), danger: true },
      ];
    }
    if (contextMenu.type === 'group' && contextMenu.targetId) {
      const gr = groups.find((g) => g.id === contextMenu.targetId)!;
      if (!gr) return [];
      return [
        { label: 'Add Shortcut', icon: '\u2795', onClick: () => setDialog({ type: 'shortcut', defaultGroupId: gr.id }) },
        { label: 'Edit Group', icon: '\u270F\uFE0F', onClick: () => setDialog({ type: 'group', group: gr }) },
        { label: gr.collapsed ? 'Expand' : 'Collapse', icon: gr.collapsed ? '\u25BC' : '\u25B6', onClick: () => handleToggleCollapse(gr) },
        { divider: true, label: '', onClick: () => {} },
        { label: 'Delete Group', icon: '\uD83D\uDDD1\uFE0F', onClick: () => handleDeleteGroup(gr.id), danger: true },
      ];
    }
    return [];
  };

  // Sort groups by sort_order
  const sortedGroups = [...groups].sort((a, b) => a.sort_order - b.sort_order);

  // Settings page
  if (view === 'settings') {
    return (
      <div className="desktop" style={{ background: settings.bg_color }}>
        <SettingsPage settings={settings} groups={groups} onSave={handleSaveSettings} onBack={() => setView('desktop')} />
      </div>
    );
  }

  // Column extra width CSS variable
  const layoutStyle: React.CSSProperties = {};
  if (layoutMode === 'column' && columnExtraWidth > 0) {
    (layoutStyle as Record<string, string>)['--column-extra-width'] = `${columnExtraWidth}px`;
  }

  return (
    <div
      className="desktop"
      style={{ background: settings.bg_color }}
      onContextMenu={handleDesktopContext}
      onTouchStart={handleDesktopTouchStart}
      onTouchEnd={handleDesktopTouchEnd}
      onTouchMove={handleDesktopTouchEnd}
    >
      {showTopbar && (
        <TopBar showTitle={showTitle} onSettingsClick={() => setView('settings')} />
      )}

      <div className={`desktop-layout layout-${layoutMode}`} style={layoutStyle}>
        {sortedGroups.map((g) => {
          const groupShortcuts = shortcuts
            .filter((s) => s.group_id === g.id)
            .sort((a, b) => a.sort_order - b.sort_order);
          return (
            <GroupBox
              key={g.id}
              group={g}
              shortcuts={groupShortcuts}
              arrangeMode={arrangeMode}
              layoutMode={layoutMode}
              linkTarget={settings.link_target || '_blank'}
              onGroupContext={(e) =>
                setContextMenu({ x: (e as any).clientX, y: (e as any).clientY, type: 'group', targetId: g.id })
              }
              onShortcutContext={(id, e) =>
                setContextMenu({ x: (e as any).clientX, y: (e as any).clientY, type: 'shortcut', targetId: id })
              }
              onToggleCollapse={() => handleToggleCollapse(g)}
              onDragStart={(e) => handleGroupDragStart(g.id, e)}
              onDragOver={(e) => handleGroupDragOver(g.id, e)}
              onDrop={(e) => handleGroupDrop(g.id, e)}
              onDragEnd={handleDragEnd}
              onShortcutDragStart={(id, e) => handleShortcutDragStart(id, e)}
            />
          );
        })}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Dialogs */}
      {dialog?.type === 'shortcut' && (
        <ShortcutDialog
          shortcut={dialog.shortcut}
          groups={groups}
          defaultGroupId={dialog.defaultGroupId}
          onSave={handleSaveShortcut}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.type === 'group' && (
        <GroupDialog
          group={dialog.group}
          onSave={handleSaveGroup}
          onClose={() => setDialog(null)}
        />
      )}

      {/* Arrange mode bar */}
      {arrangeMode && (
        <div className="arrange-bar">
          <span>{'\u2725'} Arrange Mode — drag to reorder</span>
          <button className="btn" onClick={() => setArrangeMode(false)}>Done</button>
        </div>
      )}
    </div>
  );
}
