import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { TimeEntry, Project, DayGroup } from '../models/time-entry.model';

export function getEntrySeconds(entry: TimeEntry): number {
  if (!entry.endTime) return 0;
  return Math.floor((new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / 1000);
}

export function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatTimeOfDay(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false
  });
}

function getDateKey(isoString: string): string {
  return isoString.substring(0, 10);
}

function getDayLabel(dateKey: string): string {
  const today = getDateKey(new Date().toISOString());
  const yd = new Date();
  yd.setDate(yd.getDate() - 1);
  const yesterday = getDateKey(yd.toISOString());
  if (dateKey === today) return 'Today';
  if (dateKey === yesterday) return 'Yesterday';
  const d = new Date(dateKey + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getWeekBounds(): { start: number; end: number } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday.getTime(), end: sunday.getTime() };
}

@Injectable({ providedIn: 'root' })
export class TimeEntryService {
  private _entries = signal<TimeEntry[]>([]);
  private _projects = signal<Project[]>([]);

  readonly entries = this._entries.asReadonly();
  readonly projects = this._projects.asReadonly();

  readonly dayGroups = computed<DayGroup[]>(() => {
    const { start, end } = getWeekBounds();
    const weekEntries = this._entries().filter(e => {
      const t = new Date(e.startTime).getTime();
      return t >= start && t <= end;
    });

    const map = new Map<string, TimeEntry[]>();
    weekEntries.forEach(entry => {
      const key = getDateKey(entry.startTime);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    });

    const groups: DayGroup[] = [];
    map.forEach((entries, dateKey) => {
      const sorted = [...entries].sort((a, b) => b.startTime.localeCompare(a.startTime));
      groups.push({
        dateKey,
        label: getDayLabel(dateKey),
        entries: sorted,
        totalSeconds: sorted.reduce((s, e) => s + getEntrySeconds(e), 0),
      });
    });
    return groups.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  });

  readonly weekTotalSeconds = computed(() =>
    this.dayGroups().reduce((s, g) => s + g.totalSeconds, 0)
  );

  constructor(private storage: StorageService) {
    this._entries.set(storage.getEntries());
    this._projects.set(storage.getProjects());
  }

  addEntry(entry: TimeEntry): void {
    const updated = [entry, ...this._entries()];
    this._entries.set(updated);
    this.storage.saveEntries(updated);
  }

  updateEntry(entry: TimeEntry): void {
    const updated = this._entries().map(e => e.id === entry.id ? entry : e);
    this._entries.set(updated);
    this.storage.saveEntries(updated);
  }

  deleteEntry(id: string): void {
    const updated = this._entries().filter(e => e.id !== id);
    this._entries.set(updated);
    this.storage.saveEntries(updated);
  }

  duplicateEntry(entry: TimeEntry): void {
    const dupe: TimeEntry = { ...entry, id: crypto.randomUUID() };
    this.addEntry(dupe);
  }

  addProject(project: Project): void {
    const updated = [...this._projects(), project];
    this._projects.set(updated);
    this.storage.saveProjects(updated);
  }

  getProject(id: string | null): Project | undefined {
    if (!id) return undefined;
    return this._projects().find(p => p.id === id);
  }
}
