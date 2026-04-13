import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TimerService } from '../../services/timer.service';
import { TimeEntryService } from '../../services/time-entry.service';
import { ProjectDialogComponent, ProjectDialogResult } from '../project-dialog/project-dialog.component';
import { Project } from '../../models/time-entry.model';

@Component({
  selector: 'app-timer-bar',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './timer-bar.component.html',
  styleUrl: './timer-bar.component.scss',
})
export class TimerBarComponent {
  protected timer = inject(TimerService);
  protected entryService = inject(TimeEntryService);
  private dialog = inject(MatDialog);

  get currentProject(): Project | undefined {
    return this.entryService.getProject(this.timer.projectId());
  }

  get projects() {
    return this.entryService.projects;
  }

  onDescriptionInput(event: Event): void {
    this.timer.setDescription((event.target as HTMLInputElement).value);
  }

  selectProject(id: string | null): void {
    this.timer.setProjectId(id);
  }

  openCreateProject(): void {
    const ref = this.dialog.open(ProjectDialogComponent, { width: '380px' });
    ref.afterClosed().subscribe((result?: ProjectDialogResult) => {
      if (result) {
        const project: Project = { id: crypto.randomUUID(), ...result };
        this.entryService.addProject(project);
        this.timer.setProjectId(project.id);
      }
    });
  }

  toggleBillable(): void {
    this.timer.setBillable(!this.timer.billable());
  }
}
