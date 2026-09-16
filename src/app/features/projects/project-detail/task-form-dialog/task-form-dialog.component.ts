import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TaskService } from '../../../../core/services/task.service';
import { ProjectService } from '../../../../core/services/project.service';

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './task-form-dialog.component.html',
  styleUrl: './task-form-dialog.component.css'
})
export class TaskFormDialogComponent implements OnInit {
  taskForm: FormGroup;
  isLoading = false;
  members: any[] = [];
  tags: any[] = [];
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private projectService: ProjectService,
    public dialogRef: MatDialogRef<TaskFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number, task?: any }
  ) {
    this.isEditMode = !!data.task;
    
    this.taskForm = this.fb.group({
      title: [data.task?.title || '', Validators.required],
      description: [data.task?.description || ''],
      priority: [data.task?.priority || 'MEDIUM', Validators.required],
      status: [data.task?.status || 'TODO'],
      dueDate: [data.task?.dueDate || ''],
      assigneeId: [data.task?.assigneeId || null],
      tagIds: [data.task?.tags?.map((t: any) => t.id) || []]
    });
  }

  ngOnInit() {
    this.loadMembers();
    this.loadTags();
  }

  loadMembers() {
    this.projectService.getProjectMembers(this.data.projectId).subscribe({
      next: (res: any) => this.members = res.content,
      error: (err: any) => console.error(err)
    });
  }

  loadTags() {
    this.taskService.getTags(this.data.projectId).subscribe({
      next: (res: any) => this.tags = res,
      error: (err: any) => console.error(err)
    });
  }

  onSubmit() {
    if (this.taskForm.invalid) return;
    this.isLoading = true;

    const request = { ...this.taskForm.value };
    const dueDateVal = this.taskForm.value.dueDate;
    if ((dueDateVal as any) instanceof Date) {
      request.dueDate = (dueDateVal as any).toISOString().split('T')[0];
    }
    
    if (this.isEditMode) {
      this.taskService.updateTask(this.data.projectId, this.data.task.id, request).subscribe({
        next: (res: any) => this.dialogRef.close(res),
        error: (err: any) => {
          console.error(err);
          this.isLoading = false;
        }
      });
    } else {
      this.taskService.createTask(this.data.projectId, request).subscribe({
        next: (res: any) => this.dialogRef.close(res),
        error: (err: any) => {
          console.error(err);
          this.isLoading = false;
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
