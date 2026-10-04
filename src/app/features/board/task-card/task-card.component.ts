import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../core/services/api/board.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="task-card">
      <div class="task-label-group">
        <!-- Labels would go here -->
        <div class="task-label" style="background-color: #0079BF;"></div>
      </div>
      <div class="task-title">{{ task.title }}</div>
      
      <div class="task-footer">
        <mat-icon class="footer-icon">subject</mat-icon>
        <div class="task-avatar">UI</div>
      </div>
    </div>
  `,
  styles: [`
    .task-card {
      background: #FFFFFF;
      border-radius: 8px;
      padding: 10px;
      box-shadow: 0 1px 2px rgba(9, 30, 66, 0.25);
      cursor: grab;
      position: relative;
    }
    .task-card:hover {
      background: #F4F5F7;
    }
    .task-card:active {
      cursor: grabbing;
    }
    .task-label-group {
      display: flex;
      gap: 4px;
      margin-bottom: 6px;
    }
    .task-label {
      height: 8px;
      width: 40px;
      border-radius: 4px;
    }
    .task-title {
      font-size: 14px;
      color: #172B4D;
      margin-bottom: 8px;
      word-wrap: break-word;
    }
    .task-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }
    .footer-icon {
      font-size: 16px;
      color: #5E6C84;
      width: 16px;
      height: 16px;
    }
    .task-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #4B0082;
      color: white;
      font-size: 10px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Drag preview styles */
    :host.cdk-drag-preview .task-card {
      box-shadow: 0 5px 10px rgba(9, 30, 66, 0.25);
      transform: rotate(3deg);
    }
    :host.cdk-drag-placeholder .task-card {
      opacity: 0;
    }
  `]
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
}
