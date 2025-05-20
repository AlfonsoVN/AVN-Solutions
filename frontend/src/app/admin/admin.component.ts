import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminService } from '../services/admin.service';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

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
  authService: any;
  http: any;
  users: User[] = [];

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
        // Aquí puedes manejar el error, por ejemplo, mostrando un mensaje al usuario
      }
    });
  }
  

  getDangerousQueries(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.get('/api/dangerous-queries/', { headers });
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
  

  editUser(user: any) {
    // Implementa la lógica para editar un usuario
    console.log('Editar usuario:', user);
  }

  deleteUser(user: any) {
    // Implementa la lógica para eliminar un usuario
    console.log('Eliminar usuario:', user);
  }
}
