const BASE = '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getSettings: () => apiFetch<Record<string, string>>('/settings'),
  updateSettings: (data: Record<string, string>) =>
    apiFetch('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  getGroups: () => apiFetch<any[]>('/groups'),
  createGroup: (data: any) =>
    apiFetch('/groups', { method: 'POST', body: JSON.stringify(data) }),
  updateGroup: (id: number, data: any) =>
    apiFetch(`/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGroup: (id: number) =>
    apiFetch(`/groups/${id}`, { method: 'DELETE' }),

  getShortcuts: () => apiFetch<any[]>('/shortcuts'),
  createShortcut: (data: any) =>
    apiFetch('/shortcuts', { method: 'POST', body: JSON.stringify(data) }),
  updateShortcut: (id: number, data: any) =>
    apiFetch(`/shortcuts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteShortcut: (id: number) =>
    apiFetch(`/shortcuts/${id}`, { method: 'DELETE' }),
  refreshFavicon: (id: number) =>
    apiFetch(`/shortcuts/${id}/refresh-favicon`, { method: 'POST' }),
  removeIcon: (id: number) =>
    apiFetch(`/shortcuts/${id}/icon`, { method: 'DELETE' }),
  uploadIcon: async (id: number, file: File) => {
    const form = new FormData();
    form.append('icon', file);
    const res = await fetch(`${BASE}/shortcuts/${id}/icon`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  updateLayout: (data: { shortcuts?: any[]; groups?: any[] }) =>
    apiFetch('/layout', { method: 'PUT', body: JSON.stringify(data) }),

  exportData: () => apiFetch<any>('/export'),
  importData: (data: any) =>
    apiFetch('/import', { method: 'POST', body: JSON.stringify(data) }),
};
