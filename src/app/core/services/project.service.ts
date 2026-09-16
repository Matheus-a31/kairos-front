import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectRequest, PaginatedResponse } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = '/api/projects';

  constructor(private http: HttpClient) {}

  getProjects(page: number = 0, size: number = 10, name?: string): Observable<PaginatedResponse<Project>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    if (name) {
      params = params.set('name', name);
    }
    
    return this.http.get<PaginatedResponse<Project>>(this.apiUrl, { params });
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(project: ProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: number, project: ProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- Members ---
  
  getProjectMembers(projectId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${projectId}/members`);
  }

  inviteMember(projectId: number, email: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${projectId}/invitations`, { email, role });
  }

  removeMember(projectId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/members/${userId}`);
  }

  // --- Kanban Columns ---

  getColumns(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${projectId}/columns`);
  }

  createColumn(projectId: number, data: { name: string; color: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${projectId}/columns`, data);
  }

  updateColumn(projectId: number, columnId: number, data: { name?: string; color?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${projectId}/columns/${columnId}`, data);
  }

  deleteColumn(projectId: number, columnId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/columns/${columnId}`);
  }
}
