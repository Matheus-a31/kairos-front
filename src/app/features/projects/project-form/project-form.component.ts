import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ProjectService } from '../../../core/services/project.service';
import { ProjectRequest } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.css'
})
export class ProjectFormComponent {
  projectForm: FormGroup;
  isEditMode = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    public dialogRef: MatDialogRef<ProjectFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data;

    this.projectForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      description: [data?.description || ''],
      startDate: [data?.startDate || ''],
      endDate: [data?.endDate || ''],
      status: [data?.status || null]
    });
  }

  onSubmit() {
    if (this.projectForm.invalid) return;

    this.isLoading = true;
    const projectRequest: ProjectRequest = { ...this.projectForm.value };

    // Format dates to YYYY-MM-DD
    const formatDate = (val: any): string => {
      if (!val) return '';
      if (val instanceof Date) {
        const year = val.getFullYear();
        const month = String(val.getMonth() + 1).padStart(2, '0');
        const day = String(val.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      if (typeof val === 'string' && val.includes('/')) {
        const parts = val.split('/');
        if (parts.length === 3) {
          let year = Number(parts[2]);
          if (year < 100) year += 2000;
          return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      return val;
    };

    projectRequest.startDate = formatDate(this.projectForm.value.startDate);
    projectRequest.endDate = formatDate(this.projectForm.value.endDate);

    if (this.isEditMode) {
      this.projectService.updateProject(this.data.id, projectRequest).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
    } else {
      this.projectService.createProject(projectRequest).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
