import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService, Theme } from './services/theme.service';
import { TimerBarComponent } from './components/timer-bar/timer-bar.component';
import { TimeEntryListComponent } from './components/time-entry-list/time-entry-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    TimerBarComponent,
    TimeEntryListComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected themeService = inject(ThemeService);

  get themeIcon(): string {
    switch (this.themeService.theme()) {
      case 'dark': return 'dark_mode';
      case 'light': return 'light_mode';
      default: return 'brightness_auto';
    }
  }

  setTheme(theme: Theme): void {
    this.themeService.set(theme);
  }
}
