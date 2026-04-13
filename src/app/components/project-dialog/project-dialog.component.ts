import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

const PROJECT_COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722',
  '#795548', '#607D8B', '#9E9E9E',
];

export interface ProjectDialogResult {
  name: string;
  color: string;
}

@Component({
  selector: 'app-project-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Create Project</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" style="width: 100%; margin-top: 8px;">
        <mat-label>Project name</mat-label>
        <input matInput [formControl]="nameControl" placeholder="e.g. My Website" (keyup.enter)="create()" />
      </mat-form-field>
      <div class="color-grid">
        @for (color of colors; track color) {
          <div
            class="swatch"
            [style.background]="color"
            [class.selected]="selectedColor === color"
            (click)="selectedColor = color"
          ></div>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!nameControl.value?.trim()" (click)="create()">
        Create
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content { min-width: 320px; }
    .color-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 4px;
      margin-bottom: 8px;
    }
    .swatch {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.15s;
    }
    .swatch:hover { transform: scale(1.15); }
    .swatch.selected {
      outline: 3px solid var(--mat-sys-on-surface, #333);
      outline-offset: 2px;
    }
  `],
})
export class ProjectDialogComponent {
  nameControl = new FormControl('');
  selectedColor = PROJECT_COLORS[6]; // cyan-ish default
  colors = PROJECT_COLORS;

  constructor(private dialogRef: MatDialogRef<ProjectDialogComponent>) {}

  create(): void {
    const name = this.nameControl.value?.trim();
    if (name) {
      this.dialogRef.close({ name, color: this.selectedColor } satisfies ProjectDialogResult);
    }
  }
}
