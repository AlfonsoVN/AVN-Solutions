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
  apiUrl = 'http://localhost:8000/api/test_connection/'; // Endpoint de Django
  connectionSuccessful: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.conexionForm = this.fb.group({
      name: ['', Validators.required],
      host: ['', Validators.required],
      db_type: ['', Validators.required],
      port: ['', Validators.required],
      dbname: ['', Validators.required],
      user: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  comprobarConexion() {
    if (this.conexionForm.valid) {
      const headers = { 'Content-Type': 'application/json' };
      console.log(this.conexionForm.value);
      
      this.http.post<{ exito: boolean }>(this.apiUrl, this.conexionForm.value).subscribe({
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
          alert('Error en la solicitud: ' + err.message);
          this.connectionSuccessful = false;  // En caso de error en la solicitud
        },
      });
    } else {
      alert('Por favor, rellene todos los campos');
    }
  }

  anadirConexion() {
    if (this.conexionForm.valid && this.connectionSuccessful) {
      const headers = { 'Content-Type': 'application/json' };
  
      this.http.post<{ exito: boolean, mensaje?: string }>(
        'http://localhost:8000/api/anadir_conexion/',
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