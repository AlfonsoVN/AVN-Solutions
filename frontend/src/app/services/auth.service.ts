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
  private refreshTokenTimeout: any;

  constructor(private http: HttpClient) {
    if (this.isLoggedIn()) {
      this.startRefreshTokenTimer();
    }
  }

  // Guardar el token
  setToken(token: string): void {
    localStorage.setItem('access_token', token);
    this.startRefreshTokenTimer();
  }
  

  // Obtener el token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Borrar el token
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.stopRefreshTokenTimer();
  }

  // Verificar si el token es válido
  isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post(`${this.baseUrl}/token/refresh/`, { refresh: refreshToken }).pipe(
      map((tokens: any) => {
        this.setToken(tokens.access);
        return tokens;
      })
    );
  }


  private startRefreshTokenTimer() {
    const token = this.getToken();
    if (token) {
      const expires = this.jwtHelper.getTokenExpirationDate(token);
      const timeout = expires!.getTime() - Date.now() - (60 * 1000); // Renovar 1 minuto antes de que expire
      this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }
  }
  
  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
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