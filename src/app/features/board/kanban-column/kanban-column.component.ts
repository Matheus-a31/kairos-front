import { Component, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { KanbanColumn, Task, BoardService } from '../../../core/services/api/board.service';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatIconModule, MatButtonModule, TaskCardComponent],
  template: `
    <div class="kanban-column" [style.backgroundColor]="column.color || '#F4F5F7'">
      <div class="column-header">
        <h3 class="column-title">{{ column.name }}</h3>
        
        <label [for]="'col-color-' + column.id" class="col-color-picker-label">
          <mat-icon>color_lens</mat-icon>
          <input 
            [id]="'col-color-' + column.id"
            type="color" 
            [value]="column.color || '#F4F5F7'"
            (change)="onColumnColorChange($event)"
          >
        </label>
      </div>

      <div class="column-body"
           cdkDropList
           [cdkDropListData]="tasks()"
           (cdkDropListDropped)="drop($event)">
        
        @for (task of tasks(); track task.id) {
          <app-task-card [task]="task" cdkDrag></app-task-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .kanban-column {
      width: 280px;
      min-width: 280px;
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      max-height: 100%;
      box-shadow: 0 1px 2px rgba(9, 30, 66, 0.15);
      transition: background-color 0.3s ease;
    }
    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .column-title {
      font-size: 14px;
      font-weight: 600;
      color: #172B4D;
      margin: 0;
    }
    .col-color-picker-label {
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .col-color-picker-label mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #5E6C84;
    }
    .col-color-picker-label input {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
    }
    .column-body {
      flex: 1;
      overflow-y: auto;
      min-height: 100px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    /* cdkDragDrop CSS Classes for UX */
    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .cdk-drag-animating {
      transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class KanbanColumnComponent {
  @Input({ required: true }) column!: KanbanColumn;
  
  boardService = inject(BoardService);

  tasks = computed(() => {
    return this.boardService.tasks().filter(t => t.columnId === this.column.id).sort((a, b) => a.position - b.position);
  });

  onColumnColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.boardService.updateColumnBackground(this.column.id, input.value).subscribe();
  }

  drop(event: CdkDragDrop<Task[]>) {
    // Drop logic to update task position and column in the backend
    // Since this is a prototype, we're not fully implementing the complex backend API call for reordering yet,
    // but the Drag and Drop UI will be functional.
  }
}
