import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ModalService } from '../services/modal.service';

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
  testConnection = {
    id: 'test',
    name: 'Conexión de Prueba',
    host: 'localhost',
    db_type: 'MySQL',
    port: 3306,
    dbname: 'zoodb',
    user: 'root',
    password: 'root'
  };

  constructor(private http: HttpClient, private authService: AuthService, private modalService: ModalService) {}

  ngOnInit(): void {
    this.hasToken = this.authService.isLoggedIn();
    if (this.hasToken) {
      this.getConnections().subscribe({
        next: (data: any[]) => {
          this.connections = data;
        },
        error: (err) => {
          console.error('Error al cargar conexiones:', err);
          this.showNotification('Error al cargar conexiones', 'error');
        }
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
      const dataToSend = {
        ...this.editConnectionData,
        name: this.editConnectionData.name  // Envía solo el nombre actualizado
      };
  
      delete dataToSend.originalEmail; // Eliminar el campo adicional antes de enviar
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`
      });
  
      this.http
        .put<any>(`http://localhost:8000/api/edit-connection/${this.editConnectionData.id}/`, dataToSend, { headers })
        .subscribe({
          next: (response) => {
            console.log('Respuesta del servidor:', response);
            if (response && response.mensaje) {
              this.showNotification(response.mensaje, 'success');
              // Actualizar la conexión en el array local
              const index = this.connections.findIndex(c => c.id === this.editConnectionData.id);
              if (index !== -1) {
                this.connections[index] = response.conexion;
              }
              this.closeEditModal();
              // Opcional: recargar todas las conexiones
              this.getConnections().subscribe((data: any[]) => {
                this.connections = data;
              });
            } else {
              this.showNotification('Error al actualizar la conexión: Respuesta inesperada del servidor', 'error');
            }
          },
          error: (err) => {
            console.error('Error al actualizar la conexión:', err);
            this.showNotification('Error al actualizar la conexión: ' + (err.error?.mensaje || err.message || 'Error desconocido'), 'error');
          },
        });
    }
  }
  
  
  
  
  
  showNotification(message: string, type: 'success' | 'error') {
    // Implementa esta función para mostrar notificaciones
    // Puedes usar un servicio de notificaciones o una librería como ngx-toastr
    console.log(`${type.toUpperCase()}: ${message}`);
  }
  

  openSignInModal(event: Event) {
    event.preventDefault();
    this.modalService.openSignInModal();
  }

  openRegisterModal(event: Event) {
    event.preventDefault();
    this.modalService.openRegisterModal();
  }

  openEditModal(connection: any) {
    if (this.hasToken) {
      const [email, name] = connection.name.split(' ~ ');
      this.editConnectionData = { 
        ...connection,
        originalEmail: email,
        name: name // Solo el nombre de la conexión para editar
      };
      this.isEditModalOpen = true;
    } else {
      alert('Inicia sesión para editar conexiones.');
    }
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editConnectionData = {}; // Resetea los datos de edición
  }
  

  deleteConnection(id: number | string): void {
    if (id === 'test') {
      alert('Esta es una conexión de prueba y no puede ser eliminada. Inicia sesión para gestionar conexiones reales.');
      return;
    }
  
    if (!this.hasToken) {
      alert('Inicia sesión para eliminar conexiones.');
      return;
    }
  
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
          console.error('Error al eliminar la conexión:', err);
          if (err.status === 404) {
            alert('La conexión no fue encontrada. Puede que ya haya sido eliminada.');
          } else {
            alert('Error al eliminar la conexión: ' + (err.error?.mensaje || err.message || 'Error desconocido'));
          }
        }
      });
    }
  }
  
}
