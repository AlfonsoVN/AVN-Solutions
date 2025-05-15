import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Chart, ChartConfiguration, ChartType } from 'chart.js/auto';

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css']
})
export class ChatBotComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('inputArea') inputArea!: ElementRef;

  databaseId: string | null = null;
  selectedConnectionId: string | null = null;
  connections: any[] = [];
  messages: {role: string, content: string, sqlResult?: SafeHtml}[] = [];
  newMessage: string = '';
  chart: Chart | null = null;
  dangerousQuery: string | null = null;
  chats: { id: string, name: string }[] = [];
  currentChatId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {
    document.addEventListener('executeDangerousQuery', () => this.executeDangerousQuery());
  }

  ngOnInit() {
    this.loadConnections();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.selectedConnectionId = id;
        this.loadChatsForConnection(id);
      }
    });
  }
  
  loadConnections() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  
    this.http.get<any[]>('http://localhost:8000/api/get-connections/', { headers })
      .subscribe({
        next: (data) => {
          this.connections = data;
          if (this.connections.length > 0 && !this.selectedConnectionId) {
            this.onConnectionChange(this.connections[0].id);
          }
        },
        error: (error) => {
          console.error('Error loading connections:', error);
        }
      });
  }
  
  onConnectionChange(connectionId: string) {
    this.router.navigate(['/chat-bot', connectionId]);
  }
  
  loadChatsForConnection(connectionId: string) {
    this.selectedConnectionId = connectionId;
    this.chats = [];
    this.messages = [];
    this.currentChatId = null;
    this.databaseId = connectionId;
  
    this.loadChats();
    if (this.chats.length === 0) {
      this.createNewChat();
    } else {
      this.loadChat(this.chats[0].id);
    }
  }
  
  
  loadChats() {
    const savedChats = localStorage.getItem(`chats_${this.databaseId}`);
    if (savedChats) {
      this.chats = JSON.parse(savedChats);
    }
  }

  saveChats() {
    localStorage.setItem(`chats_${this.databaseId}`, JSON.stringify(this.chats));
  }
  
  createNewChat() {
    const chatId = Date.now().toString();
    const chatName = `Chat ${this.chats.length + 1}`;
    this.chats.push({ id: chatId, name: chatName });
    this.saveChats();
    this.loadChat(chatId);
  }

  private lastLoadedChatId: string | null = null;

  loadChat(chatId: string) {
    if (this.lastLoadedChatId === chatId) {
      console.log('Chat ya cargado, evitando recarga');
      return;
    }
    console.log('Cargando chat:', chatId);
    this.lastLoadedChatId = chatId;
    this.currentChatId = chatId;
    this.loadMessagesFromLocalStorage();
    console.log('Mensajes cargados:', this.messages);
    if (this.messages.length === 0) {
      console.log('Inicializando chat nuevo');
      this.initializeChat();
    }
  }

  private loadMessagesFromLocalStorage() {
    const savedMessages = localStorage.getItem(`chat_messages_${this.selectedConnectionId}_${this.currentChatId}`);
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      this.messages = parsedMessages.map((message: any) => ({
        ...message,
        sqlResult: message.sqlResult ? this.sanitizer.bypassSecurityTrustHtml(message.sqlResult) : undefined
      }));
    } else {
      this.messages = [];
    }
  }
  
  
  
  
  

  ngAfterViewInit() {
    this.setupInputInteraction();
  }

  setupInputInteraction() {
    const inputArea = this.inputArea.nativeElement;
    const chatContainer = this.chatContainer.nativeElement;

    inputArea.addEventListener('focus', () => {
      chatContainer.classList.add('fade-out');
    });

    inputArea.addEventListener('blur', () => {
      chatContainer.classList.remove('fade-out');
    });
  }


  initializeChat() {
    console.log('Iniciando chat');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  
    this.http.post('/api/chat_view/', { 
      prompt: 'initialize',
      databaseId: this.selectedConnectionId
    }, { headers }).subscribe({
      next: (response: any) => {
        console.log('Respuesta inicial recibida:', response);
        const welcomeMessage = response.response;
        const dbName = response.db_name;
        
        const initialMessage = {
          role: 'assistant', 
          content: welcomeMessage + "\n\nPuedes preguntarme sobre la estructura de la base de datos, hacer consultas o pedir ayuda para analizar los datos. ¿En qué te puedo ayudar hoy?"
        };
        
        this.messages.push(initialMessage);
        this.saveMessagesToLocalStorage();
      },
      error: (error) => {
        console.error('Error al inicializar el chat:', error);
        this.messages.push({role: 'assistant', content: 'Lo siento, hubo un error al inicializar el chat. Por favor, intenta recargar la página.'});
        this.saveMessagesToLocalStorage();
      }
    });
  }
  

  

  sendMessage() {
    if (this.newMessage.trim()) {
      const userMessage = {role: 'user', content: this.newMessage};
      this.messages.push(userMessage);
      
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.getToken()}`
      });
  
      this.http.post('/api/chat_view/', { 
        prompt: this.newMessage,
        databaseId: this.selectedConnectionId
      }, { headers }).subscribe({
        next: (response: any) => {
          console.log('Respuesta recibida:', response);
          let assistantMessage: any;
  
          if (response.needs_confirmation) {
            this.dangerousQuery = response.suggested_query;
            assistantMessage = {
              role: 'assistant',
              content: '',
              sqlResult: this.createConfirmationButton()
            };
          } else if (response.show_only_table && response.sql_result) {
            const tableHtml = this.createTable(response.sql_result);
            assistantMessage = {
              role: 'assistant',
              content: '',
              sqlResult: this.sanitizer.bypassSecurityTrustHtml(tableHtml)
            };
          } else if (response.response) {
            // Manejar respuestas de texto simples
            assistantMessage = {
              role: 'assistant',
              content: response.response
            };
          } else {
            // Para otros tipos de respuestas, no mostramos nada
            assistantMessage = {
              role: 'assistant',
              content: 'Lo siento, no pude procesar esa solicitud.'
            };
          }
  
          this.messages.push(assistantMessage);
          this.newMessage = '';
          this.saveMessagesToLocalStorage();
        },
        error: (error) => {
          console.error('Error en la solicitud:', error);
          const errorMessage = {
            role: 'assistant', 
            content: 'Lo siento, hubo un error al procesar tu solicitud.'
          };
          this.messages.push(errorMessage);
          this.saveMessagesToLocalStorage();
        }
      });
    }
  }
  
  
  
  
  
  // Método opcional para guardar mensajes en el almacenamiento local
  private saveMessagesToLocalStorage() {
    const messagesToSave = this.messages.map(message => ({
      ...message,
      sqlResult: message.sqlResult ? (message.sqlResult as any).changingThisBreaksApplicationSecurity : undefined
    }));
    localStorage.setItem(`chat_messages_${this.selectedConnectionId}_${this.currentChatId}`, JSON.stringify(messagesToSave));
  }
  
  
  
  

  visualizeData(data: any, type: string = 'auto') {
    if (typeof data === 'string') {
      return; // Si es un mensaje de éxito, no hacemos nada
    }

    if (type === 'auto') {
      type = this.determineVisualizationType(data);
    }

    if (type === 'table') {
      this.createTable(data);
    } else if (type === 'bar') {
      this.createBarChart(data);
    }
  }

  determineVisualizationType(data: any): string {
    if (data.columns && data.columns.length === 2 && data.rows && data.rows.every((row: any) => !isNaN(row[data.columns[1]]))) {
      return 'bar';
    }
    return 'table';
  }

  createTable(data: any): string {
    if (!data || !data.columns || !data.rows) {
      return '<p>No hay datos para mostrar.</p>';
    }
  
    let html = '<div class="custom-table-responsive"><div class="custom-table-container"><table class="custom-table">';
    html += '<thead><tr>';
    data.columns.forEach((column: string) => {
      html += `<th>${column}</th>`;
    });
    html += '</tr></thead><tbody>';
    data.rows.forEach((row: any) => {
      html += '<tr>';
      data.columns.forEach((column: string) => {
        html += `<td>${row[column]}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';
    
    return html;
  }
  
  
  createConfirmationButton(): SafeHtml {
    console.log('Creating confirmation button');
    const html = `
      <div style="color: #ff9800; margin-bottom: 10px; padding: 10px; background-color: rgba(255, 152, 0, 0.1); border-radius: 5px;">
        ⚠️ <strong>Advertencia:</strong> Esta acción es peligrosa y modificará permanentemente la base de datos. <br>
        ¿Está seguro de que desea continuar? Si es así, confirme haciendo clic en el siguiente botón.
      </div>
      <div style="margin-top: 10px;">
        <button 
          style="background-color: #dc3545; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;"
          onclick="document.dispatchEvent(new Event('executeDangerousQuery'))"
        >
          Ejecutar sentencia peligrosa
        </button>
      </div>
    `;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  
  
  
  
  
  

  executeDangerousQuery() {
    if (this.dangerousQuery) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authService.getToken()}`
      });
  
      this.http.post('/api/execute_dangerous_query/', {
        query: this.dangerousQuery,
        databaseId: this.selectedConnectionId
      }, { headers }).subscribe({
        next: (response: any) => {
          console.log('Respuesta de consulta peligrosa:', response);
          let content: string;
          let sqlResult: string = ''; // Initialize with a default value
  
          if (response.result.message) {
            content = response.result.message;
            if (response.result.table_content) {
              sqlResult = '<p style="color: #4CAF50; margin-bottom: 10px;"><strong>✅ Consulta realizada con éxito.</strong> <br> Aquí tienes los cambios realizados:</p>' +
                this.createTable(response.result.table_content);
            }
          } else {
            content = 'Consulta peligrosa ejecutada con éxito.';
            sqlResult = '<p style="color: #4CAF50; margin-bottom: 10px;"><strong>✅ Consulta realizada con éxito.</strong> <br> Aquí tienes los cambios realizados:</p>' +
              this.createTable(response.result);
          }
  
          this.messages.push({
            role: 'assistant',
            content: content,
            sqlResult: this.sanitizer.bypassSecurityTrustHtml(sqlResult)
          });
          this.dangerousQuery = null;
          this.saveMessagesToLocalStorage();
        },
        error: (error) => {
          console.error('Error al ejecutar la consulta peligrosa:', error);
          this.messages.push({
            role: 'assistant',
            content: 'Error al ejecutar la consulta peligrosa: ' + (error.error.error || error.message)
          });
          this.saveMessagesToLocalStorage();
        }
      });
    }
  }
  
  
  
  
  

  createBarChart(data: any) {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('No se pudo obtener el contexto del canvas');
      return;
    }

    const labels = data.rows.map((row: any) => row[data.columns[0]]);
    const values = data.rows.map((row: any) => row[data.columns[1]]);

    const config: ChartConfiguration = {
      type: 'bar' as ChartType,
      data: {
        labels: labels,
        datasets: [{
          label: data.columns[1],
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
    
    // Asegurarse de que el canvas es visible
    this.chartCanvas.nativeElement.style.display = 'block';
    
    // Actualizar el último mensaje con una referencia al gráfico
    this.messages[this.messages.length - 1].sqlResult = 'chart';
  }

  clearChat() {
    if (confirm('¿Estás seguro de que quieres borrar todo el historial del chat?')) {
      this.messages = [];
      localStorage.removeItem(`chat_messages_${this.databaseId}`);
      this.initializeChat(); // Reinicia el chat con el mensaje de bienvenida
    }
  }
  

  loadChatHistory() {
    if (this.messages.length > 0) return; // Si ya hay mensajes, no los sobrescribas
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  
    this.http.get(`/api/chat_view/?databaseId=${this.databaseId}`, { headers }).subscribe({
      next: (response: any) => {
        this.messages = response.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          sqlResult: msg.sql_result ? this.createTable(msg.sql_result) : undefined
        }));
        if (this.messages.length === 0) {
          this.initializeChat();
        }
      },
      error: (error) => {
        console.error('Error al cargar el historial del chat:', error);
        if (this.messages.length === 0) {
          this.initializeChat();
        }
      }
    });
  }

  deleteChat(chatId: string, event: Event) {
    event.stopPropagation(); // Evita que se active el chat al hacer clic en el botón de eliminar
    if (confirm('¿Estás seguro de que quieres eliminar este chat?')) {
      this.chats = this.chats.filter(chat => chat.id !== chatId);
      localStorage.removeItem(`chat_messages_${this.databaseId}_${chatId}`);
      this.saveChats();
      
      if (this.currentChatId === chatId) {
        if (this.chats.length > 0) {
          this.loadChat(this.chats[0].id);
        } else {
          this.createNewChat();
        }
      }
    }
  }

}
