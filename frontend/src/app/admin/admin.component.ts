import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminService } from '../services/admin.service';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_superuser: boolean;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe]
})
export class AdminComponent implements OnInit {
  dangerousQueries: any[] = [];
  users: User[] = [];
  currentPageQueries = 1;
  currentPageUsers = 1;
  itemsPerPage = 8;
  @ViewChild('dangerousQueries') dangerousQueriesSection!: ElementRef;
  @ViewChild('userManagement') userManagementSection!: ElementRef;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDangerousQueries();
    this.loadUsers();
  }

  loadDangerousQueries() {
    this.adminService.getDangerousQueries().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.dangerousQueries = data;
      },
      error: (error) => {
        console.error('Error al obtener consultas peligrosas:', error);
      }
    });
  }

  loadUsers() {
    console.log('Cargando usuarios...');
    this.adminService.getUsers().subscribe({
      next: (data: User[]) => {
        console.log('Usuarios recibidos:', data);
        this.users = data;
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    });
  }

  get paginatedUsers() {
    const startIndex = (this.currentPageUsers - 1) * this.itemsPerPage;
    return this.users.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  get totalPagesUsers() {
    return Math.ceil(this.users.length / this.itemsPerPage);
  }
  
  get paginatedQueries() {
    const startIndex = (this.currentPageQueries - 1) * this.itemsPerPage;
    return this.dangerousQueries.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  get totalPagesQueries() {
    return Math.ceil(this.dangerousQueries.length / this.itemsPerPage);
  }
  
  pageRangeQueries(): (number | string)[] {
    return this.generatePageRange(this.currentPageQueries, this.totalPagesQueries);
  }

  pageRangeUsers(): (number | string)[] {
    return this.generatePageRange(this.currentPageUsers, this.totalPagesUsers);
  }

  generatePageRange(currentPage: number, totalPages: number): (number | string)[] {
    const range: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      if (currentPage <= 3) {
        range.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        range.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        range.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return range;
  }

  prevPageQueries() {
    if (this.currentPageQueries > 1) {
      this.currentPageQueries--;
    }
  }

  nextPageQueries() {
    if (this.currentPageQueries < this.totalPagesQueries) {
      this.currentPageQueries++;
    }
  }

  goToPageQueries(page: number | string) {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPagesQueries) {
      this.currentPageQueries = page;
    }
  }

  prevPageUsers() {
    if (this.currentPageUsers > 1) {
      this.currentPageUsers--;
    }
  }

  nextPageUsers() {
    if (this.currentPageUsers < this.totalPagesUsers) {
      this.currentPageUsers++;
    }
  }

  goToPageUsers(page: number | string) {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPagesUsers) {
      this.currentPageUsers = page;
    }
  }

  editUser(user: User) {
    console.log('Editar usuario:', user);
    // Implement edit user logic
  }

  deleteUser(user: User) {
    console.log('Eliminar usuario:', user);
    // Implement delete user logic
  }

  scrollTo(elementId: string, event: Event) {
    event.preventDefault();
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
