import React, { useRef, useCallback } from 'react';
import { Shortcut } from '../types';

const FALLBACK_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#06b6d4',
];

function getFallbackColor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = ((hash << 5) - hash + title.charCodeAt(i)) | 0;
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

function getFallbackLetter(title: string, url: string): string {
  if (title) return title.charAt(0).toUpperCase();
  try {
    return new URL(url).hostname.charAt(0).toUpperCase();
  } catch {
    return '?';
  }
}

interface Props {
  shortcut: Shortcut;
  arrangeMode: boolean;
  linkTarget: string;
  onContextMenu: (e: React.MouseEvent | { clientX: number; clientY: number }) => void;
  onDragStart?: (e: React.DragEvent) => void;
}

export default function ShortcutTile({ shortcut, arrangeMode, linkTarget, onContextMenu, onDragStart }: Props) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (arrangeMode || didLongPress.current) {
      didLongPress.current = false;
      return;
    }
    if (linkTarget === '_self') {
      window.location.href = shortcut.url;
    } else {
      window.open(shortcut.url, '_blank', 'noopener,noreferrer');
    }
  }, [shortcut.url, arrangeMode, linkTarget]);

  const handleContext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e);
  }, [onContextMenu]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    didLongPress.current = false;
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      onContextMenu({ clientX: touch.clientX, clientY: touch.clientY });
    }, 500);
  }, [onContextMenu]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const hasIcon = shortcut.icon_path && shortcut.favicon_cached;

  return (
    <div
      className="shortcut-tile"
      onClick={handleClick}
      onContextMenu={handleContext}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      draggable={arrangeMode}
      onDragStart={onDragStart}
      data-shortcut-id={shortcut.id}
    >
      {hasIcon ? (
        <div className="shortcut-icon">
          <img
            src={`/api/icons/${shortcut.icon_path}`}
            alt=""
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      ) : (
        <div
          className="shortcut-fallback"
          style={{ background: getFallbackColor(shortcut.title) }}
        >
          {getFallbackLetter(shortcut.title, shortcut.url)}
        </div>
      )}
      <span className="shortcut-title">{shortcut.title}</span>
    </div>
  );
}
