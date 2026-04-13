import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { TimeEntryService, formatSeconds } from './time-entry.service';
import { StorageService } from './storage.service';
import { TimeEntry } from '../models/time-entry.model';

@Injectable({ providedIn: 'root' })
export class TimerService implements OnDestroy {
  private _running = signal(false);
  private _elapsed = signal(0);
  private _startTime = signal<Date | null>(null);
  private _description = signal('');
  private _projectId = signal<string | null>(null);
  private _billable = signal(false);
  private _tags = signal<string[]>([]);
  private _intervalId: ReturnType<typeof setInterval> | null = null;

  readonly isRunning = this._running.asReadonly();
  readonly elapsed = this._elapsed.asReadonly();
  readonly description = this._description.asReadonly();
  readonly projectId = this._projectId.asReadonly();
  readonly billable = this._billable.asReadonly();
  readonly tags = this._tags.asReadonly();
  readonly formattedTime = computed(() => formatSeconds(this._elapsed()));

  constructor(private entryService: TimeEntryService, private storage: StorageService) {
    const active = storage.getActiveTimer();
    if (active) {
      const start = new Date(active.startTime);
      this._startTime.set(start);
      this._description.set(active.description);
      this._projectId.set(active.projectId);
      this._billable.set(active.billable);
      this._tags.set(active.tags);
      this._elapsed.set(Math.floor((Date.now() - start.getTime()) / 1000));
      this._running.set(true);
      this._tick();
    }
  }

  setDescription(v: string): void {
    this._description.set(v);
    this._persistActive();
  }

  setProjectId(v: string | null): void {
    this._projectId.set(v);
    this._persistActive();
  }

  setBillable(v: boolean): void {
    this._billable.set(v);
    this._persistActive();
  }

  setTags(v: string[]): void {
    this._tags.set(v);
    this._persistActive();
  }

  start(): void {
    if (this._running()) return;
    const now = new Date();
    this._startTime.set(now);
    this._elapsed.set(0);
    this._running.set(true);
    this._persistActive();
    this._tick();
  }

  stop(): void {
    if (!this._running()) return;
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      description: this._description(),
      projectId: this._projectId(),
      tags: this._tags(),
      billable: this._billable(),
      startTime: this._startTime()!.toISOString(),
      endTime: new Date().toISOString(),
    };
    this.entryService.addEntry(entry);
    this.storage.saveActiveTimer(null);

    this._running.set(false);
    this._elapsed.set(0);
    this._startTime.set(null);
    this._description.set('');
    this._projectId.set(null);
    this._billable.set(false);
    this._tags.set([]);
  }

  continueEntry(entry: TimeEntry): void {
    if (this._running()) this.stop();
    this._description.set(entry.description);
    this._projectId.set(entry.projectId);
    this._billable.set(entry.billable);
    this._tags.set([...entry.tags]);
    this.start();
  }

  toggleTimer(): void {
    if (this._running()) this.stop();
    else this.start();
  }

  private _tick(): void {
    this._intervalId = setInterval(() => {
      const start = this._startTime();
      if (start) {
        this._elapsed.set(Math.floor((Date.now() - start.getTime()) / 1000));
      }
    }, 1000);
  }

  private _persistActive(): void {
    const startTime = this._startTime();
    if (!startTime) return;
    this.storage.saveActiveTimer({
      startTime: startTime.toISOString(),
      description: this._description(),
      projectId: this._projectId(),
      billable: this._billable(),
      tags: this._tags(),
    });
  }

  ngOnDestroy(): void {
    if (this._intervalId !== null) clearInterval(this._intervalId);
  }
}
