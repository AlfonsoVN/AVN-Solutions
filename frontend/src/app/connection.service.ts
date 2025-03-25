// conexion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConexionService {
  apiUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) {}

  comprobarConexion(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}comprobar_conexion/`, data);
  }

  añadirConexion(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}añadir_conexion/`, data);
  }
}
