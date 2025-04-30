import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css']
})
export class ChatBotComponent implements OnInit {
  databaseId: string | null = null;
  messages: {role: string, content: string}[] = [];
  newMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.databaseId = this.route.snapshot.paramMap.get('id');
    this.initializeChat();
  }

  initializeChat() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    this.http.post('/api/chat_view/', { 
      prompt: 'initialize',
      databaseId: this.databaseId
    }, { headers }).subscribe({
      next: (response: any) => {
        console.log('Respuesta inicial recibida:', response);
        this.messages.push({role: 'assistant', content: response.response});
      },
      error: (error) => {
        console.error('Error al inicializar el chat:', error);
        this.messages.push({role: 'assistant', content: 'Lo siento, hubo un error al inicializar el chat.'});
      }
    });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({role: 'user', content: this.newMessage});
      
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.getToken()}`
      });
  
      this.http.post('/api/chat_view/', { 
        prompt: this.newMessage,
        databaseId: this.databaseId
      }, { headers }).subscribe({
        next: (response: any) => {
          console.log('Respuesta recibida:', response);
          this.messages.push({role: 'assistant', content: response.response});
          this.newMessage = '';
        },
        error: (error) => {
          console.error('Error en la solicitud:', error);
          this.messages.push({role: 'assistant', content: 'Lo siento, hubo un error al procesar tu solicitud.'});
        }
      });
    }
  }
  
  
}
