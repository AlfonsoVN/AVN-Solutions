import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-connections-list',
  standalone: true,
  templateUrl: './connections-list.component.html',
  styleUrls: ['./connections-list.component.css'],
  imports: [CommonModule],
})
export class ConnectionsListComponent {
  connections: any[] = [];  // Aquí definimos la propiedad 'connections'

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
}
