// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8000/api';
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {}

  // Guardar el token
  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  // Obtener el token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Borrar el token
  logout(): void {
    localStorage.removeItem('access_token');
  }

  // Verificar si el token es válido
  isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  // Obtener el ID del usuario desde el token
  getUserIdFromToken(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.jwtHelper.decodeToken(token);
    return decoded?.user_id ?? null;
  }

  getUserNameFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.jwtHelper.decodeToken(token);
    return decoded?.username ?? null;
  }

  // Obtener datos del usuario desde el backend
  getUserData(): Observable<any> {
    const userId = this.getUserIdFromToken();
    const token = this.getToken();
    const username = this.getUserNameFromToken();

    if (!userId || !token) return of(null);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}/user/${userId}/`, { headers }).pipe(
      catchError(err => {
        console.error('Error obteniendo usuario:', err);
        return of(null);
      })
    );
  }
}