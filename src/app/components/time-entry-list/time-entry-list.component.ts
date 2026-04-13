import { Component, inject } from '@angular/core';
import { TimeEntryService, formatSeconds } from '../../services/time-entry.service';
import { TimeEntryRowComponent } from '../time-entry-row/time-entry-row.component';

@Component({
  selector: 'app-time-entry-list',
  standalone: true,
  imports: [TimeEntryRowComponent],
  templateUrl: './time-entry-list.component.html',
  styleUrl: './time-entry-list.component.scss',
})
export class TimeEntryListComponent {
  protected entryService = inject(TimeEntryService);
  protected formatSeconds = formatSeconds;
}
