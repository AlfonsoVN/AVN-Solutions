import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { ModalService } from '../services/modal.service';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { NotificationComponent } from '../notification/notification.component';


@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule, NotificationComponent],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isSignInModalOpen = false;
  isRegisterModalOpen = false;
  currentUserEmail: string | null = null;
  isAdmin: boolean = false;
  showNotification = false;
  notificationMessage = '';
  notificationSuccess = true;
  private userSubscription: Subscription = new Subscription();
  private modalSubscription: Subscription = new Subscription();


  userData = {
    name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  constructor(private route: ActivatedRoute, private router: Router, private authService: AuthService, private modalService: ModalService,  private notificationService: NotificationService) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUserEmail = user?.email || null;
      this.isAdmin = this.authService.isAdmin();
    });

    if (this.authService.isLoggedIn()) {
      this.authService.getUserData().subscribe();
    }
    this.modalSubscription.add(
      this.modalService.signInClicked$.subscribe(() => {
        this.isSignInModalOpen = true;
      })
    );
  
    this.modalSubscription.add(
      this.modalService.registerClicked$.subscribe(() => {
        this.isRegisterModalOpen = true;
      })
    );

    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'signin') {
        this.openSignInModal();
      } else if (params['action'] === 'register') {
        this.openRegisterModal();
      }
    });
  
  
  }

  showNotificationMessage(message: string, success: boolean) {
    this.notificationMessage = message;
    this.notificationSuccess = success;
    this.showNotification = true;
    this.notificationService.showNotification(message, success);
    setTimeout(() => {
      this.showNotification = false;
    }, 3000); // La notificación desaparecerá después de 3 segundos
  }
  
  

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      this.modalSubscription.unsubscribe();
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
      this.showNotificationMessage('Las contraseñas no coinciden.', false);
      return;
    }

    fetch('http://localhost:8000/api/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.userData),
    })
      .then(res => {
        if (res.ok) {
          this.closeRegisterModal();
          this.notificationService.showNotification('Usuario registrado correctamente', true);
        } else {
          throw new Error('Registro fallido');
        }
      })
      .catch((error) => {
        console.error('Error en el registro:', error);
        this.notificationService.showNotification('Hubo un error al registrar el usuario.', false);
      });
  }

  signInUser() {
    const loginPayload = {
      username: this.userData.email,
      password: this.userData.password,
    };

    fetch('http://localhost:8000/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload),
    })
      .then(res => res.json())
      .then(tokens => {
        if (tokens.access) {
          this.authService.setToken(tokens.access);
          localStorage.setItem('refresh_token', tokens.refresh);
          this.authService.getUserData().subscribe(() => {
            this.notificationService.showNotification('Sesión iniciada correctamente', true);
            this.closeSignInModal();
            this.router.navigate(['/']);
          });
        } else {
          throw new Error('Login fallido');
        }
      })
      .catch(() => {
        this.notificationService.showNotification('Credenciales incorrectas. Inténtalo de nuevo.', false);
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}