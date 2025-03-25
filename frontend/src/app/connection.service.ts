import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConexionService {
  apiUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) {}

  // Método para obtener el token CSRF desde las cookies
  private getCSRFToken(): string {
    const name = 'csrftoken=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  // Método para comprobar la conexión con CSRF Token
  comprobarConexion(data: any): Observable<any> {
    const csrfToken = this.getCSRFToken();  // Obtener el token CSRF desde la cookie
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,  // Incluir el token CSRF en las cabeceras
    });

    return this.http.post(`${this.apiUrl}comprobar_conexion/`, data, { headers });
  }

  // Método para añadir una conexión con CSRF Token
  añadirConexion(data: any): Observable<any> {
    const csrfToken = this.getCSRFToken();  // Obtener el token CSRF desde la cookie
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,  // Incluir el token CSRF en las cabeceras
    });

    return this.http.post(`${this.apiUrl}añadir_conexion/`, data, { headers });
  }
}
