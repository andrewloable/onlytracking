import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TimeEntry, Project } from '../../models/time-entry.model';
import { TimeEntryService, formatSeconds, formatTimeOfDay, getEntrySeconds } from '../../services/time-entry.service';
import { TimerService } from '../../services/timer.service';
import { ProjectDialogComponent, ProjectDialogResult } from '../project-dialog/project-dialog.component';

@Component({
  selector: 'app-time-entry-row',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './time-entry-row.component.html',
  styleUrl: './time-entry-row.component.scss',
})
export class TimeEntryRowComponent {
  @Input() entry!: TimeEntry;
  @Input() entryNumber!: number;

  protected entryService = inject(TimeEntryService);
  protected timer = inject(TimerService);
  private dialog = inject(MatDialog);

  protected editing = false;
  protected editValue = '';

  get project(): Project | undefined {
    return this.entryService.getProject(this.entry.projectId);
  }

  get startTime(): string {
    return formatTimeOfDay(this.entry.startTime);
  }

  get endTime(): string {
    return this.entry.endTime ? formatTimeOfDay(this.entry.endTime) : '--:--';
  }

  get duration(): string {
    return formatSeconds(getEntrySeconds(this.entry));
  }

  get projects() {
    return this.entryService.projects;
  }

  startEdit(): void {
    this.editing = true;
    this.editValue = this.entry.description;
  }

  saveEdit(): void {
    this.editing = false;
    if (this.editValue !== this.entry.description) {
      this.entryService.updateEntry({ ...this.entry, description: this.editValue });
    }
  }

  onDescriptionKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') (event.target as HTMLElement).blur();
    if (event.key === 'Escape') { this.editing = false; }
  }

  selectProject(id: string | null): void {
    this.entryService.updateEntry({ ...this.entry, projectId: id });
  }

  openCreateProject(): void {
    const ref = this.dialog.open(ProjectDialogComponent, { width: '380px' });
    ref.afterClosed().subscribe((result?: ProjectDialogResult) => {
      if (result) {
        const project: Project = { id: crypto.randomUUID(), ...result };
        this.entryService.addProject(project);
        this.entryService.updateEntry({ ...this.entry, projectId: project.id });
      }
    });
  }

  toggleBillable(): void {
    this.entryService.updateEntry({ ...this.entry, billable: !this.entry.billable });
  }

  continueTimer(): void {
    this.timer.continueEntry(this.entry);
  }

  duplicate(): void {
    this.entryService.duplicateEntry(this.entry);
  }

  delete(): void {
    this.entryService.deleteEntry(this.entry.id);
  }
}
