// add-connection.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-add-connection',
  standalone: true,
  templateUrl: './add-connection.component.html',
  styleUrls: ['./add-connection.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class AddConnectionComponent {  // Cambiado el nombre de la clase
  conexionForm: FormGroup;
  apiUrl = 'https://avn-solutions.onrender.com/api/test_connection/'; // Endpoint de Django
  connectionSuccessful: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private authService: AuthService) {
    this.conexionForm = this.fb.group({
      name: ['', Validators.required],
      host: ['fa151c6ae79530b080304dd41de73dd2.serveo.net', Validators.required],
      db_type: ['', Validators.required],
      port: [80, Validators.required],
      dbname: ['', Validators.required],
      user: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  comprobarConexion() {
    if (this.conexionForm.valid) {
      const headers = this.getHeaders();
      console.log(this.conexionForm.value);
      
      this.http.post<{ exito: boolean }>(this.apiUrl, this.conexionForm.value, { headers }).subscribe({
        next: (response) => {
          if (response.exito) {
            alert('Conexión exitosa');
            this.connectionSuccessful = true;  // Se marca como exitosa
          } else {
            alert('Error al conectar');
            this.connectionSuccessful = false;  // En caso de error
          }
        },
        error: (err) => {
          console.error('Error completo:', err);
          let errorMsg = 'Error en la solicitud';
          if (err.error && err.error.mensaje) {
            errorMsg += ': ' + err.error.mensaje;
          } else if (err.message) {
            errorMsg += ': ' + err.message;
          }
          alert(errorMsg);
          this.connectionSuccessful = false;  // En caso de error en la solicitud
        },
      });
    } else {
      alert('Por favor, rellene todos los campos');
    }
  }

  anadirConexion() {
    if (this.conexionForm.valid && this.connectionSuccessful) {
      const headers = this.getHeaders();
  
      this.http.post<{ exito: boolean, mensaje?: string }>(
        'https://avn-solutions.onrender.com/api/anadir_conexion/',
        this.conexionForm.value, // Convertimos a JSON
        { headers }
      ).subscribe({
        next: (response) => {
          if (response.exito) {
            alert('Conexión añadida correctamente');
            this.conexionForm.reset();
            this.connectionSuccessful = false;  // Reiniciar el estado
          } else {
            alert('Error al añadir conexión: ' + (response.mensaje || 'Desconocido'));
          }
        },
        error: (err) => {
          alert('Error en la solicitud: ' + err.message);
        },
      });
    } else {
      alert('Por favor, complete todos los campos antes de añadir la conexión.');
    }
}
  

}