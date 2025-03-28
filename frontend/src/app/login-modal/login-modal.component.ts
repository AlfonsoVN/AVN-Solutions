import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent {
  isModalOpen: boolean = false;
  userData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private http: HttpClient) {}

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  registerUser() {
    if (this.userData.password !== this.userData.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    this.http.post('http://localhost:8000/api/register/', this.userData).subscribe(
      (response) => {
        alert('Usuario creado correctamente');
        this.closeModal();
      },
      (error) => {
        alert('Error al crear el usuario: ' + error.message);
      }
    );
  }
}
