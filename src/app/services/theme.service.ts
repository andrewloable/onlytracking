import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<Theme>('system');
  readonly theme = this._theme.asReadonly();

  constructor(private storage: StorageService) {
    const saved = storage.getTheme() as Theme;
    if (['light', 'dark', 'system'].includes(saved)) {
      this._theme.set(saved);
    }
    this.apply();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this._theme() === 'system') this.apply();
    });
  }

  set(theme: Theme): void {
    this._theme.set(theme);
    this.storage.saveTheme(theme);
    this.apply();
  }

  get isDark(): boolean {
    return document.body.classList.contains('dark-theme');
  }

  private apply(): void {
    const dark =
      this._theme() === 'dark' ||
      (this._theme() === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.body.classList.toggle('dark-theme', dark);
  }
}
