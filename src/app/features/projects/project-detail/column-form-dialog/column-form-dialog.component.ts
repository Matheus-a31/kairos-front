import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProjectService } from '../../../../core/services/project.service';

@Component({
  selector: 'app-column-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.column ? 'Editar Coluna' : 'Nova Coluna' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" style="display:flex;flex-direction:column;gap:16px;margin-top:8px;">
        <mat-form-field appearance="outline">
          <mat-label>Nome da Coluna</mat-label>
          <input matInput formControlName="name" placeholder="Ex: Code Review">
          <mat-error *ngIf="form.get('name')?.hasError('required')">Nome obrigatório</mat-error>
        </mat-form-field>

        <div style="display:flex;align-items:center;gap:16px;">
          <label style="font-size:14px;color:#64748B;">Cor:</label>
          <input type="color" formControlName="color" style="width:60px;height:40px;border:1px solid #E2E8F0;border-radius:8px;cursor:pointer;padding:2px;">
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()" [disabled]="isLoading">Cancelar</button>
      <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="form.invalid || isLoading">
        {{ isLoading ? 'Salvando...' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `
})
export class ColumnFormDialogComponent {
  form: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    public dialogRef: MatDialogRef<ColumnFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number; column?: any }
  ) {
    this.form = this.fb.group({
      name: [data.column?.name || '', Validators.required],
      color: [data.column?.color || '#94A3B8']
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isLoading = true;
    const payload = this.form.value;

    const obs = this.data.column
      ? this.projectService.updateColumn(this.data.projectId, this.data.column.id, payload)
      : this.projectService.createColumn(this.data.projectId, payload);

    obs.subscribe({
      next: (res: any) => this.dialogRef.close(res),
      error: (err: any) => { console.error(err); this.isLoading = false; }
    });
  }
}
