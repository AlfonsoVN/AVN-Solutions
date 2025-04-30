import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-connections-list',
  standalone: true,
  templateUrl: './connections-list.component.html',
  styleUrls: ['./connections-list.component.css'],
  imports: [CommonModule, FormsModule],
})
export class ConnectionsListComponent implements OnInit {
  connections: any[] = [];
  isEditModalOpen = false;
  editConnectionData: any = {};
  hasToken = false;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.hasToken = this.authService.isLoggedIn();
    if (this.hasToken) {
      this.getConnections().subscribe((data: any[]) => {
        this.connections = data;
      });
    }
  }

  getConnections(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.get<any[]>('http://localhost:8000/api/get-connections/', { headers });
  }

  editConnection() {
    if (this.editConnectionData) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`
      });
      this.http
        .put<any>(`http://localhost:8000/api/edit-connection/${this.editConnectionData.id}/`, this.editConnectionData, { headers })
        .subscribe({
          next: () => {
            alert('Conexión actualizada correctamente');
            this.getConnections().subscribe((data: any[]) => {
              this.connections = data;
            });
            this.closeEditModal();
          },
          error: (err) => {
            alert('Error al actualizar la conexión: ' + err.message);
          },
        });
    }
  }

  openEditModal(connection: any) {
    this.editConnectionData = { ...connection };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  deleteConnection(id: number): void {
    const confirmation = window.confirm("¿Estás seguro de que deseas eliminar esta conexión?");
    
    if (confirmation) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`
      });
      this.http.delete(`http://localhost:8000/api/delete-connection/${id}/`, { headers }).subscribe({
        next: () => {
          this.connections = this.connections.filter(conexion => conexion.id !== id);
          alert('Conexión eliminada correctamente');
        },
        error: (err) => {
          alert('Error al eliminar la conexión: ' + err.message);
        }
      });
    }
  }
}
