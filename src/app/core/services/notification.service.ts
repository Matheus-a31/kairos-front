import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/notification.model';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  // Signals para manter estado global na aplicação
  unreadCount = signal<number>(0);
  notifications = signal<Notification[]>([]);

  constructor(private http: HttpClient) {}

  loadNotifications() {
    this.http.get<Notification[]>(this.apiUrl).subscribe(data => {
      this.notifications.set(data);
      this.updateUnreadCount(data);
    });
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`).pipe(
      tap(res => this.unreadCount.set(res.count))
    );
  }

  markAsRead(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        this.notifications.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
        this.unreadCount.update(c => Math.max(0, c - 1));
      })
    );
  }

  markAllAsRead() {
    return this.http.put(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      })
    );
  }

  private updateUnreadCount(list: Notification[]) {
    const count = list.filter(n => !n.isRead).length;
    this.unreadCount.set(count);
  }
}
