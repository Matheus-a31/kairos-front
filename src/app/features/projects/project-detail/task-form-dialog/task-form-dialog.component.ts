import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskService } from '../../../../core/services/task.service';
import { ProjectService } from '../../../../core/services/project.service';
import { TagManagementDialogComponent } from '../tag-management-dialog/tag-management-dialog.component';

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
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatTooltipModule
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
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
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
      next: (res: any) => this.members = res.content || [],
      error: (err: any) => console.error('Erro ao carregar membros', err)
    });
  }

  loadTags() {
    this.taskService.getTags(this.data.projectId).subscribe({
      next: (res: any) => this.tags = res || [],
      error: (err: any) => console.error('Erro ao carregar tags', err)
    });
  }

  openTagManagement(): void {
    const dialogRef = this.dialog.open(TagManagementDialogComponent, {
      width: '520px',
      data: { projectId: this.data.projectId }
    });

    dialogRef.afterClosed().subscribe((updatedTags) => {
      if (updatedTags) {
        this.tags = updatedTags;
        // Filtra tagIds caso alguma tag selecionada tenha sido removida
        const currentTagIds: number[] = this.taskForm.get('tagIds')?.value || [];
        const validTagIds = currentTagIds.filter(id => this.tags.some(t => t.id === id));
        this.taskForm.patchValue({ tagIds: validTagIds });
      } else {
        this.loadTags();
      }
    });
  }

  onDelete(): void {
    if (!this.data.task) return;
    if (!confirm(`Tem certeza que deseja excluir a tarefa "${this.data.task.title}"?`)) {
      return;
    }

    this.isLoading = true;
    this.taskService.deleteTask(this.data.projectId, this.data.task.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Tarefa excluída com sucesso!', 'Ok', { duration: 3000 });
        this.dialogRef.close({ deleted: true, taskId: this.data.task.id });
      },
      error: (err: any) => {
        console.error('Erro ao excluir tarefa', err);
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Erro ao excluir tarefa', 'Fechar', { duration: 3000 });
      }
    });
  }

  onSubmit() {
    if (this.taskForm.invalid) return;
    this.isLoading = true;

    const request = { ...this.taskForm.value };

    // Formata dueDate com segurança (YYYY-MM-DD ou null se vazio)
    const rawDueDate = this.taskForm.value.dueDate;
    let formattedDueDate: string | null = null;
    if (rawDueDate) {
      const d = new Date(rawDueDate);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        formattedDueDate = `${year}-${month}-${day}`;
      }
    }
    request.dueDate = formattedDueDate;
    
    if (this.isEditMode) {
      this.taskService.updateTask(this.data.projectId, this.data.task.id, request).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.snackBar.open('Tarefa atualizada com sucesso!', 'Ok', { duration: 3000 });
          this.dialogRef.close(res);
        },
        error: (err: any) => {
          console.error('Erro ao atualizar tarefa', err);
          this.isLoading = false;
          this.snackBar.open(err.error?.message || 'Erro ao atualizar tarefa', 'Fechar', { duration: 3000 });
        }
      });
    } else {
      this.taskService.createTask(this.data.projectId, request).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.snackBar.open('Tarefa criada com sucesso!', 'Ok', { duration: 3000 });
          this.dialogRef.close(res);
        },
        error: (err: any) => {
          console.error('Erro ao criar tarefa', err);
          this.isLoading = false;
          this.snackBar.open(err.error?.message || 'Erro ao criar tarefa', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
