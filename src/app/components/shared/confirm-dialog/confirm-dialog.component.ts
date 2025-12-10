import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button class="dialog-button-secondary" (click)="onCancel()">{{ data.cancelText || 'Cancelar' }}</button>
      <button mat-raised-button [class.dialog-button-destructive]="data.isDestructive" [class.dialog-button-primary]="!data.isDestructive" (click)="onConfirm()">
        {{ data.confirmText || 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      padding: 1.5rem;
      min-width: 300px;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      gap: 0.5rem;
    }

    p {
      margin: 0;
      color: hsl(var(--foreground));
    }

    .dialog-button-primary {
      background-color: hsl(var(--primary)) !important;
      color: hsl(var(--primary-foreground)) !important;
      border-radius: calc(var(--radius));
      font-weight: 500;
      padding: 0.625rem 1.5rem;
      transition: all 0.2s ease;
    }

    .dialog-button-primary ::ng-deep .mat-mdc-button-base {
      background-color: hsl(var(--primary)) !important;
      color: hsl(var(--primary-foreground)) !important;
    }

    .dialog-button-primary:hover {
      background-color: hsl(var(--primary) / 0.9) !important;
    }

    .dialog-button-primary:hover ::ng-deep .mat-mdc-button-base {
      background-color: hsl(var(--primary) / 0.9) !important;
    }

    .dialog-button-secondary {
      color: hsl(var(--muted-foreground)) !important;
      border-radius: calc(var(--radius));
      font-weight: 500;
      padding: 0.625rem 1.5rem;
      transition: all 0.2s ease;
    }

    .dialog-button-secondary:hover {
      background-color: hsl(var(--muted)) !important;
      color: hsl(var(--foreground)) !important;
    }

    .dialog-button-destructive {
      background-color: hsl(var(--destructive)) !important;
      color: hsl(var(--destructive-foreground)) !important;
      border-radius: calc(var(--radius));
      font-weight: 500;
      padding: 0.625rem 1.5rem;
      transition: all 0.2s ease;
    }

    .dialog-button-destructive ::ng-deep .mat-mdc-button-base {
      background-color: hsl(var(--destructive)) !important;
      color: hsl(var(--destructive-foreground)) !important;
    }

    .dialog-button-destructive:hover {
      background-color: hsl(var(--destructive) / 0.9) !important;
    }

    .dialog-button-destructive:hover ::ng-deep .mat-mdc-button-base {
      background-color: hsl(var(--destructive) / 0.9) !important;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

