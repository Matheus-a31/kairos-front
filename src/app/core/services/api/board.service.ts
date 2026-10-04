import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  backgroundColor: string;
}

export interface KanbanColumn {
  id: number;
  name: string;
  color: string;
  position: number;
  isDefault: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  columnId: number;
  position: number;
}

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private http = inject(HttpClient);
  private apiUrl = '/api'; // Use proxy configuration

  private _currentProject = signal<Project | null>(null);
  private _columns = signal<KanbanColumn[]>([]);
  private _tasks = signal<Task[]>([]);

  readonly currentProject = this._currentProject.asReadonly();
  readonly columns = this._columns.asReadonly();
  readonly tasks = this._tasks.asReadonly();

  loadProject(projectId: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/projects/${projectId}`).pipe(
      tap(project => this._currentProject.set(project))
    );
  }

  updateProjectBackground(projectId: number, color: string): Observable<Project> {
    // Optimistic update
    this._currentProject.update(p => p ? { ...p, backgroundColor: color } : null);
    
    // In a real app we might patch just the background color
    return this.http.put<Project>(`${this.apiUrl}/projects/${projectId}/background`, { backgroundColor: color });
  }

  loadColumns(projectId: number): Observable<KanbanColumn[]> {
    return this.http.get<KanbanColumn[]>(`${this.apiUrl}/projects/${projectId}/columns`).pipe(
      tap(columns => this._columns.set(columns))
    );
  }

  updateColumnBackground(columnId: number, color: string): Observable<KanbanColumn> {
    const projectId = this._currentProject()?.id;
    if (!projectId) throw new Error("No active project");
    
    this._columns.update(cols => cols.map(c => c.id === columnId ? { ...c, color } : c));
    return this.http.put<KanbanColumn>(`${this.apiUrl}/projects/${projectId}/columns/${columnId}`, { color });
  }
}
