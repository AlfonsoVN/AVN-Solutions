// add-connection.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-connection',
  standalone: true,
  templateUrl: './add-connection.component.html',
  styleUrls: ['./add-connection.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class AddConnectionComponent {  // Cambiado el nombre de la clase
  conexionForm: FormGroup;
  apiUrl = 'http://localhost:8000/api/comprobar_conexion/'; // Endpoint de Django

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.conexionForm = this.fb.group({
      host: ['', Validators.required],
      puerto: ['', Validators.required],
      dbname: ['', Validators.required],
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required],
    });
  }

  comprobarConexion() {
    if (this.conexionForm.valid) {
      this.http.post<{ exito: boolean }>(this.apiUrl, this.conexionForm.value).subscribe({
        next: (response) => {
          if (response.exito) {
            alert('Conexión exitosa');
          } else {
            alert('Error al conectar');
          }
        },
        error: (err) => {
          alert('Error en la solicitud: ' + err.message);
        },
      });
    } else {
      alert('Por favor, rellene todos los campos');
    }
  }

  anadirConexion() {
    // Lógica para añadir la conexión al backend
  }
}
