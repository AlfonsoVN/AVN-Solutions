import { Component, inject } from '@angular/core';
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
export class ConnectionsListComponent {
  connections: any[] = [];  // Aquí definimos la propiedad 'connections'
  isEditModalOpen = false;
  editConnectionData: any = {};

  constructor(private http: HttpClient) {
    // Aquí puedes hacer la lógica para obtener las conexiones desde el backend
    this.getConnections().subscribe((data: any[]) => {
      this.connections = data;  // Asignamos los datos a 'connections'
    });
  }

  getConnections(): Observable<any[]> {
    // Reemplaza con la URL real del endpoint que te devuelve las conexiones
    return this.http.get<any[]>('http://localhost:8000/api/get-connections/');
  }

  editConnection() {
    if (this.editConnectionData) {
      this.http
        .put<any>(`http://localhost:8000/api/edit-connection/${this.editConnectionData.id}/`, this.editConnectionData)
        .subscribe({
          next: (response) => {
            alert('Conexión actualizada correctamente');
            this.getConnections().subscribe((data: any[]) => {
              this.connections = data;
            });
            this.closeEditModal(); // Cerramos el modal después de la actualización
          },
          error: (err) => {
            alert('Error al actualizar la conexión: ' + err.message);
          },
        });
    }
  }

  openEditModal(connection: any) {
    this.editConnectionData = { ...connection }; // Clonamos la conexión para editarla
    this.isEditModalOpen = true; // Abrimos el modal
  }

  closeEditModal() {
    this.isEditModalOpen = false; // Cerramos el modal
  }


  deleteConnection(id: number): void {
    // Hacer la solicitud DELETE al backend para eliminar la conexión
    const confirmation = window.confirm("¿Estás seguro de que deseas eliminar esta conexión?");
    
    if (confirmation) {
      // Si el usuario confirma, hacemos la solicitud DELETE al backend
      this.http.delete(`http://localhost:8000/api/delete-connection/${id}/`).subscribe({
        next: () => {
          // Filtramos la lista para eliminar la conexión de la UI
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
