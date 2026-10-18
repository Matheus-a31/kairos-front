import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskService } from '../../../../core/services/task.service';
import { Tag } from '../../../../core/models/task.model';

@Component({
  selector: 'app-tag-management-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './tag-management-dialog.component.html',
  styleUrl: './tag-management-dialog.component.css'
})
export class TagManagementDialogComponent implements OnInit {
  tags: Tag[] = [];
  isLoading = false;
  editingTagId: number | null = null;

  createForm: FormGroup;
  editForm: FormGroup;

  colorPresets: string[] = [
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#EF4444', // Vermelho
    '#F59E0B', // Âmbar
    '#8B5CF6', // Roxo
    '#EC4899', // Rosa
    '#06B6D4', // Ciano
    '#64748B'  // Cinza
  ];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<TagManagementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number }
  ) {
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      color: ['#3B82F6', Validators.required]
    });

    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      color: ['#3B82F6', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags(): void {
    this.isLoading = true;
    this.taskService.getTags(this.data.projectId).subscribe({
      next: (tags) => {
        this.tags = tags;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar tags', err);
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar tags do projeto', 'Fechar', { duration: 3000 });
      }
    });
  }

  onCreateTag(): void {
    if (this.createForm.invalid || this.isLoading) return;

    this.isLoading = true;
    const { name, color } = this.createForm.value;

    this.taskService.createTag(this.data.projectId, name.trim(), color).subscribe({
      next: (newTag) => {
        this.tags.push(newTag);
        this.createForm.reset({ name: '', color: '#3B82F6' });
        this.isLoading = false;
        this.snackBar.open(`Tag "${newTag.name}" criada com sucesso!`, 'Ok', { duration: 3000 });
      },
      error: (err) => {
        console.error('Erro ao criar tag', err);
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Erro ao criar tag', 'Fechar', { duration: 3000 });
      }
    });
  }

  startEditing(tag: Tag): void {
    this.editingTagId = tag.id;
    this.editForm.setValue({
      name: tag.name,
      color: tag.color
    });
  }

  cancelEditing(): void {
    this.editingTagId = null;
    this.editForm.reset();
  }

  onSaveEdit(tagId: number): void {
    if (this.editForm.invalid || this.isLoading) return;

    this.isLoading = true;
    const { name, color } = this.editForm.value;

    this.taskService.updateTag(this.data.projectId, tagId, name.trim(), color).subscribe({
      next: (updatedTag) => {
        const index = this.tags.findIndex(t => t.id === tagId);
        if (index !== -1) {
          this.tags[index] = updatedTag;
        }
        this.editingTagId = null;
        this.isLoading = false;
        this.snackBar.open(`Tag "${updatedTag.name}" atualizada com sucesso!`, 'Ok', { duration: 3000 });
      },
      error: (err) => {
        console.error('Erro ao atualizar tag', err);
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Erro ao atualizar tag', 'Fechar', { duration: 3000 });
      }
    });
  }

  onDeleteTag(tag: Tag): void {
    if (!confirm(`Tem certeza que deseja excluir a tag "${tag.name}"? Ela será removida de todas as tarefas.`)) {
      return;
    }

    this.isLoading = true;
    this.taskService.deleteTag(this.data.projectId, tag.id).subscribe({
      next: () => {
        this.tags = this.tags.filter(t => t.id !== tag.id);
        if (this.editingTagId === tag.id) {
          this.editingTagId = null;
        }
        this.isLoading = false;
        this.snackBar.open(`Tag "${tag.name}" excluída com sucesso!`, 'Ok', { duration: 3000 });
      },
      error: (err) => {
        console.error('Erro ao excluir tag', err);
        this.isLoading = false;
        this.snackBar.open(err.error?.message || 'Erro ao excluir tag', 'Fechar', { duration: 3000 });
      }
    });
  }

  selectCreatePreset(color: string): void {
    this.createForm.patchValue({ color });
  }

  selectEditPreset(color: string): void {
    this.editForm.patchValue({ color });
  }

  getContrastColor(hex: string): string {
    if (!hex) return '#000000';
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1e293b' : '#ffffff';
  }

  onClose(): void {
    this.dialogRef.close(this.tags);
  }
}
