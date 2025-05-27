// notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<{show: boolean, message: string, success: boolean}>({show: false, message: '', success: true});
  public notification$ = this.notificationSubject.asObservable();

  showNotification(message: string, success: boolean) {
    this.notificationSubject.next({show: true, message, success});
    setTimeout(() => {
      this.notificationSubject.next({show: false, message: '', success: true});
    }, 3000);
  }
}
