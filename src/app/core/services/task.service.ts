import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskRequest, Tag } from '../models/task.model';
import { PaginatedResponse } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) {}

  getTasks(projectId: number, search?: string, status?: string, priority?: string, assigneeId?: number, page: number = 0, size: number = 20): Observable<PaginatedResponse<Task>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);
    if (assigneeId) params = params.set('assigneeId', assigneeId.toString());

    return this.http.get<PaginatedResponse<Task>>(`/api/projects/${projectId}/tasks`, { params });
  }

  getTask(projectId: number, taskId: number): Observable<Task> {
    return this.http.get<Task>(`/api/projects/${projectId}/tasks/${taskId}`);
  }

  createTask(projectId: number, request: TaskRequest): Observable<Task> {
    return this.http.post<Task>(`/api/projects/${projectId}/tasks`, request);
  }

  updateTask(projectId: number, taskId: number, request: TaskRequest): Observable<Task> {
    return this.http.put<Task>(`/api/projects/${projectId}/tasks/${taskId}`, request);
  }

  changeStatus(projectId: number, taskId: number, status: string, comment?: string): Observable<Task> {
    return this.http.patch<Task>(`/api/projects/${projectId}/tasks/${taskId}/status`, { status, comment });
  }

  deleteTask(projectId: number, taskId: number): Observable<void> {
    return this.http.delete<void>(`/api/projects/${projectId}/tasks/${taskId}`);
  }

  // --- Tags ---
  
  getTags(projectId: number): Observable<Tag[]> {
    return this.http.get<Tag[]>(`/api/projects/${projectId}/tags`);
  }

  createTag(projectId: number, name: string, color: string): Observable<Tag> {
    return this.http.post<Tag>(`/api/projects/${projectId}/tags`, { name, color });
  }

  deleteTag(projectId: number, tagId: number): Observable<void> {
    return this.http.delete<void>(`/api/projects/${projectId}/tags/${tagId}`);
  }
}
