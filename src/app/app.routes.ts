import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  
  // Dashboard / Home (protected)
  { 
    path: '', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/project-list/project-list.component').then(m => m.ProjectListComponent) 
  },
  
  // Project Details (Overview, Members, Kanban)
  { 
    path: 'projects/:id', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent) 
  },

  { 
    path: 'invite', 
    loadComponent: () => import('./features/projects/project-invite/project-invite.component').then(m => m.ProjectInviteComponent) 
  },

  { path: '**', redirectTo: '' }
];
