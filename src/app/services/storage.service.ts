import { Injectable } from '@angular/core';
import { TimeEntry, Project } from '../models/time-entry.model';

const ENTRIES_KEY = 'ot_entries';
const PROJECTS_KEY = 'ot_projects';
const ACTIVE_KEY = 'ot_active';
const THEME_KEY = 'ot_theme';

export interface ActiveTimer {
  startTime: string;
  description: string;
  projectId: string | null;
  billable: boolean;
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  getEntries(): TimeEntry[] {
    try { return JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]'); }
    catch { return []; }
  }
  saveEntries(entries: TimeEntry[]): void {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  }

  getProjects(): Project[] {
    try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]'); }
    catch { return []; }
  }
  saveProjects(projects: Project[]): void {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }

  getActiveTimer(): ActiveTimer | null {
    try {
      const data = localStorage.getItem(ACTIVE_KEY);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }
  saveActiveTimer(data: ActiveTimer | null): void {
    if (data) localStorage.setItem(ACTIVE_KEY, JSON.stringify(data));
    else localStorage.removeItem(ACTIVE_KEY);
  }

  getTheme(): string {
    return localStorage.getItem(THEME_KEY) || 'system';
  }
  saveTheme(theme: string): void {
    localStorage.setItem(THEME_KEY, theme);
  }
}
