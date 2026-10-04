import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatBadgeModule, MatMenuModule, MatButtonModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.css'
})
export class NotificationBellComponent implements OnInit {

  constructor(
    public notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.notificationService.loadNotifications();
    
    // Polling a cada 30 segundos (opcional, mas bom para UX)
    setInterval(() => {
      this.notificationService.getUnreadCount().subscribe();
    }, 30000);
  }

  onMenuOpened() {
    this.notificationService.loadNotifications();
  }

  onNotificationClick(notification: Notification, event: Event) {
    event.stopPropagation();
    
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
    
    if (notification.projectId) {
      this.router.navigate(['/projects', notification.projectId]);
    }
  }

  markAllAsRead(event: Event) {
    event.stopPropagation();
    this.notificationService.markAllAsRead().subscribe();
  }
}
