import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule, MatListModule],
  template: `
    <mat-sidenav-container class="layout-container" id="app-root">
      <!-- Sidebar is expanded by default (opened=true, mode="side") -->
      <mat-sidenav #sidenav mode="side" opened id="main-sidebar">
        <mat-toolbar color="primary">Kairos</mat-toolbar>
        <mat-nav-list>
          <a mat-list-item href="#">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <div matListItemTitle>Kanban Board</div>
          </a>
          <a mat-list-item href="#">
            <mat-icon matListItemIcon>settings</mat-icon>
            <div matListItemTitle>Configurações</div>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar id="top-header">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span>Painel de Controle</span>
          <span class="spacer"></span>
          <button mat-icon-button>
            <mat-icon>notifications</mat-icon>
          </button>
          <button mat-icon-button>
            <mat-icon>account_circle</mat-icon>
          </button>
        </mat-toolbar>

        <main id="board-container">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .layout-container {
      height: 100vh;
    }
    #main-sidebar {
      width: 250px;
      border-right: 1px solid rgba(0, 0, 0, 0.12);
    }
    #top-header {
      background: #ffffff;
      color: rgba(0, 0, 0, 0.87);
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    .spacer {
      flex: 1 1 auto;
    }
    #board-container {
      height: calc(100vh - 64px);
      overflow-x: auto;
    }
  `]
})
export class MainLayoutComponent {}
