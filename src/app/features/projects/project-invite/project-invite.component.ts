import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-project-invite',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  template: `
    <div class="invite-container">
      <mat-card class="invite-card">
        <mat-card-header>
          <mat-card-title>Convite para Projeto</mat-card-title>
        </mat-card-header>
        
        <mat-card-content *ngIf="isLoading" style="text-align: center; padding: 24px;">
          Carregando informações do convite...
        </mat-card-content>

        <mat-card-content *ngIf="!isLoading && error" style="color: #ef4444; padding: 24px; text-align: center;">
          {{ error }}
        </mat-card-content>

        <mat-card-content *ngIf="!isLoading && invite" style="text-align: center; padding: 24px;">
          <h2>{{ invite.projectName }}</h2>
          <p>Você foi convidado para participar deste projeto como <strong>{{ invite.role === 'MANAGER' ? 'Gerente' : 'Membro' }}</strong>.</p>
          
          <div style="margin-top: 24px;" *ngIf="isLoggedIn">
            <button mat-flat-button color="primary" (click)="acceptInvite()" [disabled]="isAccepting">
              {{ isAccepting ? 'Aceitando...' : 'Aceitar Convite' }}
            </button>
          </div>
          
          <div style="margin-top: 24px;" *ngIf="!isLoggedIn">
            <p style="margin-bottom: 16px; color: #64748B;">Para aceitar o convite, faça login ou crie uma conta com o email <strong>{{ invite.email }}</strong>.</p>
            <div style="display: flex; gap: 16px; justify-content: center;">
              <button mat-stroked-button routerLink="/login" [queryParams]="{returnUrl: currentUrl}">Fazer Login</button>
              <button mat-flat-button color="primary" routerLink="/register" [queryParams]="{returnUrl: currentUrl, email: invite.email}">Criar Conta</button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .invite-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #F8FAFC;
    }
    .invite-card {
      width: 100%;
      max-width: 500px;
    }
    mat-card-header {
      justify-content: center;
      background-color: #f1f5f9;
      padding: 16px;
      margin: -16px -16px 16px -16px;
      border-bottom: 1px solid #e2e8f0;
    }
  `]
})
export class ProjectInviteComponent implements OnInit {
  token: string | null = null;
  invite: any = null;
  isLoading = true;
  isAccepting = false;
  error = '';
  currentUrl = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public authService: AuthService
  ) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.error = 'Token de convite não fornecido.';
      this.isLoading = false;
      return;
    }
    this.loadInvite();
  }

  loadInvite() {
    this.http.get(`/api/projects/invitations/${this.token}`).subscribe({
      next: (res: any) => {
        this.invite = res;
        this.isLoading = false;
        
        if (this.isLoggedIn) {
          this.acceptInvite();
        }
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Convite inválido ou expirado.';
        this.isLoading = false;
      }
    });
  }

  acceptInvite() {
    if (!this.token) return;
    this.isAccepting = true;
    this.http.post(`/api/projects/invitations/${this.token}/accept`, {}).subscribe({
      next: () => {
        this.router.navigate(['/projects', this.invite.projectId]);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Erro ao aceitar convite.';
        this.isAccepting = false;
      }
    });
  }
}
