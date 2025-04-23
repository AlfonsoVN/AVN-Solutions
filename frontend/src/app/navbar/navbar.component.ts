import { Component, OnInit } from '@angular/core'; // ← Agregamos OnInit
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ChangeDetectorRef } from '@angular/core';



@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
})
export class NavbarComponent implements OnInit { // ← implementamos OnInit
  isSignInModalOpen = false;
  isRegisterModalOpen = false;

  userData = {
    name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  currentUser: string | null = null; // ← NUEVO

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.currentUser = decoded.username || decoded.email; // ← Ajusta según lo que incluya tu token
    }
  }

  openSignInModal() {
    this.isSignInModalOpen = true;
  }

  closeSignInModal() {
    this.isSignInModalOpen = false;
  }

  openRegisterModal() {
    this.isRegisterModalOpen = true;
  }

  closeRegisterModal() {
    this.isRegisterModalOpen = false;
  }

  registerUser() {
    if (this.userData.password !== this.userData.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    this.http.post('http://localhost:8000/api/register/', this.userData)
      .subscribe(
        (response) => {
          console.log('Usuario registrado:', response);
          this.closeRegisterModal();
          alert('Usuario registrado correctamente');
        },
        (error) => {
          console.error('Error al registrar usuario:', error);
          alert('Hubo un error al registrar el usuario.');
        }
      );
  }

  signInUser() {
    const loginPayload = {
      username: this.userData.email,
      password: this.userData.password
    };
  
    this.http.post<any>('http://localhost:8000/api/token/', loginPayload)
      .subscribe(
        response => {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
  
          const decoded: any = jwtDecode(response.access);
          const userId = decoded.user_id;
  
          // Ahora haces una solicitud para obtener la información del usuario
          this.http.get<any>(`http://localhost:8000/api/user/${userId}/`) // Asegúrate de tener esta API
            .subscribe(
              userResponse => {
                this.currentUser = userResponse.email; // O usa otro campo como userResponse.name si lo prefieres
                console.log('Usuario conectado:', this.currentUser);
  
                alert('Sesión iniciada correctamente');
                this.closeSignInModal();
                this.router.navigate(['/']);
              },
              error => {
                console.error('Error al obtener el usuario:', error);
                alert('Hubo un error al obtener los datos del usuario.');
              }
            );
        },
        error => {
          console.error('Error en inicio de sesión:', error);
          alert('Credenciales incorrectas. Inténtalo de nuevo.');
        }
      );
  }
  

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUser = null;
    this.router.navigate(['/']);
  }
}
