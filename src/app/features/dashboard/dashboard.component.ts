import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div style="padding: 24px;">
      <h1>Bem-vindo ao Kairós</h1>
      <p>Você está autenticado e na área protegida.</p>
      <button (click)="logout()">Sair</button>
    </div>
  `
})
export class DashboardComponent {
  constructor(private authService: AuthService) {}
  
  logout() {
    this.authService.logout();
  }
}
