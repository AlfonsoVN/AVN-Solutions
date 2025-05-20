// modal.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private signInSubject = new Subject<void>();
  private registerSubject = new Subject<void>();

  signInClicked$ = this.signInSubject.asObservable();
  registerClicked$ = this.registerSubject.asObservable();

  openSignInModal() {
    this.signInSubject.next();
  }

  openRegisterModal() {
    this.registerSubject.next();
  }
}
