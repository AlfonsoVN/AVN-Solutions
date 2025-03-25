import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';  // Agregar esta importación

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],  // Asegúrate de agregar RouterModule aquí
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // Tu lógica aquí
}
