import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // Este es el módulo necesario para ngClass
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,  // Este es un componente standalone
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],  // Asegúrate de incluir CommonModule aquí
})
export class NavbarComponent {
    isModalOpen: boolean = false;
    userData = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
  
    constructor(private http: HttpClient, private router: Router) {}
  
    openLoginModal() {
      this.isModalOpen = true;
    }
  
    closeLoginModal() {
      this.isModalOpen = false;
    }
  
    registerUser() {
      if (this.userData.password !== this.userData.confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
      }
  
      // Llamada HTTP para registrar al usuario
      this.http.post('http://localhost:8000/api/register/', this.userData)
        .subscribe(
          (response) => {
            console.log('Usuario registrado:', response);
            this.closeLoginModal();
            alert('Usuario registrado correctamente');
          },
          (error) => {
            console.error('Error al registrar usuario:', error);
            alert('Hubo un error al registrar el usuario.');
          }
        );
    }
}
