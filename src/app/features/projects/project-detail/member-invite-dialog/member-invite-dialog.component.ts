import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ProjectService } from '../../../../core/services/project.service';

@Component({
  selector: 'app-member-invite-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Convidar Membro</h2>
    <mat-dialog-content>
      <form [formGroup]="inviteForm" style="display: flex; flex-direction: column; gap: 16px; margin-top: 8px;">
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>E-mail do Usuário</mat-label>
          <input matInput type="email" formControlName="email" placeholder="usuario@email.com">
          <mat-error *ngIf="inviteForm.get('email')?.hasError('required')">E-mail é obrigatório</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nível de Acesso</mat-label>
          <mat-select formControlName="role">
            <mat-option value="MEMBER">Membro</mat-option>
            <mat-option value="MANAGER">Gerente (Manager)</mat-option>
          </mat-select>
        </mat-form-field>

        <div *ngIf="errorMessage" style="color: #ef4444; font-size: 14px;">{{ errorMessage }}</div>
        
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="isLoading">Cancelar</button>
      <button mat-flat-button color="primary" (click)="onSubmit()" [disabled]="inviteForm.invalid || isLoading">
        {{ isLoading ? 'Convidando...' : 'Convidar' }}
      </button>
    </mat-dialog-actions>
  `
})
export class MemberInviteDialogComponent {
  inviteForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    public dialogRef: MatDialogRef<MemberInviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number }
  ) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: ['MEMBER', Validators.required]
    });
  }

  onSubmit() {
    if (this.inviteForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    const { email, role } = this.inviteForm.value;

    this.projectService.inviteMember(this.data.projectId, email, role).subscribe({
      next: (res) => this.dialogRef.close(res),
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao convidar usuário. Verifique o e-mail.';
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
