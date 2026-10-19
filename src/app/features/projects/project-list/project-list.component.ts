import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatDialogModule,
    MatCardModule,
    MatSnackBarModule,
    MatTooltipModule,
    NotificationBellComponent,
    FormsModule
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  displayedColumns: string[] = ['name', 'status', 'startDate', 'endDate', 'actions'];
  
  totalElements = 0;
  pageSize = 12;
  pageIndex = 0;
  searchQuery = '';

  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects(this.pageIndex, this.pageSize, this.searchQuery)
      .subscribe({
        next: (response) => {
          this.projects = response.content;
          this.totalElements = response.totalElements;
        },
        error: (err) => console.error('Erro ao carregar projetos', err)
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProjects();
  }

  onSearch() {
    this.pageIndex = 0;
    this.loadProjects();
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(ProjectFormComponent, {
      width: '500px',
      data: null // null means create mode
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects(); // Reload list if project was created
      }
    });
  }

  deleteProject(event: Event, project: Project) {
    event.stopPropagation();

    if (project.status === 'COMPLETED') {
      this.snackBar.open('Projetos concluídos não podem ser excluídos.', 'Fechar', { duration: 4000 });
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir o projeto "${project.name}" permanentemente?`)) {
      return;
    }

    this.projectService.deleteProject(project.id).subscribe({
      next: () => {
        this.snackBar.open('Projeto excluído com sucesso!', 'Fechar', { duration: 3000 });
        this.loadProjects();
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Erro ao excluir projeto.';
        this.snackBar.open(errorMsg, 'Fechar', { duration: 4000 });
      }
    });
  }
}
