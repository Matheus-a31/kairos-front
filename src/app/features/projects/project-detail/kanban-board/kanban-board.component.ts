import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../../../../core/services/task.service';
import { ProjectService } from '../../../../core/services/project.service';
import { Task } from '../../../../core/models/task.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskFormDialogComponent } from '../task-form-dialog/task-form-dialog.component';
import { ColumnFormDialogComponent } from '../column-form-dialog/column-form-dialog.component';
import { TagManagementDialogComponent } from '../tag-management-dialog/tag-management-dialog.component';

interface KanbanColumn {
  id: number;
  name: string;
  color: string;
  position: number;
  isDefault: boolean;
  tasks: Task[];
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DragDropModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule
  ],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css'
})
export class KanbanBoardComponent implements OnInit, OnChanges {
  @Input() projectId!: number;

  columns: KanbanColumn[] = [];
  searchQuery: string = '';

  // Helper: retorna preto ou branco para contrastar com a cor de fundo da tag
  getContrastColor(hex: string): string {
    if (!hex) return '#000000';
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1e293b' : '#ffffff';
  }

  get columnIds(): string[] {
    return this.columns.map(c => 'col-' + c.id);
  }

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.projectId) {
      this.loadColumnsAndTasks();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && !changes['projectId'].isFirstChange()) {
      if (this.projectId) {
        this.loadColumnsAndTasks();
      }
    }
  }

  loadColumnsAndTasks() {
    this.projectService.getColumns(this.projectId).subscribe({
      next: (cols: any[]) => {
        this.columns = cols.map(c => ({ ...c, tasks: [] }));
        this.loadTasks();
      },
      error: (err: any) => {
        console.error('Erro ao carregar colunas', err);
        // fallback to 3 default columns if API fails
        this.columns = [
          { id: -1, name: 'A Fazer', color: '#64748B', position: 0, isDefault: true, tasks: [] },
          { id: -2, name: 'Em Andamento', color: '#3B82F6', position: 1, isDefault: true, tasks: [] },
          { id: -3, name: 'Concluído', color: '#22C55E', position: 2, isDefault: true, tasks: [] }
        ];
        this.loadTasks();
      }
    });
  }

  deduceStatus(column: KanbanColumn): 'TODO' | 'IN_PROGRESS' | 'DONE' {
    const normalized = (column.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes('conclu') || normalized.includes('done') || normalized.includes('final')) {
      return 'DONE';
    }
    if (normalized.includes('fazer') || normalized.includes('todo') || normalized.includes('backlog') || normalized.includes('pendente') || column.position === 0) {
      return 'TODO';
    }
    return 'IN_PROGRESS';
  }

  loadTasks() {
    this.taskService.getTasks(this.projectId, this.searchQuery, undefined, undefined, undefined, 0, 100).subscribe({
      next: (res: any) => {
        const tasks: Task[] = res.content || [];
        // Reset tasks in each column
        this.columns.forEach(c => c.tasks = []);

        // Distribute tasks to columns by kanbanColumnId if available, else by fallback deduced status
        tasks.forEach((task: Task) => {
          let placed = false;
          if (task.kanbanColumnId) {
            const col = this.columns.find(c => c.id === task.kanbanColumnId);
            if (col) {
              col.tasks.push(task);
              placed = true;
            }
          }
          if (!placed && this.columns.length > 0) {
            if (task.status === 'DONE') {
              const doneCol = this.columns.find(c => this.deduceStatus(c) === 'DONE') || this.columns[this.columns.length - 1];
              doneCol.tasks.push(task);
            } else if (task.status === 'TODO') {
              const todoCol = this.columns.find(c => this.deduceStatus(c) === 'TODO') || this.columns[0];
              todoCol.tasks.push(task);
            } else {
              const inProgCol = this.columns.find(c => this.deduceStatus(c) === 'IN_PROGRESS') || this.columns[Math.min(1, this.columns.length - 1)];
              inProgCol.tasks.push(task);
            }
          }
        });
      },
      error: (err: any) => console.error('Erro ao carregar tarefas', err)
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.loadTasks();
  }

  openTagManagementDialog() {
    const dialogRef = this.dialog.open(TagManagementDialogComponent, {
      width: '520px',
      data: { projectId: this.projectId }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadTasks();
    });
  }

  deleteTask(event: MouseEvent, task: Task) {
    event.stopPropagation();
    if (!confirm(`Tem certeza que deseja excluir a tarefa "${task.title}"?`)) return;

    this.taskService.deleteTask(this.projectId, task.id).subscribe({
      next: () => {
        this.snackBar.open('Tarefa excluída com sucesso!', 'Ok', { duration: 3000 });
        this.loadTasks();
      },
      error: (err: any) => {
        console.error('Erro ao excluir tarefa', err);
        this.snackBar.open(err.error?.message || 'Erro ao excluir tarefa', 'Fechar', { duration: 3000 });
      }
    });
  }

  openTaskDialog(task?: Task) {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '600px',
      data: { projectId: this.projectId, task: task }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadTasks();
    });
  }

  openColumnDialog(column?: any) {
    const dialogRef = this.dialog.open(ColumnFormDialogComponent, {
      width: '400px',
      data: { projectId: this.projectId, column: column }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadColumnsAndTasks();
    });
  }

  deleteColumn(column: KanbanColumn) {
    if (column.isDefault) {
      this.snackBar.open('Colunas padrão não podem ser excluídas', 'Ok', { duration: 3000 });
      return;
    }
    if (!confirm(`Excluir a coluna "${column.name}"? As tarefas serão movidas para "A Fazer".`)) return;
    this.projectService.deleteColumn(this.projectId, column.id).subscribe({
      next: () => this.loadColumnsAndTasks(),
      error: (err: any) => {
        this.snackBar.open(err.error?.message || 'Erro ao excluir coluna', 'Ok', { duration: 3000 });
      }
    });
  }

  drop(event: CdkDragDrop<Task[]>, targetColumn: KanbanColumn) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task: Task = event.previousContainer.data[event.previousIndex];

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      const newStatus = this.deduceStatus(targetColumn);
      const columnId = targetColumn.id > 0 ? targetColumn.id : undefined;

      this.taskService.changeStatus(
        this.projectId,
        task.id,
        newStatus,
        columnId,
        `Movido para "${targetColumn.name}"`
      ).subscribe({
        next: (updatedTask: Task) => {
          task.status = updatedTask.status;
          task.kanbanColumnId = updatedTask.kanbanColumnId;
          task.kanbanColumnName = updatedTask.kanbanColumnName;
        },
        error: (err: any) => {
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
          this.snackBar.open('Erro ao alterar status da tarefa', 'Fechar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onColumnColorChange(event: Event, column: KanbanColumn) {
    const input = event.target as HTMLInputElement;
    const newColor = input.value;
    column.color = newColor; // optimistic update
    this.projectService.updateColumn(this.projectId, column.id, { color: newColor }).subscribe({
      error: () => this.snackBar.open('Erro ao atualizar cor', 'Ok', { duration: 3000 })
    });
  }
}
