import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MemberInviteDialogComponent } from './member-invite-dialog/member-invite-dialog.component';
import { KanbanBoardComponent } from './kanban-board/kanban-board.component';
import { ProjectFormComponent } from '../project-form/project-form.component';

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
    private projectService: ProjectService,
    private dialog: MatDialog
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
    // A service call for members will be needed. Adding directly to ProjectService later.
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

  removeMember(memberId: number) {
    if (!this.project) return;
    if (confirm('Tem certeza que deseja remover este membro do projeto?')) {
      this.projectService.removeMember(this.project.id, memberId).subscribe({
        next: () => this.loadMembers(this.project!.id),
        error: (err: any) => alert(err.error?.message || 'Erro ao remover membro')
      });
    }
  }
}
