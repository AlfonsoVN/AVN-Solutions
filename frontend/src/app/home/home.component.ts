import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';  // Agregar esta importación
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],  // Asegúrate de agregar RouterModule aquí
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(
    private router: Router,
    private authService: AuthService,
    private modalService: ModalService
  ) {}

  showLoginAlert: boolean = false;

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  navigate(path: string): void {
    if (path === '/add-connection' && !this.isLoggedIn()) {
      // Si el usuario no está logueado y trata de acceder a 'add-connection', abre el modal de inicio de sesión
      this.modalService.openSignInModal();
    } else {
      // Para otras rutas o si el usuario está logueado, permite la navegación
      this.router.navigate([path]);
    }
  }
  

  navigateOrLogin(path: string): void {
    if (this.isLoggedIn()) {
      this.navigate(path);
    } else {
      // Si no está logueado, abre el modal de inicio de sesión
      this.modalService.openSignInModal();
    }
  }

  openSignInModal(): void {
    this.showLoginAlert = false;
    this.modalService.openSignInModal();
  }

  openRegisterModal(): void {
    this.modalService.openRegisterModal();
  }

  handleAddConnection(): void {
    if (this.isLoggedIn()) {
      this.router.navigate(['/add-connection']);
    } else {
      this.showLoginAlert = true;
    }
  }

  closeLoginAlert(): void {
    this.showLoginAlert = false;
  }
}
