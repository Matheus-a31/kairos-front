import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MemberInviteDialogComponent } from './member-invite-dialog/member-invite-dialog.component';
import { KanbanBoardComponent } from './kanban-board/kanban-board.component';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    NotificationBellComponent,
    KanbanBoardComponent
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css'
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  members: any[] = [];
  displayedColumns: string[] = ['name', 'email', 'role', 'joinedAt', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProject(Number(id));
      this.loadMembers(Number(id));
    }
  }

  loadProject(id: number) {
    this.projectService.getProject(id).subscribe({
      next: (res) => this.project = res,
      error: (err) => console.error('Erro ao carregar projeto', err)
    });
  }

  loadMembers(id: number) {
    this.projectService.getProjectMembers(id).subscribe({
      next: (res) => this.members = res.content,
      error: (err) => console.error('Erro ao carregar membros', err)
    });
  }

  openInviteDialog() {
    if (!this.project) return;
    
    const dialogRef = this.dialog.open(MemberInviteDialogComponent, {
      width: '400px',
      data: { projectId: this.project.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMembers(this.project!.id);
      }
    });
  }

  openEditDialog() {
    if (!this.project) return;

    const dialogRef = this.dialog.open(ProjectFormComponent, {
      width: '600px',
      data: this.project
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.project = result;
      }
    });
  }

  deleteProject() {
    if (!this.project) return;

    if (this.project.status === 'COMPLETED') {
      this.snackBar.open('Projetos concluídos não podem ser excluídos.', 'Fechar', { duration: 4000 });
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir o projeto "${this.project.name}" permanentemente? Todas as tarefas e configurações serão removidas.`)) {
      return;
    }

    this.projectService.deleteProject(this.project.id).subscribe({
      next: () => {
        this.snackBar.open('Projeto excluído com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/']);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Erro ao excluir projeto.';
        this.snackBar.open(errorMsg, 'Fechar', { duration: 4000 });
      }
    });
  }

  removeMember(memberId: number) {
    if (!this.project) return;
    if (confirm('Tem certeza que deseja remover este membro do projeto?')) {
      this.projectService.removeMember(this.project.id, memberId).subscribe({
        next: () => this.loadMembers(this.project!.id),
        error: (err: any) => this.snackBar.open(err.error?.message || 'Erro ao remover membro', 'Fechar', { duration: 3000 })
      });
    }
  }

  onBoardColorChange(event: Event) {
    if (!this.project) return;
    const input = event.target as HTMLInputElement;
    const newColor = input.value;
    this.project.backgroundColor = newColor; // optimistic update
    this.projectService.updateProjectBackground(this.project.id, newColor).subscribe({
      error: () => this.snackBar.open('Erro ao atualizar a cor de fundo', 'Fechar', { duration: 3000 })
    });
  }
}
