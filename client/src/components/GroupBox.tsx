import React, { useRef, useCallback } from 'react';
import { Group, Shortcut } from '../types';
import ShortcutTile from './ShortcutTile';

interface Props {
  group: Group;
  shortcuts: Shortcut[];
  arrangeMode: boolean;
  layoutMode: 'row' | 'column';
  linkTarget: string;
  onGroupContext: (e: React.MouseEvent | { clientX: number; clientY: number }) => void;
  onShortcutContext: (id: number, e: React.MouseEvent | { clientX: number; clientY: number }) => void;
  onToggleCollapse: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onShortcutDragStart?: (id: number, e: React.DragEvent) => void;
}

export default function GroupBox({
  group, shortcuts, arrangeMode, layoutMode, linkTarget, onGroupContext, onShortcutContext,
  onToggleCollapse, onDragStart, onDragOver, onDrop, onDragEnd, onShortcutDragStart,
}: Props) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const handleContext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onGroupContext(e);
  }, [onGroupContext]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    didLongPress.current = false;
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onGroupContext({ clientX: touch.clientX, clientY: touch.clientY });
    }, 500);
  }, [onGroupContext]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const isCollapsed = group.collapsed === 1;

  return (
    <div
      className={`group-container ${arrangeMode ? 'group-arrangeable' : ''}`}
      style={{ borderColor: group.color + '40', background: group.color + '20' }}
      onContextMenu={handleContext}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      draggable={arrangeMode}
      onDragStart={onDragStart}
      onDragOver={arrangeMode ? onDragOver : undefined}
      onDrop={arrangeMode ? onDrop : undefined}
      onDragEnd={onDragEnd}
      data-group-id={group.id}
    >
      <div className="group-header">
        <button className="group-collapse-btn" onClick={onToggleCollapse}>
          {isCollapsed ? '\u25B6' : '\u25BC'}
        </button>
        <span>{group.title || 'Untitled Group'}</span>
      </div>
      {!isCollapsed && (
        <div className={`group-body group-body-${layoutMode}`}>
          {shortcuts.map((s) => (
            <ShortcutTile
              key={s.id}
              shortcut={s}
              arrangeMode={arrangeMode}
              linkTarget={linkTarget}
              onContextMenu={(e) => onShortcutContext(s.id, e)}
              onDragStart={onShortcutDragStart ? (e) => onShortcutDragStart(s.id, e) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
