import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-start-chat',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './start-chat.component.html',
  styleUrls: ['./start-chat.component.css']
})
export class StartChatComponent implements OnInit {
  databases: any[] = [];
  selectedDatabase: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDatabases();
  }

  loadDatabases() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    this.http.get<any[]>('http://localhost:8000/api/get-connections/', { headers })
      .subscribe({
        next: (data) => {
          this.databases = data;
        },
        error: (error) => {
          console.error('Error loading databases:', error);
        }
      });
  }

  startChat() {
    if (this.selectedDatabase) {
      this.router.navigate(['/chat-bot', this.selectedDatabase]);
    }
  }
}
