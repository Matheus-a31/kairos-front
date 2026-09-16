import { Component, Input, OnInit } from '@angular/core';
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
export class KanbanBoardComponent implements OnInit {
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

  loadTasks() {
    this.taskService.getTasks(this.projectId, this.searchQuery, undefined, undefined, undefined, 0, 100).subscribe({
      next: (res: any) => {
        const tasks: Task[] = res.content;
        // Reset tasks in each column
        this.columns.forEach(c => c.tasks = []);

        // Distribute tasks to columns by kanban_column_id if available, else by status
        const statusToColIndex: Record<string, number> = { 'TODO': 0, 'IN_PROGRESS': 1, 'DONE': 2 };
        tasks.forEach((task: any) => {
          let placed = false;
          if (task.kanbanColumnId) {
            const col = this.columns.find(c => c.id === task.kanbanColumnId);
            if (col) { col.tasks.push(task); placed = true; }
          }
          if (!placed) {
            const idx = statusToColIndex[task.status] ?? 0;
            if (this.columns[idx]) this.columns[idx].tasks.push(task);
          }
        });
      },
      error: (err: any) => console.error(err)
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.loadTasks();
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
      const task: any = event.previousContainer.data[event.previousIndex];

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // Map column to status (default columns keep status enum)
      let newStatus = '';
      if (targetColumn.name === 'A Fazer') newStatus = 'TODO';
      else if (targetColumn.name === 'Em Andamento') newStatus = 'IN_PROGRESS';
      else if (targetColumn.name === 'Concluído') newStatus = 'DONE';
      else newStatus = 'IN_PROGRESS'; // custom columns default to IN_PROGRESS

      this.taskService.changeStatus(this.projectId, task.id, newStatus, `Movido para "${targetColumn.name}"`).subscribe({
        next: () => {},
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
}
