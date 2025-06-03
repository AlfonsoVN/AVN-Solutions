// user-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-modal',
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UserModalComponent {
  @Input() user: any = {};
  @Input() title: string = '';
  @Input() isEditing: boolean = false; // New input to determine if we're editing or adding
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  password: string = ''; // New property to hold the password

  onSave() {
    const userData = { ...this.user };
    if (!this.isEditing && this.password) {
      userData.password = this.password;
    }
    console.log('Saving user:', userData);
    this.save.emit(userData);
  }

  onClose() {
    this.close.emit();
  }
}
