import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BoardService } from '../../../core/services/api/board.service';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatIconModule, MatButtonModule, KanbanColumnComponent],
  template: `
    <div class="kanban-board" [style.backgroundColor]="boardService.currentProject()?.backgroundColor || '#EBECF0'">
      <div class="board-header">
        <h2>{{ boardService.currentProject()?.name || 'Projeto Sem Nome' }}</h2>
        <div class="board-actions">
          <label for="board-color-picker" class="color-picker-label">
            <mat-icon>palette</mat-icon> Cor do Fundo
            <input 
              id="board-color-picker" 
              type="color" 
              [value]="boardService.currentProject()?.backgroundColor || '#EBECF0'"
              (change)="onBoardColorChange($event)"
            >
          </label>
        </div>
      </div>

      <div class="board-columns" cdkDropListGroup>
        @for (column of boardService.columns(); track column.id) {
          <app-kanban-column [column]="column"></app-kanban-column>
        }
      </div>
    </div>
  `,
  styles: [`
    .kanban-board {
      height: 100%;
      padding: 16px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      transition: background-color 0.3s ease;
    }
    .board-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      color: #172B4D;
    }
    .color-picker-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: 500;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 4px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    input[type="color"] {
      border: none;
      width: 24px;
      height: 24px;
      padding: 0;
      cursor: pointer;
      background: none;
    }
    .board-columns {
      display: flex;
      gap: 16px;
      flex: 1;
      overflow-x: auto;
      padding-bottom: 8px;
      align-items: flex-start;
    }
  `]
})
export class KanbanBoardComponent implements OnInit {
  boardService = inject(BoardService);

  ngOnInit() {
    // We would normally load from route params here
    this.boardService.loadProject(1).subscribe();
    this.boardService.loadColumns(1).subscribe();
  }

  onBoardColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const project = this.boardService.currentProject();
    if (project) {
      this.boardService.updateProjectBackground(project.id, input.value).subscribe();
    }
  }
}
