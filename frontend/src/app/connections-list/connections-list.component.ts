import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const token = localStorage.getItem('access');
    this.hasToken = !!token;

    if (this.hasToken) {
      this.getConnections().subscribe((data: any[]) => {
        this.connections = data;
      });
    }
  }

  getConnections(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8000/api/get-connections/');
  }

  editConnection() {
    if (this.editConnectionData) {
      this.http
        .put<any>(`http://localhost:8000/api/edit-connection/${this.editConnectionData.id}/`, this.editConnectionData)
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
      this.http.delete(`http://localhost:8000/api/delete-connection/${id}/`).subscribe({
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
