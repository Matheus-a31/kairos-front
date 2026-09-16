import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private isAuthenticatedSignal = signal<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.setSession(response))
    );
  }

  register(data: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, data);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/auth/login']);
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('refresh_token', authResult.refreshToken);
    this.isAuthenticatedSignal.set(true);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  isAuthenticated() {
    return this.isAuthenticatedSignal();
  }

  refreshToken(): Observable<AuthResponse> {
    const refresh = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken: refresh }).pipe(
      tap(response => this.setSession(response))
    );
  }
}
