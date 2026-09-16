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
import { FormsModule } from '@angular/forms';
import { ProjectFormComponent } from '../project-form/project-form.component';

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
    FormsModule
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  displayedColumns: string[] = ['name', 'status', 'startDate', 'endDate', 'actions'];
  
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  searchQuery = '';

  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog
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
}
