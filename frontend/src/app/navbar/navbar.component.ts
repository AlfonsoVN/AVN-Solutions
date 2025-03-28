import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
})
export class NavbarComponent {
    // Variable para controlar si el modal está abierto
  isModalOpen: boolean = false;

  // Datos del formulario
  userData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  // Método para abrir el modal
  openLoginModal() {
    this.isModalOpen = true;
  }

  // Método para cerrar el modal
  closeLoginModal() {
    this.isModalOpen = false;
  }

  // Método para manejar la creación de usuario (por ejemplo, haciendo una solicitud HTTP)
  registerUser() {
    if (this.userData.password !== this.userData.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Aquí iría la lógica para enviar los datos al backend y registrar al usuario
    console.log('Usuario registrado:', this.userData);

    // Después de registrar al usuario, cerramos el modal
    this.closeLoginModal();
  }
}
